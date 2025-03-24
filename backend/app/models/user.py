from pydantic import BaseModel, EmailStr

class UserRegister(BaseModel):
    name: str
    surname: str
    email: EmailStr
    role: str
    password: str

    def validate_role(self):
        if self.role not in ["Intern", "Admin"]:
            raise ValueError("Role must be 'Intern' or 'Admin'.")

class UserLogin(BaseModel):
    email: EmailStr
    password: str
