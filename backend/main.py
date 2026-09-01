import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, SessionLocal
from models import Base
from routers import auth, projects, tasks, dashboard, team, users
from seed import seed_demo_data


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables (use alembic upgrade head for production)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed demo data
    async with SessionLocal() as session:
        await seed_demo_data(session)

    yield


app = FastAPI(
    title="ProjectFlow",
    description="Project management app with kanban boards and task tracking",
    version="1.0.0",
    lifespan=lifespan,
)


# Security headers middleware
@app.middleware("http")
async def security_headers_middleware(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "style-src 'self' 'unsafe-inline' fonts.googleapis.com; "
        "font-src 'self' fonts.gstatic.com"
    )
    return response


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(tasks.router)
app.include_router(dashboard.router)
app.include_router(team.router)
app.include_router(users.router)


@app.get("/api/health")
async def health():
    return {"status": "ok"}
