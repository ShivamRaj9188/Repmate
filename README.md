# RepMate: AI-Powered Fitness Tracker

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.4-green.svg)](https://spring.io/projects/spring-boot)
[![MediaPipe](https://img.shields.io/badge/AI-MediaPipe-orange.svg)](https://google.github.io/mediapipe/)
[![Privacy](https://img.shields.io/badge/Privacy-100%25_Local_Processing-purple.svg)]()

RepMate is a cutting-edge fitness tracking application designed to provide real-time feedback on your form and precisely count your repetitions natively in your browser. By leveraging computer vision and advanced Machine Learning pipelines, RepMate acts as your digital personal trainer—no hardware required.

## Privacy Guarantee

RepMate is built with **absolute privacy** as a core principle.
1. **No Video Recording:** Your camera feed is processed ephemerally in local memory and instantly discarded.
2. **Abstract Storage:** The database securely stores only numerical statistics (e.g., *15 Reps, 92% Accuracy, 2.4s Average Speed*). **No image frames or video streams are ever saved, uploaded, or analyzed outside the active session.**

---

## Advanced ML Form Classification Pipeline

RepMate's core strength lies in its dual-engine AI tracking module, which combines algorithmic heuristics with a robust Machine Learning classification system.

### 1. Pose Extraction & Smoothing
- **MediaPipe Headless Engine:** Extracts 33 skeletal landmarks at up to 30 FPS.
- **Exponential Moving Average (EMA):** Inter-frame jitter is mathematically smoothed using an alpha filter (0.35 threshold) ensuring joint angle calculations remain highly stable even in low-light conditions.
- **Debounced State Machine:** Evaluates `NEUTRAL`, `DOWN`, and `UP` movement phases with multi-frame debouncing to eliminate false positive repetition counting.

### 2. The Machine Learning Architecture
Instead of relying solely on hardcoded angle thresholds, RepMate evaluates human movement probabilistically using a **Random Forest Classifier**:
- **Temporal Sliding Window:** The model observes movement over a 5-frame moving window, rather than evaluating static individual frames. This allows the AI to understand velocity and trajectory over time.
- **22-Dimensional Feature Extraction:** For every window, the ML engine extracts high-level kinematic features:
  - **Mean Angles (6):** Base positional data for elbows, hips, and knees.
  - **Velocity (6):** First derivative of angles across the timeline, capturing concentric/eccentric speed.
  - **Stability / Variance (6):** Measures shakiness or control during the movement.
  - **Symmetry (3):** Absolute geometric differences between left and right hemispheres to detect imbalances.
  - **Movement Stage (1):** Contextual phase of the rep via the state machine.
- **Model Specifications:** Trained using Scikit-Learn's `RandomForestClassifier` (`n_estimators=50`, `max_depth=10`). The model outputs probabilistic certainty scores (e.g., "92% chance this is a perfect pushup form") using `predict_proba`.

### 3. Data Generation & Accuracy
Training robust fitness AI models usually requires thousands of hours of manually labeled video. RepMate bypassed this using programmatic **Synthetic Trajectory Generation**:
- Over **5,000 algorithmic full-rep trajectories** generated individually per exercise.
- Simulates perfect human form using smoothly bounded cosine curves.
- Intentionally injects **realistic human errors** via constrained Gaussian noise (e.g., sagging spines in pushups, shallow depth/half-reps in squats, asymmetric elbow flaring in pull-ups).
- **Validation:** Through random state cross-validation, the model achieves high categorical accuracy. The pipeline's reliance on relative joint angles and symmetry rather than absolute pixels allows it to handle varying human proportions gracefully.

---

## Additional Key Features

- **Real-Time Coaching Cues:** Heuristic rules layered on top of the ML model provide distinct text cues ("Aim for a 90° elbow bend", "Don't lock your elbows") and color-code the skeleton.
- **Personalized Diet Generation:** Automatically constructs custom 7-day meal plans based on individual body metrics, goals, and dietary preferences.
- **Curated Video Library:** Built-in access to high-quality workout tutorials and routines seamlessly integrated into the application dashboard.
- **Multi-Exercise Support:** Currently supports Push-Ups, Squats, Bicep Curls, and Pull-Ups with dynamic logic mapping.
- **Professional Aesthetics:** Modern React frontend featuring Framer Motion micro-animations and a sleek dark theme prioritizing Lucide precision iconography.
- **Gamified Consistency:** Built-in workout history, tracking metrics, and a dynamic milestone streak system to encourage daily activity.

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
- **Python 3.11 & FastAPI**: Asynchronous framework handling concurrent high-throughput continuous streams over WebSockets.
- **MediaPipe Pose**: High-fidelity holistic skeletal detection.
- **Scikit-Learn & NumPy**: The backbone of the model training engine and matrix mathematics.

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
1. **Register** free of charge using the secure JWT authentication portal and complete your profile onboarding metrics.
2. **Explore** the personalized Diet Plans and Curated Video Library generated from your health goals.
3. **Navigate** to the Workout section and select your target exercise.
4. **Position** your device camera horizontally capturing your full body and hit Start.
5. **Train.** RepMate's AI natively processes your joints and provides real-time ML-backed form correction.
6. **Analyze** your sessions and track your daily streak milestones over time in the Dashboard.
