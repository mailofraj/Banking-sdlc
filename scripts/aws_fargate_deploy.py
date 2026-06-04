import os
import sys
import time
import uuid
import zipfile
import tempfile
from pathlib import Path
import json

import boto3
from botocore.exceptions import ClientError

ROOT = Path(__file__).resolve().parents[1]

AWS_REGION = os.getenv('AWS_REGION', 'us-east-1')
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')

if not AWS_ACCESS_KEY_ID or not AWS_SECRET_ACCESS_KEY:
    print('ERROR: AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY must be set in environment.')
    sys.exit(1)

ECR_REPO = os.getenv('ECR_REPOSITORY', 'banking-sdlc')
CLUSTER_NAME = os.getenv('ECS_CLUSTER', 'banking-sdlc-cluster')
SERVICE_NAME = os.getenv('ECS_SERVICE', 'banking-sdlc-service')
CONTAINER_NAME = os.getenv('CONTAINER_NAME', 'banking-sdlc')
CODEBUILD_PROJECT = os.getenv('CODEBUILD_PROJECT', 'banking-sdlc-build')
CODEBUILD_ROLE = os.getenv('CODEBUILD_ROLE', 'banking-sdlc-codebuild-role')
CODEBUILD_BUCKET = os.getenv('CODEBUILD_BUCKET')

session = boto3.Session(
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_REGION,
)

sts = session.client('sts')
account_id = sts.get_caller_identity()['Account']
print('AWS account:', account_id)

if not CODEBUILD_BUCKET:
    CODEBUILD_BUCKET = f'{ECR_REPO}-source-{account_id}-{uuid.uuid4().hex[:8]}'

print('Using S3 bucket:', CODEBUILD_BUCKET)

ecr = session.client('ecr')
iam = session.client('iam')
ec2 = session.client('ec2')
elbv2 = session.client('elbv2')
ecs = session.client('ecs')
s3 = session.client('s3')
logs = session.client('logs')
codebuild = session.client('codebuild')

REPOSITORY_URI = f'{account_id}.dkr.ecr.{AWS_REGION}.amazonaws.com/{ECR_REPO}'
IMAGE_TAG = os.getenv('IMAGE_TAG', 'latest')
IMAGE_URI = f'{REPOSITORY_URI}:{IMAGE_TAG}'


def ensure_ecr_repo():
    try:
        response = ecr.create_repository(repositoryName=ECR_REPO)
        repo_uri = response['repository']['repositoryUri']
        print('Created ECR repository:', repo_uri)
    except ClientError as exc:
        if exc.response['Error']['Code'] == 'RepositoryAlreadyExistsException':
            response = ecr.describe_repositories(repositoryNames=[ECR_REPO])
            repo_uri = response['repositories'][0]['repositoryUri']
            print('ECR repository already exists:', repo_uri)
        else:
            raise
    return repo_uri


def ensure_s3_bucket():
    try:
        s3.create_bucket(
            Bucket=CODEBUILD_BUCKET,
            CreateBucketConfiguration={'LocationConstraint': AWS_REGION} if AWS_REGION != 'us-east-1' else {},
        )
        print('Created S3 bucket:', CODEBUILD_BUCKET)
    except ClientError as exc:
        code = exc.response['Error']['Code']
        if code in ('BucketAlreadyOwnedByYou', 'BucketAlreadyExists'):
            print('S3 bucket already exists:', CODEBUILD_BUCKET)
        else:
            raise
    return CODEBUILD_BUCKET


def upload_source_zip():
    with tempfile.TemporaryDirectory() as tmpdir:
        zip_path = Path(tmpdir) / 'source.zip'
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for path in ROOT.rglob('*'):
                if path.is_file():
                    rel = path.relative_to(ROOT)
                    if rel.parts[0] == '.git':
                        continue
                    if path.match('*.pyc') or path.match('__pycache__/**'):
                        continue
                    zipf.write(path, arcname=str(rel))
        print('Uploading source zip to s3://%s/source.zip' % CODEBUILD_BUCKET)
        s3.upload_file(str(zip_path), CODEBUILD_BUCKET, 'source.zip')
    return 'source.zip'


