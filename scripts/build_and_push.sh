#!/usr/bin/env bash
set -euo pipefail

# Usage: ECR_REPOSITORY=my-repo AWS_REGION=us-east-1 AWS_ACCOUNT_ID=123456789012 IMAGE_TAG=latest ./scripts/build_and_push.sh
ECR_REPOSITORY=${ECR_REPOSITORY:-banking-sdlc}
AWS_REGION=${AWS_REGION:-us-east-1}
AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID:?set AWS_ACCOUNT_ID}
IMAGE_TAG=${IMAGE_TAG:-latest}

IMAGE_URI=${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}:${IMAGE_TAG}

echo "Logging in to ECR..."
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

echo "Building image ${IMAGE_URI}"
docker build -t ${IMAGE_URI} .

echo "Pushing image to ECR"
docker push ${IMAGE_URI}

echo "Image pushed: ${IMAGE_URI}"
