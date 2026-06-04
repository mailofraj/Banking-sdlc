# SDLC Dashboard Timeout - Root Cause Analysis & Fix

## Problem
Dashboard at `http://banking-sdlc-cluster-alb-870845146.us-east-1.elb.amazonaws.com:8080` returns a timeout error.

## Root Causes Identified

### 1. **TARGET GROUP NAME MISMATCH (PRIMARY ISSUE)** ✅ FIXED
- **Terraform** defines the SDLC target group as: `banking-sdlc-cluster-sdlc-tg`
- **GitHub Actions** workflow tries to use: `sdlc-dashboard-tg`
- **Impact**: The ALB listener on port 8080 points to the Terraform-created target group, but the ECS service registers tasks with the wrongly-named target group created by Actions
- **Result**: Health checks fail because targets don't exist in the expected target group
- **Fix Applied**: Updated deploy.yml to use correct target group name

### 2. **Port Mapping Architecture (CORRECT)** ✓
- ALB listener on **port 8080** → forwards to SDLC target group on **port 80**
- Target group on **port 80** → connects to ECS tasks on **port 80**
- Container on **port 80** (nginx serves React app)
- This is correct for ALB routing

### 3. **Potential Secondary Issues to Monitor**

#### A. Health Check Configuration
- Health checks run on `GET /` expecting HTTP 200-399
- If React app doesn't respond immediately, health check fails
- Current config: 30s interval, 2 consecutive failures = unhealthy
- **Recommendation**: Check if React app is running and responding to root path

#### B. ECS Service Task Deployment
- SDLC service should have 1 running task
- If tasks are stuck in PENDING, check:
  - Image exists in ECR (`banking-sdlc-dashboard:${commit-sha}`)
  - IAM execution role has AmazonECSTaskExecutionRolePolicy
  - Security group allows outbound to ECR, CloudWatch Logs
  - Sufficient resources in cluster (256 CPU, 512 MB memory)

#### C. Dockerfile Build (Branch: sdlc-dashboard)
- Must build successfully in GitHub Actions
- Builds React app with `node ./node_modules/react-scripts/scripts/build.js`
- Serves via nginx:stable-alpine on port 80
- If build fails → image never pushed to ECR → service can't start

## Next Steps

1. **Verify the fix is applied** by checking commit on `main` branch
2. **Trigger redeployment** via GitHub Actions (`git push origin main`)
3. **Monitor CloudWatch Logs** for errors:
   - `/ecs/banking-sdlc-cluster-sdlc` (SDLC service logs)
4. **Check target group health** in AWS Console:
   - Ensure targets show as HEALTHY (not UNHEALTHY)
   - Verify target group name is `banking-sdlc-cluster-sdlc-tg`
5. **Check ECS service** for running tasks:
   - Service should have 1 running task
   - Task should show Container Status: RUNNING

## Quick Debugging Commands (requires AWS credentials)

```bash
# Check service status
aws ecs describe-services --cluster banking-sdlc-cluster --services banking-sdlc-dashboard-service --region us-east-1

# Check running tasks
aws ecs list-tasks --cluster banking-sdlc-cluster --service-name banking-sdlc-dashboard-service --region us-east-1

# Check target group health
aws elbv2 describe-target-health --target-group-arn "arn:aws:elasticloadbalancing:us-east-1:ACCOUNT-ID:targetgroup/banking-sdlc-cluster-sdlc-tg/*"

# View recent logs
aws logs tail /ecs/banking-sdlc-cluster-sdlc --follow --region us-east-1
```

## Files Modified
- `✅ .github/workflows/deploy.yml` - Fixed target group name in SDLC bootstrap section

