# RepMate

RepMate is an AI-powered fitness tracking application designed to provide real-time feedback on user posture and rep counting during physical activities. By leveraging computer vision and machine learning, RepMate helps fitness enthusiasts maintain proper form and accurately track their progress without the need for manual logging.

## Project Overview

The project is divided into three primary modules:
1.  **Backend**: A Spring Boot application handling user data, authentication, and workout session storage.
2.  **Frontend**: A modern React-based user interface for live workout tracking and dashboard analytics.
3.  **AI Module**: A Python-based real-time pose detection and rep counting engine.

## Key Features

- **Real-Time AI Tracking**: Utilizing MediaPipe for precise pose estimation and rep counting.
- **Posture Analysis**: Instant feedback on body alignment to prevent injury and improve effectiveness.
- **Multiple Exercise Support**: Currently supports PUSHUP and SQUAT exercise types with automatic logic switching.
- **Progress Dashboard**: View cumulative statistics, recent sessions, and achievement milestones.
- **Workout History**: Detailed logs of every session including reps, accuracy, and average speed.
- **Streak System**: Gamified motivation through daily workout streaks.
- **Secure Authentication**: Stateless JWT-based authentication for secure user profile management.

## Technology Stack

### Frontend
- **React 19**: Modern UI library for building a responsive, stateful interface.
- **Vite**: High-performance frontend build tool.
- **Tailwind CSS 4**: Utility-first CSS framework for a sleek, dark-themed design.
- **Framer Motion**: Advanced animation library for smooth transitions and interactive elements.
- **Lucide React**: Professional-grade icon set.

### Backend
- **Spring Boot 3.4**: Core framework for building robust, scalable REST APIs.
- **Spring Security**: Integrated security framework for JWT-based auth and CORS management.
- **Spring Data JPA / Hibernate**: Data persistence layer for PostgreSQL.
- **Lombok**: Boilerplate reduction tool for cleaner Java code.
- **PostgreSQL**: Industry-standard relational database.

### AI Module
- **Python 3.11**: Primary language for computer vision and machine learning tasks.
- **FastAPI**: Lightweight framework for high-performance WebSockets.
- **MediaPipe**: Google’s framework for building multimodal applied machine learning pipelines.
- **OpenCV**: Open-source computer vision library for image processing.
- **NumPy**: Numerical computing for geometric calculations (angles, alignment).

## Project Structure

```text
├── RepMate/
│   ├── backend/        # Spring Boot REST API
│   ├── frontend/       # React + Vite Application
│   ├── ai-module/      # Python AI Engine
│   ├── database/       # (Optional) SQL scripts or configuration
│   └── docs/           # Project documentation and assets
```

## Installation and Setup

### Prerequisites
- **Java 17** or higher
- **Node.js 18** or higher (with npm)
- **Python 3.11** or higher
- **PostgreSQL 14** or higher

### 1. Backend Setup
1.  Navigate to the `backend` directory.
2.  Configure your database credentials in `src/main/resources/application.properties` or set environment variables.
3.  Ensure your `JAVA_HOME` is pointed to Java 17.
4.  Run the application using Maven:
    ```bash
    ./mvnw spring-boot:run
    ```

### 2. Frontend Setup
1.  Navigate to the `frontend` directory.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set the API and WebSocket URLs in a `.env` file:
    ```text
    VITE_API_URL=http://localhost:8080
    VITE_WS_URL=ws://localhost:8000
    ```
4.  Launch the development server:
    ```bash
    npm run dev
    ```

### 3. AI Module Setup
1.  Navigate to the `ai-module` directory.
2.  Create and activate a virtual environment:
    ```bash
    python -m venv venv
    source venv/bin/activate  # Or `venv\Scripts\activate` on Windows
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Start the FastAPI server:
    ```bash
    python app.py
    ```

## Usage

1.  **Register / Log In**: Use the Auth pages to create an account and manage your profile.
2.  **Start Workout**: Navigate to the Live Workout page, select an exercise (PUSHUP or SQUAT), and start the session.
3.  **Real-Time Tracking**: Align yourself in front of the camera. The AI will count reps and provide form feedback.
4.  **Save Session**: Click 'Stop & Save' to upload your progress to the dashboard.
5.  **View History**: Check the History page to analyze your performance and monitor your streaks.

## License

This project is licensed under the MIT License.
