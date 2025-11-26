# app/db.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

db_url = "mssql+pyodbc://sqluser:123456@localhost:1433/courseRegistrationSystem?driver=ODBC+Driver+17+for+SQL+Server"

engine = create_engine(db_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()