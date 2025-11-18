from fastapi import FastAPI, HTTPException
from contextlib import asynccontextmanager
import logging
import sys

from .config import settings
from .scheduler import MonitorScheduler

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)

# Global scheduler instance
scheduler = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events
    """
    # Startup
    global scheduler
    logger.info("🚀 Starting Health Monitor Worker Service...")
    logger.info(f"📊 MongoDB URI: {settings.MONGODB_URI}")
    logger.info(f"🔗 Backend URL: {settings.BACKEND_URL}")
    logger.info(f"⏱️ Check Interval: {settings.CHECK_INTERVAL} seconds")
    
    try:
        scheduler = MonitorScheduler()
        scheduler.start()
        logger.info("✅ Worker service started successfully")
    except Exception as e:
        logger.error(f"❌ Failed to start scheduler: {str(e)}")
        raise
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down Health Monitor Worker Service...")
    if scheduler:
        scheduler.stop()
    logger.info("✅ Worker service stopped")

# Create FastAPI app
app = FastAPI(
    title="Health Monitor Worker Service",
    description="Background worker for monitoring website/API health",
    version="1.0.0",
    lifespan=lifespan
)

@app.get("/")
def read_root():
    """Root endpoint"""
    return {
        "service": "Health Monitor Worker",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "scheduler_running": scheduler.scheduler.running if scheduler else False,
        "check_interval": settings.CHECK_INTERVAL
    }

@app.post("/trigger-check")
async def trigger_manual_check():
    """
    Manually trigger a health check cycle
    """
    if not scheduler:
        raise HTTPException(status_code=503, detail="Scheduler not initialized")
    
    try:
        logger.info("🔄 Manual health check triggered via API")
        scheduler.check_all_monitors()
        return {
            "success": True,
            "message": "Health check triggered successfully"
        }
    except Exception as e:
        logger.error(f"❌ Error triggering manual check: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats")
def get_stats():
    """
    Get worker statistics
    """
    if not scheduler:
        raise HTTPException(status_code=503, detail="Scheduler not initialized")
    
    try:
        monitors = scheduler.fetch_active_monitors()
        return {
            "active_monitors": len(monitors),
            "check_interval": settings.CHECK_INTERVAL,
            "max_workers": settings.MAX_WORKERS,
            "scheduler_running": scheduler.scheduler.running
        }
    except Exception as e:
        logger.error(f"❌ Error fetching stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))