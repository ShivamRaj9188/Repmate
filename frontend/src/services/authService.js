import api from './api'

/**
 * Login — POST /api/auth/login
 * Returns: { token, id, email, name }
 */
export const login = async (email, password) => {
  const response = await api.post('/api/auth/login', { email, password })
  return response.data
}

/**
 * Register — POST /api/auth/register
 * Returns: { message }
 */
export const register = async (name, email, password) => {
  const response = await api.post('/api/auth/register', { name, email, password })
  return response.data
}
