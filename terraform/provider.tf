terraform {
  required_version = "1.11.2"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    bucket         = "terraform-tf-bucket-aws"
    key            = "terraform.tfstate"
    region         = "ap-southeast-1"
    dynamodb_table = "terraform-tf-lock-table-aws"
    encrypt        = true

  }
}

provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile
}
