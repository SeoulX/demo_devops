variable "aws_region" {
  type = string
}

variable "aws_profile" {
  type = string
}
variable "project_name" {
  type = string
}

variable "vpc_cidr" {
  type = string
}

variable "azs" {
  type = list(string)
}

variable "public_subnets" {
  type = list(string)
}

variable "private_subnets" {
  type = list(string)
}

variable "table_name1" {
  type = string
}
variable "table_name2" {
  type = string
}
variable "dynamodb_table_arns" {
  type = list(string)
}
variable "fastapi_image_url" {}
variable "nextjs_image_url" {}