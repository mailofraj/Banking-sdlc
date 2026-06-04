param(
  [string]$ECR_REPOSITORY = "banking-sdlc",
  [string]$AWS_REGION = "us-east-1",
  [Parameter(Mandatory=$true)][string]$AWS_ACCOUNT_ID,
  [string]$IMAGE_TAG = "latest"
)

$ImageUri = "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:$IMAGE_TAG"
Write-Host "Logging in to ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

Write-Host "Building image $ImageUri"
docker build -t $ImageUri .

Write-Host "Pushing image to ECR"
docker push $ImageUri

Write-Host "Image pushed: $ImageUri"
