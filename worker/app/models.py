from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, Literal
from datetime import datetime

class Monitor(BaseModel):
    id: str = Field(alias="_id")
    userId: str
    name: str
    url: HttpUrl
    method: Literal["GET", "POST", "PUT", "DELETE"] = "GET"
    interval: int = 60
    timeout: int = 30
    isActive: bool = True
    currentStatus: Literal["up", "down", "unknown"] = "unknown"
    lastChecked: Optional[datetime] = None
    
    class Config:
        populate_by_name = True

class HealthCheckResult(BaseModel):
    monitorId: str
    status: Literal["up", "down"]
    statusCode: int
    responseTime: int  # milliseconds
    errorMessage: Optional[str] = None
    checkedAt: datetime = Field(default_factory=datetime.utcnow)

class HealthReportRequest(BaseModel):
    monitorId: str
    status: Literal["up", "down"]
    statusCode: int
    responseTime: int
    errorMessage: Optional[str] = None