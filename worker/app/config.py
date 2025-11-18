import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # MongoDB Configuration
    MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/health-monitor")
    
    # Backend API Configuration
    BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:5000")
    HEALTH_REPORT_ENDPOINT = f"{BACKEND_URL}/api/health/report"
    
    # Worker Configuration
    CHECK_INTERVAL = int(os.getenv("CHECK_INTERVAL", 30))  # seconds
    MAX_WORKERS = int(os.getenv("MAX_WORKERS", 10))  # concurrent checks
    
    # HTTP Request Configuration
    DEFAULT_TIMEOUT = 30  # seconds
    USER_AGENT = "HealthMonitor-Worker/1.0"
    
    # Logging
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

settings = Settings()