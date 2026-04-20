import React, { useState } from 'react';
import { GitBranch, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { initiateGitHubOAuth, disconnectGitHub } from '../../services/githubOAuthService';

const GitHubConnectButton = ({ isConnected, username, token, onStatusChange }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConnect = async () => {
    setIsLoading(true);
    setError('');
    try {
      await initiateGitHubOAuth(token);
    } catch (err) {
      setError(err.message || 'Failed to initiate GitHub connection');
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    setError('');
    try {
      await disconnectGitHub(token);
      if (onStatusChange) {
        onStatusChange(false, null);
      }
    } catch (err) {
      setError(err.message || 'Failed to disconnect GitHub');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-red-400">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {isConnected ? (
        <div className="flex items-center justify-between rounded-lg border border-green-500/30 bg-green-500/10 p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div>
              <p className="text-sm font-medium text-green-300">Connected to GitHub</p>
              <p className="text-xs text-green-300/70">@{username}</p>
            </div>
          </div>
          <button
            onClick={handleDisconnect}
            disabled={isLoading}
            className="rounded-lg bg-red-600/20 px-4 py-2 text-xs font-medium text-red-300 hover:bg-red-600/30 disabled:opacity-50"
          >
            {isLoading ? <Loader className="h-4 w-4 animate-spin" /> : 'Disconnect'}
          </button>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-800 px-4 py-3 font-medium text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            <GitBranch className="h-4 w-4" />
          )}
          {isLoading ? 'Connecting...' : 'Connect GitHub'}
        </button>
      )}
    </div>
  );
};

export default GitHubConnectButton;
