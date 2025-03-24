from fastapi import APIRouter, HTTPException, Depends
from app.models.user import UserRegister, UserLogin
from app.database.dynamodb import table
from app.auth.hashing import hash_password, verify_password

router = APIRouter()

@router.post("/register")
def register_user(user: UserRegister):
    response = table.get_item(Key={"intern_id": user.email})
    if "Item" in response:
        raise HTTPException(status_code=400, detail="User already exists")

    table.put_item(
        Item={
            "intern_id": user.email,
            "name": user.name,
            "surname": user.surname,
            "role": user.role,
            "password": hash_password(user.password),
        }
    )
    return {"message": "User registered successfully"}

@router.post("/login")
def login_user(user: UserLogin):
    response = table.get_item(Key={"intern_id": user.email})
    if "Item" not in response:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    stored_user = response["Item"]
    if not verify_password(user.password, stored_user["password"]):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    return {"message": "Login successful"}
