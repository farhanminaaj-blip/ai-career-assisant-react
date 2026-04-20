/**
 * Frontend API Service
 * 
 * ALL communication with backend goes through here.
 * Frontend never calls external APIs directly - all logic is on backend.
 * The backend handles: OpenAI, GitHub, data processing, API keys.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
console.log('[API] Base URL:', API_BASE);

const getToken = () => localStorage.getItem('token');
const getRefreshToken = () => localStorage.getItem('refreshToken');

const setAuthTokens = ({ token, refreshToken }) => {
  if (token) {
    localStorage.setItem('token', token);
  }
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }
};

const notifyAuthChange = () => {
  window.dispatchEvent(new Event('auth-changed'));
};

const clearAuthStorage = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  notifyAuthChange();
};

const getAuthHeaders = () => {
  const token = getToken();
  console.log('[API] Auth token present:', !!token);
  if (!token) return { 'Content-Type': 'application/json' };
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

const refreshAuthToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearAuthStorage();
    throw new Error('Session expired. Please log in again.');
  }

  const response = await fetch(`${API_BASE}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    clearAuthStorage();
    throw new Error(data.error || data.message || 'Session expired. Please log in again.');
  }

  setAuthTokens({ token: data.token, refreshToken: data.refreshToken });
  return data.token;
};

export const fetchWithAuth = async (url, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const init = {
    headers,
    ...options,
  };

  let response = await fetch(url, init);

  if (response.status === 401) {
    try {
      const newToken = await refreshAuthToken();
      init.headers.Authorization = `Bearer ${newToken}`;
      response = await fetch(url, init);
    } catch (refreshError) {
      throw new Error(refreshError.message || 'Session expired. Please log in again.');
    }
  }

  return response;
};

// ============================================
// AUTH API - Register/Login
// ============================================

export const registerUser = async ({ name, email, password }) => {
  const response = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to register');
  }

  return response.json();
};

export const loginUser = async ({ email, password }) => {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to login');
  }

  return response.json();
};

// ============================================
// POSTS API - Generate LinkedIn Posts
// ============================================

export const generatePost = async (payload) => {
  try {
    const response = await fetchWithAuth(`${API_BASE}/api/posts/generate`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || `HTTP ${response.status}: Failed to generate post`);
    }

    return data;
  } catch (error) {
    console.error('Generate post error:', error);
    throw error;
  }
};

export const getUserPosts = async () => {
  try {
    console.log('[API] Fetching GET /api/posts...');
    const response = await fetchWithAuth(`${API_BASE}/api/posts`, {
      method: 'GET',
    });

    console.log(`[API] GET /api/posts response status: ${response.status}`);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Endpoint not found at ' + API_BASE + '/api/posts. Verify backend is running and route is mounted.');
      }
      if (response.status === 401) {
        throw new Error('Please log in to view your post history.');
      }
      throw new Error(data.message || data.error || `HTTP ${response.status}`);
    }

    console.log('[API] GET /api/posts success, received', data.posts?.length || 0, 'posts');
    return data;
  } catch (error) {
    console.error('[API] Get posts error:', error);
    throw error;
  }
};

export const deletePost = async (postId) => {
  try {
    const response = await fetchWithAuth(`${API_BASE}/api/posts/${postId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Delete post error:', error);
    throw error;
  }
};

// ============================================
// PREFERENCES API
// ============================================

export const getPreferences = async () => {
  try {
    const response = await fetchWithAuth(`${API_BASE}/api/preferences`, {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get preferences error:', error);
    throw error;
  }
};

export const updatePreferences = async (preferences) => {
  try {
    const response = await fetchWithAuth(`${API_BASE}/api/preferences`, {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Update preferences error:', error);
    throw error;
  }
};

// ============================================
// GITHUB API - Fetch Repository Data
// ============================================

/**
 * Fetch user's GitHub repositories
 * @param {string} username - GitHub username
 * @returns {Promise<{success: boolean, username: string, repos: Array}>}
 */
export const getRepos = async (username) => {
  try {
    const response = await fetchWithAuth(`${API_BASE}/api/github/repos/${username}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.json();
      if (response.status === 404) {
        throw new Error(`GitHub user "${username}" not found`);
      }
      if (response.status === 429 || response.status === 403) {
        throw new Error('GitHub API rate limit exceeded. Try again later.');
      }
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Get repos error:', error);
    throw error;
  }
};

export const healthCheck = async () => {
  try {
    const response = await fetch(`${API_BASE}/health`, { method: 'GET' });

    if (!response.ok) {
      throw new Error(`Backend health check failed: HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Health check error:', error);
    throw error;
  }
};

export default {
  registerUser,
  loginUser,
  generatePost,
  getRepos,
  healthCheck,
};
