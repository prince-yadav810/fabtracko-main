
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TOKEN_KEY = 'fabtracko_auth_token';

export interface AuthUser {
  id: string;
  username: string;
}

interface LoginResponse {
  message: string;
  token: string;
  user: AuthUser;
}

// Store token in localStorage
const setToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

// Get token from localStorage
const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

// Remove token from localStorage
const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

// Set auth token for axios
const setAuthHeader = () => {
  const token = getToken();
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Login
const login = async (username: string, password: string): Promise<AuthUser> => {
  try {
    console.log(`Attempting login with username: ${username}, API URL: ${API_URL}`);
    
    const response = await axios.post<LoginResponse>(
      `${API_URL}/auth/login`,
      { username, password }
    );
    
    console.log('Login API response:', response.data);
    
    const { token, user } = response.data;
    setToken(token);
    setAuthHeader();
    
    return user;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Login axios error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response) {
        throw new Error(error.response.data.message || 'Login failed');
      }
    } else {
      console.error('Login non-axios error:', error);
    }
    throw new Error('Login failed. Please try again.');
  }
};

// Logout
const logout = () => {
  removeToken();
  setAuthHeader();
};

// Check if user is authenticated
const isAuthenticated = (): boolean => {
  return !!getToken();
};

// Verify token and get current user
const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    setAuthHeader();
    const response = await axios.get(`${API_URL}/auth/verify`);
    return response.data.user;
  } catch (error) {
    console.error('Token verification error:', error);
    removeToken();
    return null;
  }
};

// Initialize authentication on app load
const initAuth = () => {
  setAuthHeader();
};

export const authService = {
  login,
  logout,
  isAuthenticated,
  getCurrentUser,
  getToken,
  initAuth
};

export default authService;
