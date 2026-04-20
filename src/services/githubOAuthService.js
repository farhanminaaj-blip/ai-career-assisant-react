/**
 * Frontend GitHub OAuth Service
 */

import { fetchWithAuth } from './api.js';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const initiateGitHubOAuth = async () => {
  try {
    const response = await fetchWithAuth(`${API_BASE}/api/github/oauth/auth`, {
      method: 'GET',
    });

    const data = await response.json();

    if (!response.ok) {
      const backendError = data?.error || response.statusText || 'GitHub auth initiation failed';
      throw new Error(backendError);
    }

    if (data.authUrl) {
      window.location.href = data.authUrl;
    } else {
      const backendError = data?.error || 'Failed to get GitHub auth URL';
      throw new Error(backendError);
    }
  } catch (error) {
    console.error('OAuth initiation error:', error);
    throw error;
  }
};

export const getGitHubStatus = async () => {
  try {
    const response = await fetchWithAuth(`${API_BASE}/api/github/oauth/status`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch GitHub status');
    }

    return response.json();
  } catch (error) {
    console.error('GitHub status error:', error);
    throw error;
  }
};

export const disconnectGitHub = async () => {
  try {
    const response = await fetchWithAuth(`${API_BASE}/api/github/oauth/disconnect`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to disconnect GitHub');
    }

    return response.json();
  } catch (error) {
    console.error('Disconnect error:', error);
    throw error;
  }
};
