from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, Request
from app.models.user import UserRegister, UserLogin
# DynamoDB imports (commented out)
# from app.database.dynamodb import table_main, table_record
# from boto3.dynamodb.conditions import Key, Attr
# from decimal import Decimal

# MongoDB imports
from app.database.mongodb import users_collection, records_collection
from app.auth.hashing import hash_password, verify_password
from app.auth.jwt_handler import create_access_token
from app.auth.jwt_handler import get_current_user

router = APIRouter()

@router.post("/register")
def register_user(user: UserRegister):
    # DynamoDB code (commented out)
    # response = table_main.get_item(Key={"intern_id": user.email})
    # if "Item" in response:
    #     raise HTTPException(status_code=400, detail="User already exists")
    # 
    # table_main.put_item(
    #     Item={
    #         "intern_id": user.email,
    #         "name": user.name,
    #         "surname": user.surname,
    #         "role": user.role,
    #         "password": hash_password(user.password),
    #         "approval": user.approval,
    #     }
    # )
    # return {"message": "User registered successfully"}

    # MongoDB code
    existing_user = users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    user_data = {
        "email": user.email,
        "name": user.name,
        "surname": user.surname,
        "role": user.role,
        "password": hash_password(user.password),
        "approval": user.approval,
        "created_at": datetime.utcnow()
    }
    
    result = users_collection.insert_one(user_data)
    return {"message": "User registered successfully", "user_id": str(result.inserted_id)}

@router.post("/login")
def login_user(user: UserLogin):
    # DynamoDB code (commented out)
    # response = table_main.get_item(Key={"intern_id": user.email})
    # if "Item" not in response:
    #     raise HTTPException(status_code=400, detail="Invalid email or password")
    # 
    # stored_user = response["Item"]
    # if not verify_password(user.password, stored_user["password"]):
    #     raise HTTPException(status_code=400, detail="Invalid email or password")
    # 
    # token = create_access_token({"sub": user.email})
    # return {"access_token": token, "token_type": "bearer", "role": stored_user["role"], "approval": stored_user["approval"]}

    # MongoDB code
    stored_user = users_collection.find_one({"email": user.email})
    if not stored_user:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    if not verify_password(user.password, stored_user["password"]):
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    token = create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer", "role": stored_user["role"], "approval": stored_user["approval"]}

@router.get("/user")
def get_user_details(user: dict = Depends(get_current_user)):
    # DynamoDB code (commented out)
    # email = user
    # response = table_main.get_item(Key={"intern_id": email})
    # user_data = response.get("Item")
    # 
    # if not user_data:
    #     raise HTTPException(status_code=404, detail="User not found")
    # 
    # user_data.pop("password", None)
    # return user_data

    # MongoDB code
    email = user
    user_data = users_collection.find_one({"email": email})
    
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Convert ObjectId to string and remove password
    user_data["_id"] = str(user_data["_id"])
    user_data.pop("password", None)

    return user_data

@router.post("/dtr/clock_in")
def clock_in(intern_id: dict = Depends(get_current_user)):
    # DynamoDB code (commented out)
    # date = datetime.now().strftime("%Y-%m-%d")
    # 
    # existing_record = table_record.get_item(
    #     Key={
    #         "intern_id": intern_id,
    #         "date": date
    #     }
    # )
    # 
    # if "Item" in existing_record and "clock_in" in existing_record["Item"]:
    #     raise HTTPException(status_code=400, detail="You have already clocked in today.")
    # 
    # table_record.put_item(
    #     Item={
    #         "intern_id": intern_id,
    #         "date": date,
    #         "clock_in": datetime.utcnow().isoformat(),
    #         "status": "Active"
    #     }
    # )
    # return {"message": "Clocked in successfully"}

    # MongoDB code
    date = datetime.now().strftime("%Y-%m-%d")
    
    existing_record = records_collection.find_one({
        "intern_id": intern_id,
        "date": date
    })
    
    if existing_record and existing_record.get("clock_in"):
        raise HTTPException(status_code=400, detail="You have already clocked in today.")
    
    record_data = {
        "intern_id": intern_id,
        "date": date,
        "clock_in": datetime.utcnow(),
        "status": "Active",
        "created_at": datetime.utcnow()
    }
    
    result = records_collection.insert_one(record_data)
    return {"message": "Clocked in successfully", "record_id": str(result.inserted_id)}

