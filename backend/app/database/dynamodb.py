import boto3
import os
from dotenv import load_dotenv

load_dotenv()

AWS_REGION = os.getenv("AWS_REGION", "ap-southeast-1")
DYNAMODB_TABLE_Main = "InternsTable"
DYNAMODB_TABLE_Record = "DailyTimeRecordsTable"

dynamodb = boto3.resource(
    "dynamodb",
    region_name=AWS_REGION,
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
)

table_main = dynamodb.Table(DYNAMODB_TABLE_Main)
table_record = dynamodb.Table(DYNAMODB_TABLE_Record)