def ensure_codebuild_role():
    trust_policy = {
        'Version': '2012-10-17',
        'Statement': [
            {
                'Effect': 'Allow',
                'Principal': {'Service': 'codebuild.amazonaws.com'},
                'Action': 'sts:AssumeRole',
            }
        ],
    }
    try:
        role = iam.create_role(
            RoleName=CODEBUILD_ROLE,
            AssumeRolePolicyDocument=json.dumps(trust_policy),
        )
        print('Created CodeBuild role:', CODEBUILD_ROLE)
    except ClientError as exc:
        if exc.response['Error']['Code'] == 'EntityAlreadyExists':
            role = iam.get_role(RoleName=CODEBUILD_ROLE)
            print('CodeBuild role already exists:', CODEBUILD_ROLE)
        else:
            raise
    role_arn = role['Role']['Arn']
    policy_arns = [
        'arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPowerUser',
        'arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess',
        'arn:aws:iam::aws:policy/CloudWatchLogsFullAccess',
    ]
    for policy_arn in policy_arns:
        try:
            iam.attach_role_policy(RoleName=CODEBUILD_ROLE, PolicyArn=policy_arn)
            print('Attached policy', policy_arn)
        except ClientError as exc:
            if exc.response['Error']['Code'] == 'EntityAlreadyExists':
                pass
            else:
                raise
    time.sleep(10)
    return role_arn


def create_codebuild_project(role_arn):
    buildspec = f"""
version: 0.2
phases:
  pre_build:
    commands:
      - echo Logging in to Amazon ECR...
      - aws --version
      - aws ecr get-login-password --region {AWS_REGION} | docker login --username AWS --password-stdin {REPOSITORY_URI}
  build:
    commands:
      - echo Building the Docker image...
      - docker build -t {IMAGE_URI} .
      - docker push {IMAGE_URI}
artifacts:
  files: []
"""
    source = {
        'type': 'S3',
        'location': f'{CODEBUILD_BUCKET}/source.zip',
        'buildspec': buildspec,
    }
    environment = {
        'type': 'LINUX_CONTAINER',
        'image': 'aws/codebuild/standard:7.0',
        'computeType': 'BUILD_GENERAL1_SMALL',
        'privilegedMode': True,
        'environmentVariables': [],
    }
    try:
        project = codebuild.create_project(
            name=CODEBUILD_PROJECT,
            source=source,
            artifacts={'type': 'NO_ARTIFACTS'},
            environment=environment,
            serviceRole=role_arn,
            timeoutInMinutes=60,
            queuedTimeoutInMinutes=120,
        )
        print('Created CodeBuild project:', CODEBUILD_PROJECT)
    except ClientError as exc:
        if exc.response['Error']['Code'] == 'ResourceAlreadyExistsException':
            project = codebuild.batch_get_projects(names=[CODEBUILD_PROJECT])['projects'][0]
            print('CodeBuild project already exists:', CODEBUILD_PROJECT)
            codebuild.update_project(
                name=CODEBUILD_PROJECT,
                source=source,
                environment=environment,
                serviceRole=role_arn,
                timeoutInMinutes=60,
                queuedTimeoutInMinutes=120,
            )
            print('Updated existing CodeBuild project')
        else:
            raise
    return project


def run_codebuild():
    print('Starting CodeBuild build for', CODEBUILD_PROJECT)
    build = codebuild.start_build(projectName=CODEBUILD_PROJECT)
    build_id = build['build']['id']
    while True:
        time.sleep(10)
        status = codebuild.batch_get_builds(ids=[build_id])['builds'][0]['buildStatus']
        print('CodeBuild status:', status)
        if status in ('SUCCEEDED', 'FAILED', 'FAULT', 'STOPPED', 'TIMED_OUT'):
            break
    if status != 'SUCCEEDED':
        raise RuntimeError(f'CodeBuild failed: {status}')
    print('CodeBuild succeeded')
    return build_id


def ensure_task_execution_role():
    role_name = f'{CLUSTER_NAME}-task-exec-role'
    trust_policy = {
        'Version': '2012-10-17',
        'Statement': [{
            'Effect': 'Allow',
            'Principal': {'Service': 'ecs-tasks.amazonaws.com'},
            'Action': 'sts:AssumeRole',
        }],
    }
    try:
        role = iam.create_role(RoleName=role_name, AssumeRolePolicyDocument=json.dumps(trust_policy))
        print('Created ECS task execution role:', role_name)
    except ClientError as exc:
        if exc.response['Error']['Code'] == 'EntityAlreadyExists':
            role = iam.get_role(RoleName=role_name)
            print('ECS task execution role already exists:', role_name)
        else:
            raise
    iam.attach_role_policy(RoleName=role_name, PolicyArn='arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy')
    print('Attached ECS task execution policy')
    return role['Role']['Arn']


def ensure_default_vpc():
    vpcs = ec2.describe_vpcs(Filters=[{'Name': 'isDefault', 'Values': ['true']}])['Vpcs']
    if not vpcs:
        raise RuntimeError('No default VPC found')
    return vpcs[0]['VpcId']


def get_default_subnets(vpc_id):
    subnets = ec2.describe_subnets(Filters=[{'Name': 'vpc-id', 'Values': [vpc_id]}])['Subnets']
    subnet_ids = [s['SubnetId'] for s in subnets if s['AvailableIpAddressCount'] > 0]
    if not subnet_ids:
        raise RuntimeError('No available subnets found')
    return subnet_ids[:2]


