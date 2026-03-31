# RepMate: AI-Powered Fitness Tracker

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.4-green.svg)](https://spring.io/projects/spring-boot)
[![MediaPipe](https://img.shields.io/badge/AI-MediaPipe-orange.svg)](https://google.github.io/mediapipe/)
[![Privacy](https://img.shields.io/badge/Privacy-100%25_Local_Processing-purple.svg)]()

RepMate is a cutting-edge fitness tracking application designed to provide real-time feedback on your form and precisely count your repetitions natively in your browser. By leveraging computer vision and mathematical movement smoothing, RepMate acts as your digital personal trainer—no hardware required.

## Privacy Guarantee

RepMate is built with **absolute privacy** as a core principle.
1. **No Video Recording:** Your camera feed is processed ephemerally in local memory and instantly discarded.
2. **Abstract Storage:** The database securely stores only numerical statistics (e.g., *15 Reps, 92% Accuracy, 2.4s Average Speed*). **No image frames or video streams are ever saved, uploaded, or analyzed outside the active session.**

---

## Key Features

- **Real-Time AI Tracking:** Utilizing Google's MediaPipe architecture for low-latency, hyper-accurate pose estimating over WebSockets.
- **Exponential Moving Average (EMA) Integration:** Tracks joint angles using mathematical smoothing to eliminate jitter, false-positives, and camera glitches.
- **Posture Analysis:** Instant feedback on body alignment to prevent injury and enforce biological movement curves.
- **Multi-Exercise Support:** Currently supports Push-Ups, Squats, Bicep Curls, and Pull-Ups with dynamic logic mapping.
- **Professional Aesthetics:** Modern React frontend featuring Framer Motion micro-animations and a sleek dark theme utilizing Lucide precision iconography.
- **Gamified Consistency:** Built-in workout history, tracking metrics, and a dynamic daily streak system.

---

## Technology Stack

### Frontend Architecture
- **React 19 & Vite**: Ultra-fast component rendering and unbundled development environment.
- **Framer Motion**: Smooth, declarative UI transitions and layout animations.
- **Lucide React**: Clean, lightweight, professional symbols replacing native emojis.

### Backend Services
- **Spring Boot 3.4**: High-performance, secure REST API development framework.
- **Spring Security & JWT**: Stateless web tokens enforcing strict authorization schemas.
- **PostgreSQL**: Industry-standard robust relational database persistence.

### AI Processing Engine
- **Python 3.11 & FastAPI**: Asynchronous framework handling concurrent high-throughput WebRTC/WebSocket streams.
- **MediaPipe Pose**: High-fidelity holistic skeletal detection.
- **NumPy EMA Filtering**: Vector-based mathematical geometry calculations with applied moving average filters.

---

## Installation and Setup

### Prerequisites
Ensure your development environment contains:
- **Java 17+**
- **Node.js 18+**
- **Python 3.11+**
- **PostgreSQL 14+**

### 1. Spring Boot Backend
```bash
cd backend
# Database properties automatically default to localhost:5432
./mvnw spring-boot:run
```

### 2. React Desktop Frontend
```bash
cd frontend
npm install
npm run dev
# The UI will launch at http://localhost:5173
```

### 3. FastAPI AI Tracking Module
```bash
cd ai-module
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# Start the AI WebSocket listener
python app.py
```

---

## Usage
1. **Register** free of charge using the secure JWT authentication portal.
2. **Navigate** to the Workout section and select your target exercise in the dropdown.
3. **Position** your device camera horizontally capturing your full body and hit Start.
4. **Train.** RepMate's AI natively processes your joints and provides real-time form correction.
5. **Analyze** your sessions and track your daily progress streaks in the Dashboard.

*RepMate is distributed under the MIT License.*
