variable "project_name" {
  type = string
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
