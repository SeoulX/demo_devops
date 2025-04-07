import boto3
import os
from dotenv import load_dotenv

load_dotenv()

AWS_REGION = os.getenv("AWS_REGION")
DYNAMODB_TABLE_Main = "InternsTable"
DYNAMODB_TABLE_Record = "DailyTimeRecordsTable"

dynamodb = boto3.resource(
    "dynamodb",
    region_name=AWS_REGION,
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    endpoint_url=os.getenv("DYNAMODB_ENDPOINT_URL")
)

table_main = dynamodb.Table(DYNAMODB_TABLE_Main)
table_record = dynamodb.Table(DYNAMODB_TABLE_Record)
