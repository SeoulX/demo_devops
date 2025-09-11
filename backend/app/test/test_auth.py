from fastapi.testclient import TestClient
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
from app.main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/fastapi/auth/protected")
    assert response.status_code == 401
    assert response.json() == {'detail': 'Not authenticated'}
