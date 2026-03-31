-- User details and authentication
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workout sessions tracker
CREATE TABLE workout_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    exercise_type VARCHAR(100) NOT NULL, -- e.g. PUSHUP, SQUAT
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    status VARCHAR(50) DEFAULT 'IN_PROGRESS' -- COMPLETED, CANCELLED
);

-- Per-rep or aggregated exercise metrics
CREATE TABLE exercise_metrics (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT REFERENCES workout_sessions(id) ON DELETE CASCADE,
    reps INTEGER DEFAULT 0,
    avg_speed NUMERIC(5,2), -- in seconds per rep
    accuracy NUMERIC(5,2), -- percentage of 'GOOD' posture out of total reps
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Gamification / Achievements table
CREATE TABLE achievements (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Streaks (Gamification feature)
CREATE TABLE user_streaks (
    user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_active_date DATE
);
