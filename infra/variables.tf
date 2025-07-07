# Project Configuration
variable "project_name" {
  description = "Name of the project used for resource naming"
  type        = string
  default     = "dfap"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
  
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

# Network Configuration
variable "allowed_cidrs" {
  description = "List of CIDR blocks allowed to access the infrastructure"
  type        = list(string)
  default     = ["10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16"]
  
  # TODO: Add validation for proper CIDR format
  # TODO: Consider adding description for each CIDR block
}

# Cloud Provider Configuration
variable "aws_region" {
  description = "AWS region for infrastructure deployment"
  type        = string
  default     = "us-west-2"
}

variable "azure_region" {
  description = "Azure region for infrastructure deployment"
  type        = string
  default     = "West US 2"
}

variable "gcp_region" {
  description = "GCP region for infrastructure deployment"
  type        = string
  default     = "us-west2"
}

# Database Configuration
variable "db_instance_class" {
  description = "Database instance class/size"
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "Database allocated storage in GB"
  type        = number
  default     = 20
}

# Application Configuration
variable "app_container_cpu" {
  description = "CPU units for application containers"
  type        = number
  default     = 256
}

variable "app_container_memory" {
  description = "Memory in MB for application containers"
  type        = number
  default     = 512
}

# Security Configuration
variable "enable_waf" {
  description = "Enable Web Application Firewall"
  type        = bool
  default     = true
}

variable "ssl_certificate_arn" {
  description = "ARN of SSL certificate for HTTPS"
  type        = string
  default     = ""
  
  # TODO: Add validation for ARN format
}

# Monitoring Configuration
variable "enable_detailed_monitoring" {
  description = "Enable detailed CloudWatch monitoring"
  type        = bool
  default     = false
}

variable "log_retention_days" {
  description = "CloudWatch logs retention period in days"
  type        = number
  default     = 30
}

# Tags
variable "common_tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default = {
    Project     = "DFAP"
    ManagedBy   = "Terraform"
    Environment = "dev"
  }
}

# TODO: Add backup configuration variables
# TODO: Add auto-scaling variables
# TODO: Add disaster recovery variables 