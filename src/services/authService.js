const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// API service for authentication
const authService = {
  async login(email, password, role) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      return data;
    } catch (error) {
      throw new Error(error.message || 'Network error');
    }
  },

  async getUsers() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/users`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch users');
      }

      return data;
    } catch (error) {
      throw new Error(error.message || 'Network error');
    }
  }
};

export default authService;