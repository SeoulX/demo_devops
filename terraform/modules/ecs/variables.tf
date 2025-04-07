variable "project_name" {
  type = string
}
variable "dynamodb_table_arns" {
  type = list(string)
}
variable "aws_region" {}
variable "fastapi_image_url" {}
variable "nextjs_image_url" {}
variable "vpc_id" {}
variable "public_subnet_ids" {
  type = list(string)
}
variable "private_subnet_ids" {
  type = list(string)
}

variable "alb_sg_id" {
  description = "Security group ID of the ALB"
  type        = string
}

variable "alb_listener_arn" {
  description = "HTTP listener ARN for ECS service dependency"
  type        = string
}

variable "alb_target_group_arns" {
  description = "Target group ARNs for ECS services"
  type = object({
    fastapi = string
    nextjs  = string
  })
}
variable "JWT_SECRET" {
  type = string
}

variable "AWS_ACCESS_KEY_ID" {
  type = string
}

variable "AWS_SECRET_ACCESS_KEY" {
  type = string
}

variable "alb_dns_name" {
  description = "DNS name of the ALB"
  type        = string
}