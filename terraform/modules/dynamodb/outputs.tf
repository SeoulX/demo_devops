output "table_name1_arn" {
  description = "Name of the first DynamoDB table"
  value       = aws_dynamodb_table.interns.arn
}

output "table_name2_arn" {
  description = "Name of the second DynamoDB table"
  value       = aws_dynamodb_table.daily_time_records.arn
}