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
variable "fastapi_image_url" {}
variable "nextjs_image_url" {}

variable "JWT_SECRET" {
  type = string
}

variable "AWS_ACCESS_KEY_ID" {
  type = string
}

variable "AWS_SECRET_ACCESS_KEY" {
  type = string
}