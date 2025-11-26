# app/main.py
from fastapi import FastAPI
from app.db import engine, Base
from app.routers import auth, protected

# create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CRS Backend with JWT Auth")

app.include_router(auth.router)
app.include_router(protected.router)
