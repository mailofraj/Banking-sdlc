output "ecr_repository_url" {
  description = "ECR repository URL (Demo Bank)"
  value       = aws_ecr_repository.repo.repository_url
}

output "ecr_repository_sdlc_url" {
  description = "ECR repository URL (SDLC Dashboard)"
  value       = aws_ecr_repository.repo_sdlc.repository_url
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.cluster.name
}

output "ecs_service_bank" {
  description = "ECS service name (Demo Bank)"
  value       = aws_ecs_service.service.name
}

output "ecs_service_sdlc" {
  description = "ECS service name (SDLC Dashboard)"
  value       = aws_ecs_service.service_sdlc.name
}

output "demo_bank_url" {
  description = "Demo Bank — ALB URL (port 80)"
  value       = "http://${aws_lb.alb.dns_name}"
}

output "sdlc_dashboard_url" {
  description = "SDLC Dashboard — ALB URL (port 8080)"
  value       = "http://${aws_lb.alb.dns_name}:8080"
}