def ensure_security_groups(vpc_id):
    alb_name = f'{CLUSTER_NAME}-alb-sg'
    task_name = f'{CLUSTER_NAME}-task-sg'
    try:
        alb = ec2.create_security_group(
            GroupName=alb_name,
            Description='Allow HTTP from anywhere',
            VpcId=vpc_id,
        )
        alb_sg_id = alb['GroupId']
        ec2.authorize_security_group_ingress(GroupId=alb_sg_id, IpPermissions=[{
            'IpProtocol': 'tcp',
            'FromPort': 80,
            'ToPort': 80,
            'IpRanges': [{'CidrIp': '0.0.0.0/0'}],
        }])
        try:
            ec2.authorize_security_group_egress(GroupId=alb_sg_id, IpPermissions=[{
                'IpProtocol': '-1',
                'FromPort': 0,
                'ToPort': 0,
                'IpRanges': [{'CidrIp': '0.0.0.0/0'}],
            }])
        except ClientError as exc:
            if exc.response['Error']['Code'] != 'InvalidPermission.Duplicate':
                raise
        print('Created ALB security group', alb_sg_id)
    except ClientError as exc:
        if exc.response['Error']['Code'] == 'InvalidGroup.Duplicate':
            groups = ec2.describe_security_groups(Filters=[{'Name': 'group-name', 'Values': [alb_name]}, {'Name': 'vpc-id', 'Values': [vpc_id]}])['SecurityGroups']
            alb_sg_id = groups[0]['GroupId']
            print('ALB security group already exists', alb_sg_id)
        else:
            raise

    try:
        task = ec2.create_security_group(
            GroupName=task_name,
            Description='Allow traffic from ALB to ECS tasks',
            VpcId=vpc_id,
        )
        task_sg_id = task['GroupId']
        try:
            ec2.authorize_security_group_ingress(GroupId=task_sg_id, IpPermissions=[{
                'IpProtocol': 'tcp',
                'FromPort': 80,
                'ToPort': 80,
                'UserIdGroupPairs': [{'GroupId': alb_sg_id}],
            }])
        except ClientError as exc:
            if exc.response['Error']['Code'] != 'InvalidPermission.Duplicate':
                raise
        try:
            ec2.authorize_security_group_egress(GroupId=task_sg_id, IpPermissions=[{
                'IpProtocol': '-1',
                'FromPort': 0,
                'ToPort': 0,
                'IpRanges': [{'CidrIp': '0.0.0.0/0'}],
            }])
        except ClientError as exc:
            if exc.response['Error']['Code'] != 'InvalidPermission.Duplicate':
                raise
        print('Created task security group', task_sg_id)
    except ClientError as exc:
        if exc.response['Error']['Code'] == 'InvalidGroup.Duplicate':
            groups = ec2.describe_security_groups(Filters=[{'Name': 'group-name', 'Values': [task_name]}, {'Name': 'vpc-id', 'Values': [vpc_id]}])['SecurityGroups']
            task_sg_id = groups[0]['GroupId']
            print('Task security group already exists', task_sg_id)
        else:
            raise

    return alb_sg_id, task_sg_id


def ensure_load_balancer(subnets, sg_id):
    lb_name = f'{CLUSTER_NAME}-alb'
    try:
        response = elbv2.create_load_balancer(
            Name=lb_name,
            Subnets=subnets,
            SecurityGroups=[sg_id],
            Scheme='internet-facing',
            Type='application',
            IpAddressType='ipv4',
        )
        lb_arn = response['LoadBalancers'][0]['LoadBalancerArn']
        dns = response['LoadBalancers'][0]['DNSName']
        print('Created ALB', dns)
    except ClientError as exc:
        if exc.response['Error']['Code'] == 'DuplicateLoadBalancer':
            lbs = elbv2.describe_load_balancers(Names=[lb_name])['LoadBalancers']
            lb_arn = lbs[0]['LoadBalancerArn']
            dns = lbs[0]['DNSName']
            print('ALB already exists', dns)
        else:
            raise
    return lb_arn, dns


def ensure_target_group(vpc_id):
    tg_name = f'{CLUSTER_NAME}-tg'
    try:
        response = elbv2.create_target_group(
            Name=tg_name,
            Protocol='HTTP',
            Port=80,
            VpcId=vpc_id,
            TargetType='ip',
            HealthCheckProtocol='HTTP',
            HealthCheckPath='/',
            HealthCheckIntervalSeconds=30,
            HealthyThresholdCount=2,
            UnhealthyThresholdCount=2,
        )
        tg_arn = response['TargetGroups'][0]['TargetGroupArn']
        print('Created target group', tg_name)
    except ClientError as exc:
        if exc.response['Error']['Code'] == 'DuplicateTargetGroupName':
            tg_arn = elbv2.describe_target_groups(Names=[tg_name])['TargetGroups'][0]['TargetGroupArn']
            print('Target group already exists', tg_name)
        else:
            raise
    return tg_arn


