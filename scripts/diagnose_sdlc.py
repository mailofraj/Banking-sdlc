#!/usr/bin/env python3
"""
Diagnose SDLC Dashboard deployment issues
"""
import boto3
import json
from botocore.exceptions import ClientError

# AWS clients
ec2 = boto3.client('ec2', region_name='us-east-1')
ecs = boto3.client('ecs', region_name='us-east-1')
elbv2 = boto3.client('elbv2', region_name='us-east-1')
logs = boto3.client('logs', region_name='us-east-1')

CLUSTER = 'banking-sdlc-cluster'
SERVICE = 'banking-sdlc-dashboard-service'
ALB_NAME = 'banking-sdlc-cluster-alb'
LOG_GROUP = '/ecs/banking-sdlc-cluster-sdlc'

print("=" * 80)
print("SDLC Dashboard Diagnostic Report")
print("=" * 80)

# 1. Check ECS Service
print("\n1. ECS SERVICE STATUS")
print("-" * 80)
try:
    response = ecs.describe_services(cluster=CLUSTER, services=[SERVICE])
    service = response['services'][0] if response['services'] else None
    
    if service:
        print(f"Service Name: {service['serviceName']}")
        print(f"Status: {service['status']}")
        print(f"Desired Count: {service['desiredCount']}")
        print(f"Running Count: {service['runningCount']}")
        print(f"Pending Count: {service['pendingCount']}")
        
        # List deployments
        if service.get('deployments'):
            print(f"\nDeployments: {len(service['deployments'])}")
            for i, dep in enumerate(service['deployments']):
                print(f"  {i+1}. Task Definition: {dep['taskDefinition'].split('/')[-1]}")
                print(f"     Status: {dep['status']}")
                print(f"     Running: {dep['runningCount']}, Desired: {dep['desiredCount']}, Pending: {dep['pendingCount']}")
    else:
        print("ERROR: Service not found!")
except ClientError as e:
    print(f"ERROR: {e}")

# 2. Check ECS Tasks
print("\n2. ECS TASKS")
print("-" * 80)
try:
    task_response = ecs.list_tasks(cluster=CLUSTER, serviceName=SERVICE)
    task_arns = task_response.get('taskArns', [])
    
    if task_arns:
        print(f"Found {len(task_arns)} task(s)")
        tasks = ecs.describe_tasks(cluster=CLUSTER, tasks=task_arns)['tasks']
        
        for i, task in enumerate(tasks):
            print(f"\nTask {i+1}:")
            print(f"  ARN: {task['taskArn'].split('/')[-1]}")
            print(f"  Status: {task['lastStatus']}")
            print(f"  Desired Status: {task['desiredStatus']}")
            
            if task.get('stoppedReason'):
                print(f"  Stopped Reason: {task['stoppedReason']}")
            
            # Container status
            for container in task.get('containers', []):
                print(f"\n  Container: {container['name']}")
                print(f"    Image: {container.get('image', 'N/A')}")
                print(f"    Status: {container.get('lastStatus', 'N/A')}")
                if container.get('exitCode'):
                    print(f"    Exit Code: {container['exitCode']}")
                if container.get('reason'):
                    print(f"    Reason: {container['reason']}")
    else:
        print("ERROR: No tasks running for this service!")
except ClientError as e:
    print(f"ERROR: {e}")

# 3. Check Target Group Health
print("\n3. TARGET GROUP STATUS")
print("-" * 80)
try:
    tg_response = elbv2.describe_target_groups(Names=['banking-sdlc-cluster-sdlc-tg'])
    target_groups = tg_response['TargetGroups']
    
    if target_groups:
        tg = target_groups[0]
        print(f"Target Group: {tg['TargetGroupName']}")
        print(f"Port: {tg['Port']}")
        print(f"Protocol: {tg['Protocol']}")
        print(f"Health Check Port: {tg['HealthCheckProtocol']}:{tg.get('HealthCheckPort', 'traffic-port')}")
        print(f"Health Check Path: {tg['HealthCheckPath']}")
        print(f"Health Check Interval: {tg['HealthCheckIntervalSeconds']}s")
        print(f"Unhealthy Threshold: {tg['UnhealthyThreshold']}")
        print(f"Healthy Threshold: {tg['HealthyThreshold']}")
        
        # Check target health
        health_response = elbv2.describe_target_health(TargetGroupArn=tg['TargetGroupArn'])
        targets = health_response['TargetHealthDescriptions']
        
        print(f"\nTargets: {len(targets)}")
        for target in targets:
            print(f"\n  Target: {target['Target']['Id']}")
            print(f"    Port: {target['Target']['Port']}")
            print(f"    State: {target['TargetHealth']['State']}")
            if target['TargetHealth'].get('Reason'):
                print(f"    Reason: {target['TargetHealth']['Reason']}")
            if target['TargetHealth'].get('Description'):
                print(f"    Description: {target['TargetHealth']['Description']}")
    else:
        print("ERROR: Target group not found!")
except ClientError as e:
    print(f"ERROR: {e}")

# 4. Check ALB Listener
print("\n4. ALB LISTENER STATUS")
print("-" * 80)
try:
    lb_response = elbv2.describe_load_balancers(Names=[ALB_NAME])
    if lb_response['LoadBalancers']:
        alb = lb_response['LoadBalancers'][0]
        print(f"Load Balancer: {alb['LoadBalancerName']}")
        print(f"DNS Name: {alb['DNSName']}")
        print(f"State: {alb['State']['Code']}")
        
        listener_response = elbv2.describe_listeners(LoadBalancerArn=alb['LoadBalancerArn'])
        listeners = listener_response['Listeners']
        
        print(f"\nListeners: {len(listeners)}")
        for listener in listeners:
            print(f"\n  Port: {listener['Port']}/{listener['Protocol']}")
            for action in listener.get('DefaultActions', []):
                if action['Type'] == 'forward':
                    print(f"    Forwards to: {action['TargetGroupArn'].split(':')[-1]}")
    else:
        print("ERROR: ALB not found!")
except ClientError as e:
    print(f"ERROR: {e}")

# 5. Check CloudWatch Logs
print("\n5. CLOUDWATCH LOGS (RECENT)")
print("-" * 80)
try:
    log_response = logs.describe_log_streams(logGroupName=LOG_GROUP, orderBy='LastEventTime', descending=True, limit=5)
    if log_response['logStreams']:
        print(f"Log Streams: {len(log_response['logStreams'])}")
        for stream in log_response['logStreams'][:3]:
            print(f"\nStream: {stream['logStreamName']}")
            
            events_response = logs.get_log_events(logGroupName=LOG_GROUP, logStreamName=stream['logStreamName'], limit=5)
            events = events_response['events']
            
            if events:
                for event in events:
                    print(f"  {event['message'].strip()[:100]}")
            else:
                print("  [No events]")
    else:
        print("No log streams found!")
except ClientError as e:
    print(f"ERROR: {e}")

print("\n" + "=" * 80)
print("END OF DIAGNOSTIC REPORT")
print("=" * 80)
