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
