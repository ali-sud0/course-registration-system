# app/main.py
from fastapi import FastAPI
from app.core.db import engine, Base
from app.routers import auth, protected, prerequisite, semester, course_offering, enrollment
from app.routers import course
from fastapi.middleware.cors import CORSMiddleware

import app.models

# print(">>> Creating tables...")
# print(">>> Known tables:", Base.metadata.tables.keys())

# create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CRS Backend with JWT Auth")

origins = [
    "http://127.0.0.1:5500",
    "http://localhost:5500"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # یا ["*"] برای اجازه همه
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(protected.router)
app.include_router(course.router)
app.include_router(prerequisite.router)
app.include_router(semester.router)
app.include_router(course_offering.router)
app.include_router(enrollment.router)