variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "us-east-1"
}

variable "repository_name" {
  description = "ECR repository name"
  type        = string
  default     = "banking-sdlc"
}

variable "cluster_name" {
  description = "ECS cluster name"
  type        = string
  default     = "banking-sdlc-cluster"
}

variable "service_name" {
  description = "ECS service name"
  type        = string
  default     = "banking-sdlc-service"
}

variable "container_name" {
  description = "Container name used in task definition"
  type        = string
  default     = "banking-sdlc"
}

variable "container_port" {
  description = "Container port the app listens on"
  type        = number
  default     = 80
}

variable "desired_count" {
  description = "Desired number of tasks"
  type        = number
  default     = 1
}

variable "cpu" {
  description = "Task CPU"
  type        = number
  default     = 256
}

variable "memory" {
  description = "Task memory in MB"
  type        = number
  default     = 512
}

variable "image_url" {
  description = "Container image URI to deploy (ECR image)
Example: 123456789012.dkr.ecr.us-east-1.amazonaws.com/banking-sdlc:latest"
  type = string
  default = ""
}
