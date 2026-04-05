import api from './api'

/**
 * Get the authenticated user's full profile (including onboarding data)
 * GET /api/users/profile/me
 */
export const getMyProfile = async () => {
  const response = await api.get('/api/users/profile/me')
  return response.data
}

/**
 * Submit onboarding questionnaire answers
 * PUT /api/users/profile
 */
export const updateProfile = async (profileData) => {
  const response = await api.put('/api/users/profile', profileData)
  return response.data
}

/**
 * Get the authenticated user's diet plan (or generate one)
 * GET /api/diet/plan
 */
export const getDietPlan = async () => {
  const response = await api.get('/api/diet/plan')
  return response.data
}

/**
 * Regenerate the diet plan
 * POST /api/diet/regenerate
 */
export const regenerateDietPlan = async () => {
  const response = await api.post('/api/diet/regenerate')
  return response.data
}

/**
 * Get streak history dates for heatmap
 * GET /api/streaks/me/history
 */
export const getStreakHistory = async () => {
  const response = await api.get('/api/streaks/me/history')
  return response.data
}
