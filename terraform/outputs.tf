# VPC Outputs
output "vpc_id" {
  value = module.VPC.vpc_id
}

output "public_subnet_ids" {
  value = module.VPC.public_subnet_ids
}

output "private_subnet_ids" {
  value = module.VPC.private_subnet_ids
}

# DynamoDB Outputs
output "table_name1_arn" {
  value = module.Table.table_name1_arn
}

output "table_name2_arn" {
  value = module.Table.table_name2_arn
}

output "alb_dns_name" {
  value = module.ALB.alb_dns_name
}