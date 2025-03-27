provider "aws" {
  region = "ap-southeast-1"
}
resource "aws_dynamodb_table" "interns" {
  name           = "InternsTable"
  billing_mode   = "PAY_PER_REQUEST"

  attribute {
    name = "intern_id"
    type = "S"
  }

  hash_key = "intern_id"

  tags = {
    Name        = "InternsTable"
    Environment = "Development"
  }
}
resource "aws_dynamodb_table" "daily_time_records" {
  name           = "DailyTimeRecordsTable"
  billing_mode   = "PAY_PER_REQUEST"

  attribute {
    name = "intern_id"
    type = "S"
  }

  attribute {
    name = "date"
    type = "S"
  }

  hash_key  = "intern_id"
  range_key = "date"

  tags = {
    Name        = "DailyTimeRecordsTable"
    Environment = "Development"
  }
}
