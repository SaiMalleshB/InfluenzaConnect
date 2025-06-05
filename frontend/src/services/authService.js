import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL + '/auth/';
const CONNECT_API_URL = import.meta.env.VITE_API_BASE_URL + '/connect/'; // For social connections

// --- Cookie Helper Functions (setCookie, getCookie, eraseCookie) ---
// ... (These remain the same as in the previous version)
const setCookie = (name, value, days) => {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
};

const getCookie = (name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const eraseCookie = (name) => {
  document.cookie = name + '=; Max-Age=-99999999; path=/; SameSite=Lax';
};
// --- End Cookie Helper Functions ---

const register = async (userData) => { /* ... remains the same ... */
  try {
    const response = await axios.post(API_URL + 'register', userData);
    if (response.data && response.data.token) {
      setCookie('userToken', response.data.token, 30);
      setCookie('userInfo', JSON.stringify({
        _id: response.data._id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role,
      }), 30);
    }
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message || 'Registration failed';
  }
};
const login = async (userData) => { /* ... remains the same ... */
  try {
    const response = await axios.post(API_URL + 'login', userData);
    if (response.data && response.data.token) {
      setCookie('userToken', response.data.token, 30);
      setCookie('userInfo', JSON.stringify({
        _id: response.data._id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role,
      }), 30);
    }
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message || 'Login failed';
  }
};
const logout = () => { /* ... remains the same ... */
  eraseCookie('userToken');
  eraseCookie('userInfo');
};
const getMe = async () => { /* ... remains the same ... */
  const token = getCookie('userToken');
  if (!token) {
    return Promise.reject(new Error('No token found'));
  }
  try {
    const response = await axios.get(API_URL + 'me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
        eraseCookie('userToken');
        eraseCookie('userInfo');
    }
    throw error.response?.data?.message || error.message || 'Failed to fetch user details';
  }
};

// NEW: Function to initiate Google Sign-In by redirecting to backend
// The backend will handle the Google OAuth flow and redirect back to a frontend callback URL.
const googleLoginInitiate = () => {
  // The backend route '/api/auth/google' will redirect to Google's OAuth screen
  window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google`;
};


// NEW: Functions to initiate YouTube/Instagram connection
const connectYouTube = () => {
  // Use popup window for better UX
  const width = 600;
  const height = 600;
  const left = window.screen.width / 2 - width / 2;
  const top = window.screen.height / 2 - height / 2;
  
  const popup = window.open(
    `${CONNECT_API_URL}youtube`,
    'youtube_connect',
    `toolbar=no, location=no, directories=no, status=no, menubar=no, 
     scrollbars=no, resizable=no, copyhistory=no, 
     width=${width}, height=${height}, top=${top}, left=${left}`
  );

  // Check for popup closure/redirection
  const timer = setInterval(() => {
    if (popup.closed) {
      clearInterval(timer);
      window.location.reload(); // Refresh to get updated connection status
    }
  }, 500);
};

const handleDisconnectYouTube = async () => {
  try {
    await authService.disconnectYouTube();
    await fetchUserData();
    setFeedback({ message: 'YouTube disconnected', type: 'success' });
  } catch (error) {
    setFeedback({ message: 'Failed to disconnect', type: 'error' });
  }
};

// In authService.js
const disconnectYouTube = async () => {
  const token = getCookie('userToken');
  await axios.delete(`${CONNECT_API_URL}youtube`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

const connectInstagram = () => {
  window.location.href = `${CONNECT_API_URL}instagram`;
};


const authService = {
  register,
  login,
  logout,
  getMe,
  googleLoginInitiate, // Added
  connectYouTube,      // Added
  connectInstagram,    // Added
};
export default authService;
