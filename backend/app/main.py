from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.auth.routes import router as auth_router
from app.routes.protected import router as protected_router

app = FastAPI(title="Intern DTR API", version="1.0", root_path="/fastapi")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(protected_router, prefix="/auth")
app.include_router(auth_router, prefix="/api")


@app.get("/get_init")
async def root():
    return {"message": "Welcome to Intern DTR API"}
