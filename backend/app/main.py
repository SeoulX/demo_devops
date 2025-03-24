from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.auth.routes import router as auth_router

app = FastAPI(title="Intern DTR API", version="1.0")

app.include_router(auth_router, prefix="/1.0")

@app.get("/get_init")
async def root():
    return {"message": "Welcome to Intern DTR API"}
