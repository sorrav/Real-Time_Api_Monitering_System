# 🔍 Real-time API/URL Health Monitoring System

A full-stack microservice application for monitoring the health, performance, and uptime of websites and APIs in real-time.

## ✨ Features

### Core Functionality
- ✅ **Real-time Monitoring** - WebSocket-based live status updates
- 📊 **Performance Metrics** - Response time tracking and latency analysis
- 📈 **Interactive Charts** - Visual representation of historical data
- 🎯 **Smart Filtering** - Filter by status, favorites, and latency
- ⭐ **Favorites System** - Quick access to critical monitors
- ⏸️ **Pause/Resume** - Temporarily disable monitoring
- 🔔 **Status History** - Complete audit trail of all checks

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Socket.IO Client** for real-time updates
- **Axios** for HTTP requests
- **React Router** for navigation

### Backend
- **Node.js** with Express.js
- **Socket.IO** for WebSocket communication
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Bcrypt** for password hashing

### Worker Service
- **Python 3.8+**
- **FastAPI** framework
- **Requests** library for HTTP checks
- **APScheduler** for background tasks
- **PyMongo** for database operations

---
  
## 🏗️ Architecture
```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Frontend  │◄───────►│   Backend    │◄───────►│   MongoDB   │
│   (React)   │ Socket  │  (Node.js)   │         │    Atlas    │
│             │  .IO    │              │         │             │
└─────────────┘         └──────┬───────┘         └─────────────┘
                               │
                               │ HTTP
                               ▼
                        ┌──────────────┐
                        │    Worker    │
                        │   (Python)   │
                        │   FastAPI    │
                        └──────────────┘
```
---

## 🎨 Screenshots

<img width="1709" height="907" alt="Screenshot 2025-11-17 210146" src="https://github.com/user-attachments/assets/f432789c-1db8-44ed-9d34-efd38c2b799b" />

<img width="1575" height="837" alt="Screenshot 2025-11-17 210308" src="https://github.com/user-attachments/assets/0262040c-8bbe-485e-b8ee-6a3c8a525cf8" />

<img width="1691" height="853" alt="Screenshot 2025-11-17 210249" src="https://github.com/user-attachments/assets/6c10c2b6-9bef-4cc0-90a6-d94fa466c472" />

## 📝 Notes

- Make sure to replace MongoDB connection strings in `.env` files
- Default check interval is 30 seconds (configurable)
- JWT tokens expire after 7 days
- Health records older than 30 days are automatically deleted

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/health-monitoring-system.git
cd health-monitoring-system
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file
cat > .env << EOF
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key_min_32_characters
FRONTEND_URL=http://localhost:3000
WORKER_API_URL=http://localhost:8000
NODE_ENV=development
EOF
```

### 3. Worker Setup
```bash
cd ../worker
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt

# Create .env file
cat > .env << EOF
MONGODB_URI=your_mongodb_atlas_connection_string
BACKEND_URL=http://localhost:5000
CHECK_INTERVAL=30
MAX_WORKERS=10
LOG_LEVEL=INFO
EOF
```

### 4. Frontend Setup
```bash
cd ../frontend
npm install

# Create .env file
cat > .env << EOF
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
EOF
```
## 🎮 Running the Application

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

#### Terminal 2 - Worker
```bash
cd worker
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn app.main:app --reload --port 8000
```

#### Terminal 3 - Frontend
```bash
cd frontend
npm start
```
