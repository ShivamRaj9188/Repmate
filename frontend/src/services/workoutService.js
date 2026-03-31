import api from './api'

/**
 * Create a new workout session — POST /api/sessions
 */
export const createSession = async (userId, exerciseType) => {
  const now = new Date().toISOString()
  const response = await api.post('/api/sessions', {
    user: { id: userId },
    exerciseType,
    startTime: now,
    status: 'IN_PROGRESS',
  })
  return response.data
}

/**
 * Mark a session as COMPLETED — PATCH /api/sessions/{id}/complete
 * Fix: previously sessions were forever stuck as IN_PROGRESS
 */
export const completeSession = async (sessionId) => {
  const response = await api.patch(`/api/sessions/${sessionId}/complete`)
  return response.data
}

/**
 * Get all sessions for a user — GET /api/sessions/user/{userId}
 */
export const getSessionsByUser = async (userId) => {
  const response = await api.get(`/api/sessions/user/${userId}`)
  return response.data
}

/**
 * Get a single session — GET /api/sessions/{id}
 */
export const getSessionById = async (sessionId) => {
  const response = await api.get(`/api/sessions/${sessionId}`)
  return response.data
}

/**
 * Save exercise metrics for a session — POST /api/metrics
 */
export const saveMetrics = async (sessionId, reps, avgSpeed, accuracy) => {
  const response = await api.post('/api/metrics', {
    session: { id: sessionId },
    reps,
    avgSpeed,
    accuracy,
  })
  return response.data
}

/**
 * Get metrics for a session — GET /api/metrics/session/{sessionId}
 */
export const getMetricsBySession = async (sessionId) => {
  const response = await api.get(`/api/metrics/session/${sessionId}`)
  return response.data
}

/**
 * Get the authenticated user's workout streak — GET /api/streaks/me
 */
export const getStreak = async () => {
  const response = await api.get('/api/streaks/me')
  return response.data
}
