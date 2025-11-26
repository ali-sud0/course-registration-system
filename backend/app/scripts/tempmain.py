# app/main.py
from sqlalchemy import text
from app.db import engine

def test_connection():
    try:
        with engine.connect() as conn:
            # Simple test query
            result = conn.execute(text("SELECT 1"))
            print("Connection successful! Result:", result.fetchone())
    except Exception as e:
        print("Connection failed!")
        print(e)

if __name__ == "__main__":
    test_connection()
