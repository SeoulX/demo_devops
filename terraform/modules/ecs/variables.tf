variable "project_name" {
  type = string
}
variable "dynamodb_table_arns" {
  type = list(string)
}
variable "aws_region" {}
variable "fastapi_image_url" {}
variable "nextjs_image_url" {}