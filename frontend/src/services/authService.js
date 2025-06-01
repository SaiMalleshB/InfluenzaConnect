import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL + '/auth/';

// Register user
const register = async (userData) => {
  try {
    const response = await axios.post(API_URL + 'register', userData);
    if (response.data && response.data.token) {
      // Store user and token (e.g., in localStorage or context)
      localStorage.setItem('userToken', response.data.token);
      localStorage.setItem('userInfo', JSON.stringify({
        _id: response.data._id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role,
      }));
    }
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message || 'Registration failed';
  }
};

// Login user
const login = async (userData) => {
  try {
    const response = await axios.post(API_URL + 'login', userData);
    if (response.data && response.data.token) {
      localStorage.setItem('userToken', response.data.token);
      localStorage.setItem('userInfo', JSON.stringify({
        _id: response.data._id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role,
      }));
    }
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message || 'Login failed';
  }
};

// Logout user
const logout = () => {
  localStorage.removeItem('userToken');
  localStorage.removeItem('userInfo');
  // Optionally, notify backend to invalidate token if maintaining a blacklist
};

// Get current user (example of an authenticated request)
const getMe = async () => {
  const token = localStorage.getItem('userToken');
  if (!token) {
    throw new Error('No token found');
  }
  try {
    const response = await axios.get(API_URL + 'me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message || 'Failed to fetch user details';
  }
};


const authService = {
  register,
  login,
  logout,
  getMe,
};

export default authService;