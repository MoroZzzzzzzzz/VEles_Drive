from fastapi import FastAPI, APIRouter
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
import httpx
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
from routes.messages import router as messages_router
from routes.reviews import router as reviews_router
from routes.compare import router as compare_router
from routes.payments import router as payments_router
from routes.webhooks import router as webhooks_router
from routes.leads import router as leads_router
from routes.verification import router as verification_router
from routes.advanced_search import router as search_router
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
api_router.include_router(messages_router)
api_router.include_router(reviews_router)
api_router.include_router(compare_router)
api_router.include_router(payments_router)
api_router.include_router(webhooks_router)
api_router.include_router(leads_router)
api_router.include_router(verification_router)
api_router.include_router(search_router)

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

# Proxy frontend requests
@app.get("/")
async def proxy_frontend_root():
    """Proxy root requests to the frontend server"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("http://localhost:3000/")
            return HTMLResponse(content=response.text)
    except Exception as e:
        return HTMLResponse(content="""
            <html>
                <head><title>VELES DRIVE</title></head>
                <body>
                    <h1>VELES DRIVE</h1>
                    <p>Frontend service is starting...</p>
                    <script>setTimeout(() => location.reload(), 2000);</script>
                </body>
            </html>
        """)

@app.get("/static/{path:path}")
async def proxy_static(path: str):
    """Proxy static file requests to the frontend server"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"http://localhost:3000/static/{path}")
            
            # Determine content type
            if path.endswith('.js'):
                content_type = "application/javascript"
            elif path.endswith('.css'):
                content_type = "text/css"
            elif path.endswith('.png'):
                content_type = "image/png"
            elif path.endswith('.jpg') or path.endswith('.jpeg'):
                content_type = "image/jpeg"
            else:
                content_type = "application/octet-stream"
            
            from fastapi import Response
            return Response(content=response.content, media_type=content_type)
    except Exception as e:
        return {"error": "Static file not found"}

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