@router.post("/dtr/check_clock_in&out")
def check_clock_in(intern_id: dict = Depends(get_current_user)):
    # DynamoDB code (commented out)
    # date = datetime.now().strftime("%Y-%m-%d")
    #     
    # existing_record = table_record.get_item(
    #     Key={
    #         "intern_id": intern_id,
    #         "date": date
    #     }
    # )
    # if "Item" in existing_record:
    #     return HTTPException(status_code=400, detail=existing_record["Item"])
    # 
    # return {"message": "You can clock in."}

    # MongoDB code
    date = datetime.now().strftime("%Y-%m-%d")
        
    existing_record = records_collection.find_one({
        "intern_id": intern_id,
        "date": date
    })
    
    if existing_record:
        # Convert ObjectId to string for JSON serialization
        existing_record["_id"] = str(existing_record["_id"])
        return existing_record
    
    return {"message": "You can clock in."}

@router.post("/dtr/clock_out")
def clock_out(intern_id: dict = Depends(get_current_user)):
    # DynamoDB code (commented out)
    # date = datetime.now().strftime("%Y-%m-%d")
    # response = table_record.get_item(Key={"intern_id": intern_id, "date": date})
    # dtr = response.get("Item")
    # 
    # existing_record = table_record.get_item(
    #     Key={
    #         "intern_id": intern_id,
    #         "date": date
    #     }
    # )
    # 
    # if not dtr:
    #     raise HTTPException(status_code=404, detail="No clock-in record found")
    # 
    # if "Item" in existing_record and "clock_out" in existing_record["Item"]:
    #     raise HTTPException(status_code=400, detail="You have already clocked out today.")
    # 
    # try:
    #     clock_in_time = datetime.fromisoformat(str(dtr["clock_in"]))
    # except ValueError:
    #     raise HTTPException(status_code=500, detail="Invalid clock-in time format")
    # 
    # total_hours = (datetime.utcnow() - datetime.fromisoformat(dtr["clock_in"])).total_seconds() / 3600
    # 
    # total_hours = float(round((datetime.utcnow() - clock_in_time).total_seconds() / 3600, 2))
    # 
    # table_record.update_item(
    #     Key={"intern_id": intern_id, "date": date},
    #     UpdateExpression="SET clock_out = :clock_out, total_work_hours = :total_hours, #status = :status",
    #     ExpressionAttributeNames={
    #         "#status": "status"
    #     },
    #     ExpressionAttributeValues={
    #         ":clock_out": datetime.utcnow().isoformat(),
    #         ":total_hours": Decimal(str(total_hours)),
    #         ":status": "Completed"
    #     }
    # )
    # return {"message": "Clocked out successfully", "total_hours": total_hours}

    # MongoDB code
    date = datetime.now().strftime("%Y-%m-%d")
    dtr = records_collection.find_one({"intern_id": intern_id, "date": date})

    if not dtr:
        raise HTTPException(status_code=404, detail="No clock-in record found")
    
    if dtr.get("clock_out"):
        raise HTTPException(status_code=400, detail="You have already clocked out today.")
    
    clock_in_time = dtr["clock_in"]
    total_hours = float(round((datetime.utcnow() - clock_in_time).total_seconds() / 3600, 2))

    records_collection.update_one(
        {"intern_id": intern_id, "date": date},
        {
            "$set": {
                "clock_out": datetime.utcnow(),
                "total_work_hours": total_hours,
                "status": "Completed"
            }
        }
    )
    return {"message": "Clocked out successfully", "total_hours": total_hours}

