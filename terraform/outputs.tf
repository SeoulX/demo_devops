# VPC Outputs
output "vpc_id" {
  value = module.ttVPC.vpc_id
}

output "public_subnet_ids" {
  value = module.ttVPC.public_subnet_ids
}

output "private_subnet_ids" {
  value = module.ttVPC.private_subnet_ids
}

# DynamoDB Outputs
output "table_name1_arn" {
  value = module.Table.table_name1_arn
}

output "table_name2_arn" {
  value = module.Table.table_name2_arn
}