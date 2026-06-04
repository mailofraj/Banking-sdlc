# Terraform Infra for AWS Fargate

This directory contains Terraform configuration to provision:
- ECR repository
- ECS cluster
- IAM role for task execution
- Application Load Balancer
- ECS Fargate service and task definition

Prerequisites:
- AWS CLI credentials available in environment or via `aws configure`.
- Terraform 1.2+ installed locally.

Basic usage:

```bash
cd infra/terraform
terraform init
terraform apply -var="aws_region=us-east-1" -var="image_url=123456789012.dkr.ecr.us-east-1.amazonaws.com/banking-sdlc:latest"
```

Notes:
- The configuration uses your account's default VPC and its subnets. For production, replace this with a dedicated VPC module.
- The `image_url` variable can be left empty to use the freshly created ECR repository with `:latest` tag.