@router.get("/dtr/record")
def get_dtr(intern_id: dict = Depends(get_current_user)):
    # DynamoDB code (commented out)
    # response = table_record.query(
    #     KeyConditionExpression=Key("intern_id").eq(intern_id)
    # )
    # return response.get("Items")

    # MongoDB code
    records = list(records_collection.find({"intern_id": intern_id}))
    
    # Convert ObjectIds to strings for JSON serialization
    for record in records:
        record["_id"] = str(record["_id"])
    
    return records

@router.get("/interns")
def get_all_interns():
    try:
        # DynamoDB code (commented out)
        # response = table_main.scan(FilterExpression=Attr("role").eq("Intern"))
        # interns = response.get("Items", [])
        #         
        # for intern in interns:
        #     intern.pop("password", None)
        #     response_time = table_record.scan(
        #         FilterExpression=Attr("intern_id").eq(intern["intern_id"])
        #     )
        #     intern["records"] = response_time.get("Items", [])
        # 
        # return interns

        # MongoDB code
        interns = list(users_collection.find({"role": "Intern"}))
                
        for intern in interns:
            intern["_id"] = str(intern["_id"])
            intern.pop("password", None)
            
            # Get records for this intern
            records = list(records_collection.find({"intern_id": intern["email"]}))
            for record in records:
                record["_id"] = str(record["_id"])
            intern["records"] = records
        
        return interns
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/interns/active_today")
def get_active_interns_today():
    try:
        # DynamoDB code (commented out)
        # today_date = datetime.now().strftime("%Y-%m-%d")
        # 
        # response = table_main.scan(FilterExpression=Attr("role").eq("Intern"))
        # interns = response.get("Items", [])
        # active_interns = []
        # 
        # for intern in interns:
        #     intern.pop("password", None)
        #     response_time = table_record.scan(
        #         FilterExpression=Attr("intern_id").eq(intern["intern_id"]) & 
        #         Attr("date").eq(today_date) &
        #         Attr("status").eq("Active")
        #     )
        #     records = response_time.get("Items", [])
        # 
        #     if records:
        #         intern["records"] = records
        #         active_interns.append(intern)
        # 
        # return active_interns

        # MongoDB code
        today_date = datetime.now().strftime("%Y-%m-%d")
        
        interns = list(users_collection.find({"role": "Intern"}))
        active_interns = []
        
        for intern in interns:
            intern["_id"] = str(intern["_id"])
            intern.pop("password", None)
            
            # Get active records for today
            records = list(records_collection.find({
                "intern_id": intern["email"],
                "date": today_date,
                "status": "Active"
            }))
            
            for record in records:
                record["_id"] = str(record["_id"])

            if records:
                intern["records"] = records
                active_interns.append(intern)

        return active_interns
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/interns/update_approval")
async def update_approval(request: Request):
    try:
        # DynamoDB code (commented out)
        # data = await request.json()
        # intern_id = data.get("intern_id")
        # approval = data.get("approval")
        # response = table_main.get_item(Key={"intern_id": intern_id})
        # if "Item" not in response:
        #     raise HTTPException(status_code=404, detail="Intern not found")
        # 
        # table_main.update_item(
        #     Key={"intern_id": intern_id},
        #     UpdateExpression="SET #approval = :approval",
        #     ExpressionAttributeNames={
        #         "#approval": "approval"
        #     },
        #     ExpressionAttributeValues={":approval": approval}
        # )
        # 
        # return {"message": "Approval status updated successfully"}

        # MongoDB code
        data = await request.json()
        intern_id = data.get("intern_id")
        approval = data.get("approval")
        
        user = users_collection.find_one({"email": intern_id})
        if not user:
            raise HTTPException(status_code=404, detail="Intern not found")

        users_collection.update_one(
            {"email": intern_id},
            {"$set": {"approval": approval}}
        )

        return {"message": "Approval status updated successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

