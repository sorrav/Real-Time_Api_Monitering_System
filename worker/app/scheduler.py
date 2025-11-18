from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from pymongo import MongoClient
from datetime import datetime, timedelta
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List

from .config import settings
from .models import Monitor
from .health_checker import HealthChecker

logger = logging.getLogger(__name__)

class MonitorScheduler:
    def __init__(self):
        self.scheduler = BackgroundScheduler()
        self.health_checker = HealthChecker()
        self.executor = ThreadPoolExecutor(max_workers=settings.MAX_WORKERS)
        
        # MongoDB connection
        self.mongo_client = MongoClient(settings.MONGODB_URI)
        self.db = self.mongo_client.get_default_database()
        self.monitors_collection = self.db['monitors']
        
        logger.info(f"✅ Connected to MongoDB: {self.db.name}")
    
    def fetch_active_monitors(self) -> List[Monitor]:
        """
        Fetch all active monitors from MongoDB that need to be checked
        """
        try:
            # Calculate cutoff time based on check interval
            cutoff_time = datetime.utcnow() - timedelta(seconds=settings.CHECK_INTERVAL)
            
            # Query for active monitors that haven't been checked recently
            query = {
                'isActive': True,
                '$or': [
                    {'lastChecked': {'$lte': cutoff_time}},
                    {'lastChecked': None}
                ]
            }
            
            monitors_data = list(self.monitors_collection.find(query))
            
            monitors = []
            for data in monitors_data:
                try:
                    # Convert MongoDB ObjectId to string
                    data['_id'] = str(data['_id'])
                    data['userId'] = str(data['userId'])
                    
                    monitor = Monitor(**data)
                    monitors.append(monitor)
                except Exception as e:
                    logger.error(f"Error parsing monitor {data.get('_id')}: {str(e)}")
            
            logger.info(f"📋 Found {len(monitors)} active monitors to check")
            return monitors
            
        except Exception as e:
            logger.error(f"❌ Error fetching monitors from MongoDB: {str(e)}")
            return []
    
    def check_all_monitors(self):
        """
        Main job function that checks all active monitors
        """
        logger.info("🔄 Starting health check cycle...")
        
        monitors = self.fetch_active_monitors()
        
        if not monitors:
            logger.info("ℹ️ No monitors to check")
            return
        
        # Check monitors concurrently
        futures = []
        for monitor in monitors:
            future = self.executor.submit(self.check_single_monitor, monitor)
            futures.append(future)
        
        # Wait for all checks to complete
        completed = 0
        failed = 0
        
        for future in as_completed(futures):
            try:
                success = future.result()
                if success:
                    completed += 1
                else:
                    failed += 1
            except Exception as e:
                logger.error(f"❌ Error in monitor check: {str(e)}")
                failed += 1
        
        logger.info(
            f"✅ Health check cycle complete: "
            f"{completed} successful, {failed} failed"
        )
    
    def check_single_monitor(self, monitor: Monitor) -> bool:
        """
        Check a single monitor and report results
        """
        try:
            # Perform health check
            result = self.health_checker.check_monitor(monitor)
            
            # Report to backend
            success = self.health_checker.report_to_backend(result)
            
            return success
            
        except Exception as e:
            logger.error(f"❌ Error checking monitor {monitor.name}: {str(e)}")
            return False
    
    def start(self):
        """
        Start the scheduler
        """
        # Run immediately on start
        logger.info("🚀 Running initial health check...")
        self.check_all_monitors()
        
        # Schedule recurring job
        self.scheduler.add_job(
            func=self.check_all_monitors,
            trigger=IntervalTrigger(seconds=settings.CHECK_INTERVAL),
            id='health_check_job',
            name='Health Check All Monitors',
            replace_existing=True
        )
        
        self.scheduler.start()
        logger.info(
            f"⏰ Scheduler started - checking every {settings.CHECK_INTERVAL} seconds"
        )
    
    def stop(self):
        """
        Stop the scheduler and cleanup
        """
        logger.info("🛑 Stopping scheduler...")
        self.scheduler.shutdown(wait=True)
        self.executor.shutdown(wait=True)
        self.health_checker.close()
        self.mongo_client.close()
        logger.info("✅ Scheduler stopped")