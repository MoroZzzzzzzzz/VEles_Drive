from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path

# Import routes
from routes.auth import router as auth_router
from routes.vehicles import router as vehicles_router
from routes.dealers import router as dealers_router
from routes.favorites import router as favorites_router
from database import db

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create the main app
app = FastAPI(
    title="VELES DRIVE API",
    description="API для платформы продажи премиум автомобилей",
    version="1.0.0"
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Include all route modules
api_router.include_router(auth_router)
api_router.include_router(vehicles_router)
api_router.include_router(dealers_router)
api_router.include_router(favorites_router)

# Health check endpoint
@api_router.get("/")
async def root():
    return {
        "message": "VELES DRIVE API", 
        "version": "1.0.0",
        "status": "running"
    }

@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "database": "connected"
    }

# Include the router in the main app
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Database lifecycle events
@app.on_event("startup")
async def startup_db_client():
    await db.connect()
    logger.info("Connected to MongoDB")

@app.on_event("shutdown")
async def shutdown_db_client():
    await db.disconnect()
    logger.info("Disconnected from MongoDB")
