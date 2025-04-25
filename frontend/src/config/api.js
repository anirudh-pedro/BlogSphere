export const API_BASE_URL = 'http://localhost:5000';

export const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    },
    credentials: 'include'
  });

  if (response.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/signin';
    throw new Error('Please sign in to continue');
  }

  return response;
};