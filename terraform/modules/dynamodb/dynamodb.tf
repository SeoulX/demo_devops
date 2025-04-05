resource "aws_dynamodb_table" "interns" {
  name         = var.table_name1
  billing_mode = "PAY_PER_REQUEST"

  attribute {
    name = "intern_id"
    type = "S"
  }

  hash_key = "intern_id"

  tags = {
    Name        = "${var.project_name}-interns"
  }
}

resource "aws_dynamodb_table" "daily_time_records" {
  name         = var.table_name2
  billing_mode = "PAY_PER_REQUEST"

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
    Name        = "${var.project_name}-daily_time_records"
  }
}