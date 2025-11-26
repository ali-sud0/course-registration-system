#app/scripts/test_connection.py
import sqlalchemy

DATABASE_URL = (
    "mssql+pyodbc://sql:123456@DESKTOP-J7P06MG\\SQL2016TRAINING/DATABASE_NAME?driver=ODBC+Driver+18+for+SQL+Server"
)

engine = sqlalchemy.create_engine(DATABASE_URL, fast_executemany=True)

try:
    with engine.connect() as conn:
        result = conn.execute("SELECT 1")
        print(result.fetchone())
except Exception as e:
    print("Connection failed:", e)