def ensure_listener(lb_arn, tg_arn):
    listeners = elbv2.describe_listeners(LoadBalancerArn=lb_arn)['Listeners']
    if listeners:
        print('Listener already exists')
        return listeners[0]['ListenerArn']
    response = elbv2.create_listener(
        LoadBalancerArn=lb_arn,
        Protocol='HTTP',
        Port=80,
        DefaultActions=[{
            'Type': 'forward',
            'TargetGroupArn': tg_arn,
        }],
    )
    listener_arn = response['Listeners'][0]['ListenerArn']
    print('Created listener', listener_arn)
    return listener_arn


def ensure_ecs_cluster():
    try:
        ecs.create_cluster(clusterName=CLUSTER_NAME)
        print('Created ECS cluster', CLUSTER_NAME)
    except ClientError as exc:
        if exc.response['Error']['Code'] == 'ClusterAlreadyExistsException':
            print('ECS cluster already exists', CLUSTER_NAME)
        else:
            raise


def ensure_log_group():
    name = f'/ecs/{CLUSTER_NAME}'
    try:
        logs.create_log_group(logGroupName=name)
        print('Created CloudWatch log group', name)
    except ClientError as exc:
        if exc.response['Error']['Code'] == 'ResourceAlreadyExistsException':
            print('Log group already exists', name)
        else:
            raise
    return name


def register_task_definition(exec_role_arn, log_group):
    response = ecs.register_task_definition(
        family=CLUSTER_NAME,
        requiresCompatibilities=['FARGATE'],
        networkMode='awsvpc',
        cpu='256',
        memory='512',
        executionRoleArn=exec_role_arn,
        containerDefinitions=[{
            'name': CONTAINER_NAME,
            'image': IMAGE_URI,
            'essential': True,
            'portMappings': [{'containerPort': 80, 'hostPort': 80, 'protocol': 'tcp'}],
            'logConfiguration': {
                'logDriver': 'awslogs',
                'options': {
                    'awslogs-group': log_group,
                    'awslogs-region': AWS_REGION,
                    'awslogs-stream-prefix': CONTAINER_NAME,
                },
            },
        }],
    )
    print('Registered task definition revision', response['taskDefinition']['revision'])
    return response['taskDefinition']['taskDefinitionArn']


def ensure_service(task_definition_arn, subnets, sg_id, tg_arn):
    try:
        ecs.create_service(
            cluster=CLUSTER_NAME,
            serviceName=SERVICE_NAME,
            taskDefinition=task_definition_arn,
            desiredCount=1,
            launchType='FARGATE',
            networkConfiguration={
                'awsvpcConfiguration': {
                    'subnets': subnets,
                    'securityGroups': [sg_id],
                    'assignPublicIp': 'ENABLED',
                }
            },
            loadBalancers=[{
                'targetGroupArn': tg_arn,
                'containerName': CONTAINER_NAME,
                'containerPort': 80,
            }],
        )
        print('Created ECS service', SERVICE_NAME)
    except ClientError as exc:
        if exc.response['Error']['Code'] == 'ServiceAlreadyExistsException':
            ecs.update_service(
                cluster=CLUSTER_NAME,
                service=SERVICE_NAME,
                taskDefinition=task_definition_arn,
                forceNewDeployment=True,
            )
            print('Updated existing service and forced new deployment')
        else:
            raise


def main():
    repo_uri = ensure_ecr_repo()
    ensure_s3_bucket()
    upload_source_zip()
    role_arn = ensure_codebuild_role()
    create_codebuild_project(role_arn)
    run_codebuild()
    ensure_ecs_cluster()
    exec_role_arn = ensure_task_execution_role()
    vpc_id = ensure_default_vpc()
    subnets = get_default_subnets(vpc_id)
    alb_sg_id, task_sg_id = ensure_security_groups(vpc_id)
    lb_arn, lb_dns = ensure_load_balancer(subnets, alb_sg_id)
    tg_arn = ensure_target_group(vpc_id)
    ensure_listener(lb_arn, tg_arn)
    log_group = ensure_log_group()
    task_definition_arn = register_task_definition(exec_role_arn, log_group)
    ensure_service(task_definition_arn, subnets, task_sg_id, tg_arn)
    print('\nDeployment complete!')
    print('Application should be reachable at:', lb_dns)


if __name__ == '__main__':
    main()
