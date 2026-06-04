# Deployment to AWS Fargate

This document explains required AWS resources, secrets, and how to deploy this repo to AWS Fargate.

Required AWS resources (can be created manually, via Terraform/CloudFormation, or the AWS Console):
- ECR repository (name: `banking-sdlc`)
- ECS cluster
- ECS service (Fargate) and task execution role
- ALB/target group (optional) if you want external access

GitHub Secrets to configure (Repository settings → Secrets):
- `AWS_REGION` — e.g. `us-east-1`
- `AWS_ACCOUNT_ID` — your AWS account ID
- `AWS_ACCESS_KEY_ID` — access key with permissions to ECR, ECS, IAM
- `AWS_SECRET_ACCESS_KEY` — secret key
- `ECS_CLUSTER` — ECS cluster name
- `ECS_SERVICE` — ECS service name

Local build & push (example):
```bash
export AWS_ACCOUNT_ID=123456789012
export AWS_REGION=us-east-1
export ECR_REPOSITORY=banking-sdlc
export IMAGE_TAG=latest
./scripts/build_and_push.sh
```

Notes:
- The workflow at `.github/workflows/deploy.yml` runs on pushes to `main`.
- The `ecs/task-def.json` is a template used by the workflow; the action replaces the image.
- For infra-as-code, add Terraform/CloudFormation that creates ECR, ECS cluster, task role, and service. This repo currently contains templates to get started but does not provision infra automatically.
