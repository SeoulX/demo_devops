from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, Request
from app.models.user import UserRegister, UserLogin
from app.database.dynamodb import table_main, table_record
from app.auth.hashing import hash_password, verify_password
from app.auth.jwt_handler import create_access_token
from app.auth.jwt_handler import get_current_user
from boto3.dynamodb.conditions import Key, Attr
from decimal import Decimal

router = APIRouter()

@router.post("/register")
def register_user(user: UserRegister):
    response = table_main.get_item(Key={"intern_id": user.email})
    if "Item" in response:
        raise HTTPException(status_code=400, detail="User already exists")

    table_main.put_item(
        Item={
            "intern_id": user.email,
            "name": user.name,
            "surname": user.surname,
            "role": user.role,
            "password": hash_password(user.password),
            "approval": user.approval,
        }
    )
    return {"message": "User registered successfully"}

@router.post("/login")
def login_user(user: UserLogin):
    response = table_main.get_item(Key={"intern_id": user.email})
    if "Item" not in response:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    stored_user = response["Item"]
    if not verify_password(user.password, stored_user["password"]):
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    token = create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer", "role": stored_user["role"], "approval": stored_user["approval"]}

@router.get("/user")
def get_user_details(user: dict = Depends(get_current_user)):
    email = user
    response = table_main.get_item(Key={"intern_id": email})
    user_data = response.get("Item")
    
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_data.pop("password", None)

    return user_data

@router.post("/dtr/clock_in")
def clock_in(intern_id: dict = Depends(get_current_user)):
    date = datetime.now().strftime("%Y-%m-%d")
    
    existing_record = table_record.get_item(
        Key={
            "intern_id": intern_id,
            "date": date
        }
    )
    
    if "Item" in existing_record and "clock_in" in existing_record["Item"]:
        raise HTTPException(status_code=400, detail="You have already clocked in today.")
    
    table_record.put_item(
        Item={
            "intern_id": intern_id,
            "date": date,
            "clock_in": datetime.utcnow().isoformat(),
            "status": "Active"
        }
    )
    return {"message": "Clocked in successfully"}

@router.post("/dtr/check_clock_in&out")
def check_clock_in(intern_id: dict = Depends(get_current_user)):
    date = datetime.now().strftime("%Y-%m-%d")
        
    existing_record = table_record.get_item(
        Key={
            "intern_id": intern_id,
            "date": date
        }
    )
    if "Item" in existing_record:
        return HTTPException(status_code=400, detail=existing_record["Item"])
    
    return {"message": "You can clock in."}

@router.post("/dtr/clock_out")
def clock_out(intern_id: dict = Depends(get_current_user)):
    date = datetime.now().strftime("%Y-%m-%d")
    response = table_record.get_item(Key={"intern_id": intern_id, "date": date})
    dtr = response.get("Item")
    
    existing_record = table_record.get_item(
        Key={
            "intern_id": intern_id,
            "date": date
        }
    )

    if not dtr:
        raise HTTPException(status_code=404, detail="No clock-in record found")
    
    if "Item" in existing_record and "clock_out" in existing_record["Item"]:
        raise HTTPException(status_code=400, detail="You have already clocked out today.")
    
    try:
        clock_in_time = datetime.fromisoformat(str(dtr["clock_in"]))
    except ValueError:
        raise HTTPException(status_code=500, detail="Invalid clock-in time format")

    total_hours = (datetime.utcnow() - datetime.fromisoformat(dtr["clock_in"])).total_seconds() / 3600

    total_hours = float(round((datetime.utcnow() - clock_in_time).total_seconds() / 3600, 2))

    table_record.update_item(
        Key={"intern_id": intern_id, "date": date},
        UpdateExpression="SET clock_out = :clock_out, total_work_hours = :total_hours, #status = :status",
        ExpressionAttributeNames={
            "#status": "status"
        },
        ExpressionAttributeValues={
            ":clock_out": datetime.utcnow().isoformat(),
            ":total_hours": Decimal(str(total_hours)),
            ":status": "Completed"
        }
    )
    return {"message": "Clocked out successfully", "total_hours": total_hours}

@router.get("/dtr/record")
def get_dtr(intern_id: dict = Depends(get_current_user)):
    response = table_record.query(
        KeyConditionExpression=Key("intern_id").eq(intern_id)
    )
    return response.get("Items")

@router.get("/interns")
def get_all_interns():
    try:
        response = table_main.scan(FilterExpression=Attr("role").eq("Intern"))
        interns = response.get("Items", [])
                
        for intern in interns:
            intern.pop("password", None)
            response_time = table_record.scan(
                FilterExpression=Attr("intern_id").eq(intern["intern_id"])
            )
            intern["records"] = response_time.get("Items", [])
        
        return interns
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/interns/active_today")
def get_active_interns_today():
    try:
        today_date = datetime.now().strftime("%Y-%m-%d")
        
        response = table_main.scan(FilterExpression=Attr("role").eq("Intern"))
        interns = response.get("Items", [])
        active_interns = []
        
        for intern in interns:
            intern.pop("password", None)
            response_time = table_record.scan(
                FilterExpression=Attr("intern_id").eq(intern["intern_id"]) & 
                Attr("date").eq(today_date) &
                Attr("status").eq("Active")
            )
            records = response_time.get("Items", [])

            if records:
                intern["records"] = records
                active_interns.append(intern)

        return active_interns
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/interns/update_approval")
async def update_approval(request: Request):
    try:
        data = await request.json()
        intern_id = data.get("intern_id")
        approval = data.get("approval")
        response = table_main.get_item(Key={"intern_id": intern_id})
        if "Item" not in response:
            raise HTTPException(status_code=404, detail="Intern not found")

        table_main.update_item(
            Key={"intern_id": intern_id},
            UpdateExpression="SET #approval = :approval",
            ExpressionAttributeNames={
                "#approval": "approval"
            },
            ExpressionAttributeValues={":approval": approval}
        )

        return {"message": "Approval status updated successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

