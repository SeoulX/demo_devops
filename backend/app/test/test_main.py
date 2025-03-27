from fastapi.testclient import TestClient
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
from app.main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/get_init")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to Intern DTR API"}
