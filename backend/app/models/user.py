from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr

class UserRegister(BaseModel):
    name: str
    surname: str
    email: EmailStr
    role: str
    password: str
    approval: str

    def validate_role(self):
        if self.role not in ["Intern", "Admin"]:
            raise ValueError("Role must be 'Intern' or 'Admin'.")

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class DailyTimeRecord(BaseModel):
    intern_id: str
    date: str
    clock_in: Optional[datetime] = None
    clock_out: Optional[datetime] = None
    break_start: Optional[datetime] = None
    break_end: Optional[datetime] = None
    total_work_hours: Optional[float] = 0.0
    status: str = "Active"