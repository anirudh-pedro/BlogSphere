// api.js
export const API_BASE_URL = 'http://localhost:5000'; // Your backend API base URL

// Fetch with Authorization Token
export const fetchWithAuth = async (url, options = {}) => {
  const user = JSON.parse(localStorage.getItem('user')); // Get the stored user object
  const token = user?.token; // Extract the token

  if (!token) {
    throw new Error('No token found. Please log in again.');
  }

  // Add Authorization header to the request
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  // Make the fetch request
  const response = await fetch(API_BASE_URL + url, {
    ...options,
    headers, // Include the headers
  });

  if (!response.ok) {
    throw new Error('Request failed with status: ' + response.status);
  }

  return response.json(); // Return the response JSON object
};
