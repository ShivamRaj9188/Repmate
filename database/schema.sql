-- User details and authentication
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Onboarding / questionnaire fields
    age INTEGER,
    height_cm NUMERIC(5,2),
    weight_kg NUMERIC(5,2),
    gender VARCHAR(20),
    fitness_goal VARCHAR(50),
    activity_level VARCHAR(50),
    diet_preference VARCHAR(50),
    equipment_access VARCHAR(50),
    workout_days_per_week INTEGER,
    onboarding_complete BOOLEAN DEFAULT FALSE
);

-- Workout sessions tracker
CREATE TABLE IF NOT EXISTS workout_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    exercise_type VARCHAR(100) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    status VARCHAR(50) DEFAULT 'IN_PROGRESS'
);

-- Per-rep or aggregated exercise metrics
CREATE TABLE IF NOT EXISTS exercise_metrics (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT REFERENCES workout_sessions(id) ON DELETE CASCADE,
    reps INTEGER DEFAULT 0,
    avg_speed NUMERIC(5,2),
    accuracy NUMERIC(5,2),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Gamification / Achievements table
CREATE TABLE IF NOT EXISTS achievements (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Streaks (Gamification feature)
CREATE TABLE IF NOT EXISTS user_streaks (
    user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_active_date DATE
);

-- Personalized diet plans
CREATE TABLE IF NOT EXISTS diet_plans (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tdee INTEGER,
    target_calories INTEGER,
    plan_json TEXT
);
