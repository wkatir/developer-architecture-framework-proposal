# Network Outputs
output "vpc_id" {
  description = "ID of the VPC"
  value       = module.networking.vpc_id
}

output "vpc_cidr_block" {
  description = "CIDR block of the VPC"
  value       = module.networking.vpc_cidr_block
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = module.networking.public_subnet_ids
}

output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value       = module.networking.private_subnet_ids
}

# Load Balancer Outputs
output "load_balancer_dns" {
  description = "DNS name of the load balancer"
  value       = module.compute.load_balancer_dns
  # TODO: Add sensitive flag if needed
}

output "load_balancer_zone_id" {
  description = "Zone ID of the load balancer"
  value       = module.compute.load_balancer_zone_id
}

# Database Outputs
output "database_endpoint" {
  description = "Database connection endpoint"
  value       = module.database.database_endpoint
  sensitive   = true
}

output "database_port" {
  description = "Database connection port"
  value       = module.database.database_port
}

# Messaging Outputs
output "message_queue_url" {
  description = "URL of the message queue"
  value       = module.messaging.queue_url
  sensitive   = true
}

output "message_queue_arn" {
  description = "ARN of the message queue"
  value       = module.messaging.queue_arn
}

# Secrets Outputs
output "secrets_manager_arn" {
  description = "ARN of the secrets manager"
  value       = module.secrets.secrets_arn
  sensitive   = true
}

# Application Outputs
output "application_url" {
  description = "URL to access the application"
  value       = "https://${module.compute.load_balancer_dns}"
}

# Security Outputs
output "security_group_ids" {
  description = "Security group IDs for application access"
  value = {
    app_sg      = module.compute.app_security_group_id
    db_sg       = module.database.db_security_group_id
    # TODO: Add additional security groups
  }
}

# Monitoring Outputs
output "cloudwatch_log_groups" {
  description = "CloudWatch log group names"
  value = {
    app_logs = module.compute.log_group_name
    # TODO: Add database and infrastructure log groups
  }
}

# Environment Information
output "environment_info" {
  description = "Environment configuration summary"
  value = {
    project_name = var.project_name
    environment  = var.environment
    region       = var.aws_region
    deployed_at  = timestamp()
  }
}

# TODO: Add cost estimation outputs
# TODO: Add backup and disaster recovery outputs
# TODO: Add compliance and security scan outputs 