import requests
import time
from typing import Optional
from datetime import datetime
from .models import Monitor, HealthCheckResult
from .config import settings
import logging

logger = logging.getLogger(__name__)

class HealthChecker:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': settings.USER_AGENT
        })
    
    def check_monitor(self, monitor: Monitor) -> HealthCheckResult:
        """
        Perform health check on a single monitor
        Returns HealthCheckResult with status, latency, and error info
        """
        logger.info(f"Checking monitor: {monitor.name} ({monitor.url})")
        
        start_time = time.time()
        
        try:
            # Perform HTTP request
            response = self.session.request(
                method=monitor.method,
                url=str(monitor.url),
                timeout=monitor.timeout,
                allow_redirects=True,
                verify=True  # Verify SSL certificates
            )
            
            # Calculate response time in milliseconds
            end_time = time.time()
            response_time = int((end_time - start_time) * 1000)
            
            # Determine status based on status code
            status = "up" if 200 <= response.status_code < 400 else "down"
            
            result = HealthCheckResult(
                monitorId=monitor.id,
                status=status,
                statusCode=response.status_code,
                responseTime=response_time,
                errorMessage=None if status == "up" else f"HTTP {response.status_code}",
                checkedAt=datetime.utcnow()
            )
            
            logger.info(
                f"✅ {monitor.name}: {status.upper()} - "
                f"{response.status_code} - {response_time}ms"
            )
            
            return result
            
        except requests.exceptions.Timeout:
            end_time = time.time()
            response_time = int((end_time - start_time) * 1000)
            
            logger.warning(f"⏱️ {monitor.name}: TIMEOUT after {response_time}ms")
            
            return HealthCheckResult(
                monitorId=monitor.id,
                status="down",
                statusCode=0,
                responseTime=response_time,
                errorMessage="Request timeout",
                checkedAt=datetime.utcnow()
            )
            
        except requests.exceptions.SSLError as e:
            end_time = time.time()
            response_time = int((end_time - start_time) * 1000)
            
            logger.error(f"🔒 {monitor.name}: SSL ERROR - {str(e)}")
            
            return HealthCheckResult(
                monitorId=monitor.id,
                status="down",
                statusCode=0,
                responseTime=response_time,
                errorMessage=f"SSL Error: {str(e)[:100]}",
                checkedAt=datetime.utcnow()
            )
            
        except requests.exceptions.ConnectionError as e:
            end_time = time.time()
            response_time = int((end_time - start_time) * 1000)
            
            logger.error(f"🔌 {monitor.name}: CONNECTION ERROR - {str(e)}")
            
            return HealthCheckResult(
                monitorId=monitor.id,
                status="down",
                statusCode=0,
                responseTime=response_time,
                errorMessage=f"Connection error: {str(e)[:100]}",
                checkedAt=datetime.utcnow()
            )
            
        except requests.exceptions.RequestException as e:
            end_time = time.time()
            response_time = int((end_time - start_time) * 1000)
            
            logger.error(f"❌ {monitor.name}: REQUEST ERROR - {str(e)}")
            
            return HealthCheckResult(
                monitorId=monitor.id,
                status="down",
                statusCode=0,
                responseTime=response_time,
                errorMessage=f"Request error: {str(e)[:100]}",
                checkedAt=datetime.utcnow()
            )
        
        except Exception as e:
            end_time = time.time()
            response_time = int((end_time - start_time) * 1000)
            
            logger.error(f"💥 {monitor.name}: UNEXPECTED ERROR - {str(e)}")
            
            return HealthCheckResult(
                monitorId=monitor.id,
                status="down",
                statusCode=0,
                responseTime=response_time,
                errorMessage=f"Unexpected error: {str(e)[:100]}",
                checkedAt=datetime.utcnow()
            )
    
    def report_to_backend(self, result: HealthCheckResult) -> bool:
        """
        Send health check result to the Node.js backend
        """
        try:
            response = self.session.post(
                settings.HEALTH_REPORT_ENDPOINT,
                json=result.model_dump(mode='json'),
                timeout=10
            )
            
            if response.status_code == 201:
                logger.debug(f"✅ Reported result for monitor {result.monitorId}")
                return True
            else:
                logger.error(
                    f"❌ Failed to report result: {response.status_code} - {response.text}"
                )
                return False
                
        except Exception as e:
            logger.error(f"❌ Error reporting to backend: {str(e)}")
            return False
    
    def close(self):
        """Close the session"""
        self.session.close()