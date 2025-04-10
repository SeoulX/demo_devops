# This file contains the variables for the Terraform configuration.
# It is used to set the values for the variables defined in the main.tf file.

# The variables are used to configure the AWS provider
aws_profile = "default"
aws_region  = "ap-southeast-1"

# The variables are used to configure the VPC
project_name    = "dtr-tracker"
vpc_cidr        = "10.16.0.0/16"
azs             = ["ap-southeast-1a", "ap-southeast-1b"]
public_subnets  = ["10.16.1.0/24", "10.16.2.0/24"]
private_subnets = ["10.16.3.0/24", "10.16.4.0/24"]

# The variables are used to configure the DynamoDB table
table_name1 = "InternsTable"
table_name2 = "DailyTimeRecordsTable"

# The variables are used to configure the ECS
fastapi_image_url = "docker.io/aadinnr/demo-exam-app:backend"
nextjs_image_url  = "docker.io/aadinnr/demo-exam-app:frontend"

JWT_SECRET            = "c1a53f5015fe24892ba7f5c7cc71b2e4e359666d1c424f9868d3993e3bf72e91"
AWS_ACCESS_KEY_ID     = ""
AWS_SECRET_ACCESS_KEY = ""