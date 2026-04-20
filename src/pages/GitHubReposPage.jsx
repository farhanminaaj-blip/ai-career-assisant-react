import { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { RefreshCw, ExternalLink, Zap, AlertCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import GitHubConnectButton from '../components/ui/GitHubConnectButton';
import { getGitHubStatus } from '../services/githubOAuthService';
import { fetchWithAuth } from '../services/api';

const sortOptions = ['Most recent', 'Most stars', 'A → Z'];

function IconBox({ index }) {
  const icons = [
    'M4 5h16M4 12h8M4 19h16',
    'M6 5h12l-6 14L6 5zm0 0h12M6 5v14',
    'M4 8h16M4 12h16M4 16h16',
    'M6 5h12v14H6V5zm3 6h6',
  ];
  const path = icons[index % icons.length];
  return (
    <div className="w-8 h-8 rounded-lg bg-[rgba(0,163,255,0.12)] border border-[rgba(0,163,255,0.28)] flex items-center justify-center">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d={path} stroke="#00a3ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function GitHubReposPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { token } = useContext(AuthContext);

  // GitHub OAuth state
  const [isConnected, setIsConnected] = useState(false);
  const [githubUsername, setGithubUsername] = useState('');
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [statusError, setStatusError] = useState('');

  // Repo display state
  const [repos, setRepos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Most recent');
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [repoError, setRepoError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [selectedRepo, setSelectedRepo] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const [branchError, setBranchError] = useState('');

  // Check GitHub connection status on mount
  useEffect(() => {
    checkGitHubStatus();
  }, [token]);

  // Handle OAuth callback
  useEffect(() => {
    const error = searchParams.get('error');
    const connected = searchParams.get('connected');

    if (error) {
      setStatusError(decodeURIComponent(error));
    }

    if (connected) {
      checkGitHubStatus();
    }
  }, [searchParams]);

  const checkGitHubStatus = async () => {
    if (!token) return;

    try {
      setIsCheckingStatus(true);
      setStatusError('');
      const status = await getGitHubStatus(token);
      
      setIsConnected(status.isConnected);
      setGithubUsername(status.username || '');

      if (status.isConnected) {
        await fetchRepos(status.username);
      }
    } catch (err) {
      setStatusError(err.message || 'Failed to check GitHub connection');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const fetchRepos = async (username) => {
    if (!username) return;

    setIsLoadingRepos(true);
    setRepoError('');

    try {
      const response = await fetchWithAuth(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/github/oauth/repos/${username}`,
        {
          method: 'GET',
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || data.error || 'Failed to fetch repositories');
      }

      const data = await response.json();
      setRepos(data.repos || []);
    } catch (err) {
      setRepoError(err.message || 'Failed to fetch repositories');
      setRepos([]);
    } finally {
      setIsLoadingRepos(false);
    }
  };

  const handleRefresh = async () => {
    if (githubUsername) {
      setIsRefreshing(true);
      await fetchRepos(githubUsername);
      setIsRefreshing(false);
    }
  };

  const fetchBranches = async (repo) => {
    if (!repo || !githubUsername) return;

    setIsLoadingBranches(true);
    setBranchError('');
    setSelectedBranch('');
    setBranches([]);

    try {
      const response = await fetchWithAuth(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/github/oauth/repos/${githubUsername}/${repo.name}/branches`,
        {
          method: 'GET',
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || data.error || 'Failed to fetch branches');
      }

      const data = await response.json();
      setBranches(data.branches || []);
      if (data.branches?.length > 0) {
        setSelectedBranch(data.branches[0].name);
      }
    } catch (err) {
      setBranchError(err.message || 'Failed to load branches');
    } finally {
      setIsLoadingBranches(false);
    }
  };

  const handleSelectRepo = (repo) => {
    setSelectedRepo(repo);
    setSelectedBranch('');
    setBranchError('');
    setBranches([]);
    fetchBranches(repo);
  };

  const handleConnectionChange = (connected, username) => {
    setIsConnected(connected);
    setGithubUsername(username);
    if (connected) {
      fetchRepos(username);
    } else {
      setRepos([]);
      setSelectedRepo(null);
      setSelectedBranch('');
      setBranches([]);
    }
  };

  const filteredAndSorted = repos
    .filter((repo) => {
      const query = searchQuery.trim().toLowerCase();
      if (!query) return true;
      return (
        repo.name.toLowerCase().includes(query) ||
        (repo.description && repo.description.toLowerCase().includes(query))
      );
    })
    .sort((a, b) => {
      if (sortBy === 'Most recent') return new Date(b.updatedAt) - new Date(a.updatedAt);
      if (sortBy === 'Most stars') return (b.stars || 0) - (a.stars || 0);
      if (sortBy === 'A → Z') return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-[#e8edf5] flex flex-col">
      <main className="flex-1 bg-[#0a0e1a] p-5 overflow-y-auto">
        <div className="flex flex-col gap-5 max-w-6xl mx-auto">
          {/* GitHub Connection Section */}
          <div className="rounded-2xl border border-[rgba(0,163,255,0.15)] bg-[#111827] p-6">
            <h2 className="text-[17px] font-medium text-[#e8edf5] mb-2">GitHub Connection</h2>
            <p className="text-xs font-mono text-[#8a9bb5] mb-4">
              Connect your GitHub account to browse repositories and generate LinkedIn posts from your commits.
            </p>

            {statusError && (
              <div className="flex items-center gap-2 rounded-lg bg-[rgba(226,75,74,0.1)] p-3 mb-4 text-[#e24b4a]">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{statusError}</span>
              </div>
            )}

            {!isCheckingStatus && (
              <GitHubConnectButton
                isConnected={isConnected}
                username={githubUsername}
                token={token}
                onStatusChange={handleConnectionChange}
              />
            )}
          </div>

          {/* Repositories Section */}
          {isConnected && (
            <div className="rounded-2xl border border-[rgba(0,163,255,0.15)] bg-[#111827] p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-[17px] font-medium text-[#e8edf5]">Your Repositories</h2>
                  <p className="text-xs font-mono text-[#8a9bb5] mt-1">
                    {filteredAndSorted.length} of {repos.length} repositories
                  </p>
                </div>
                <div className="flex gap-2">
                  {repos.length > 0 && (
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search..."
                      className="h-[36px] rounded-lg bg-[#1a2236] border border-[rgba(0,163,255,0.15)] px-3 text-[12px] font-mono text-[#e8edf5] placeholder-[#4a5a72] outline-none focus:border-[#00a3ff]"
                    />
                  )}
                  {repos.length > 0 && (
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="h-[36px] rounded-lg bg-[#1a2236] border border-[rgba(0,163,255,0.15)] px-3 text-[12px] font-mono text-[#8a9bb5] outline-none appearance-none"
                    >
                      {sortOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  )}
                  {repos.length > 0 && (
                    <button
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      className="px-3 py-2 rounded-lg bg-[#1a2236] hover:bg-[#00a3ff] text-[#8a9bb5] hover:text-[#0d1220] transition disabled:opacity-50"
                    >
                      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                  )}
                </div>
              </div>

              {/* Repositories List */}
              {isLoadingRepos ? (
                <div className="flex justify-center py-8">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#00a3ff] border-r-transparent"></div>
                </div>
              ) : repoError ? (
                <div className="rounded-lg bg-[rgba(226,75,74,0.1)] p-4 text-[#e24b4a]">
                  <p className="text-sm">{repoError}</p>
                </div>
              ) : filteredAndSorted.length > 0 ? (
                <>
                  <div className="space-y-3">
                    {filteredAndSorted.map((repo, idx) => (
                      <div
                        key={repo.id}
                        onClick={() => handleSelectRepo(repo)}
                        className="group rounded-2xl border border-[rgba(0,163,255,0.15)] bg-[#0d1220] p-4 hover:border-[rgba(0,163,255,0.3)] hover:bg-[rgba(0,163,255,0.05)] cursor-pointer transition"
                      >
                        <div className="flex items-start gap-3">
                          <IconBox index={idx} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-mono text-sm text-[#e8edf5] truncate font-medium">
                                {repo.owner}/{repo.name}
                              </h4>
                              <a
                                href={repo.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-[#8a9bb5] hover:text-[#00a3ff]"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                            <p className="text-xs text-[#8a9bb5] line-clamp-2">
                              {repo.description || 'No description'}
                            </p>
                            <div className="flex items-center gap-3 mt-3 flex-wrap">
                              {repo.language && (
                                <span className="text-[10px] font-mono text-[#4a5a72] bg-[#1a2236] px-2 py-1 rounded">
                                  {repo.language}
                                </span>
                              )}
                              <span className="text-[10px] font-mono text-[#4a5a72]">
                                ⭐ {repo.stars || 0}
                              </span>
                            </div>
                          </div>
                          <div className="text-[#00a3ff] group-hover:translate-x-1 transition">
                            <Zap className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedRepo && (
                    <div className="mt-6 rounded-2xl border border-[rgba(0,163,255,0.12)] bg-[#0b1321] p-4">
                      <div className="flex flex-col gap-3">
                        <div>
                          <p className="text-[13px] font-medium text-[#e8edf5]">Selected Repository</p>
                          <p className="text-xs text-[#8a9bb5] mt-1">
                            {selectedRepo.owner}/{selectedRepo.name}
                          </p>
                        </div>

                        <div>
                          <p className="text-[12px] uppercase tracking-[0.3em] text-[#4a5a72] mb-2">Choose Branch</p>
                          {isLoadingBranches ? (
                            <div className="inline-flex items-center gap-2 text-[#8a9bb5]">
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              Loading branches...
                            </div>
                          ) : branchError ? (
                            <div className="rounded-lg bg-[rgba(226,75,74,0.1)] p-3 text-[#e24b4a]">
                              {branchError}
                            </div>
                          ) : branches.length > 0 ? (
                            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                              {branches.map((branch) => (
                                <button
                                  key={branch.name}
                                  type="button"
                                  onClick={() => setSelectedBranch(branch.name)}
                                  className={`rounded-2xl border px-4 py-3 text-left text-xs font-mono transition ${
                                    selectedBranch === branch.name
                                      ? 'border-[#00a3ff] bg-[#0f1a34] text-[#e8edf5]'
                                      : 'border-[rgba(0,163,255,0.12)] bg-[#0d1220] text-[#8a9bb5] hover:border-[#00a3ff] hover:bg-[#0b1321]'
                                  }`}
                                >
                                  {branch.name}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-[#8a9bb5]">No branches found for this repository.</p>
                          )}
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-[11px] text-[#8a9bb5]">
                              Selected branch: <span className="text-[#e8edf5]">{selectedBranch || 'None'}</span>
                            </p>
                          </div>
                          <button
                            onClick={() => navigate('/dashboard/generate', {
                              state: { username: githubUsername, repo: selectedRepo.name, branch: selectedBranch || 'main' },
                            })}
                            disabled={!selectedBranch}
                            className="inline-flex items-center justify-center rounded-2xl bg-[#00a3ff] px-4 py-3 text-xs font-medium text-[#0d1220] transition hover:bg-[#0078d4] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Generate Post for this branch
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-xs font-mono text-[#8a9bb5]">No repositories match your search</p>
                </div>
              )}
            </div>
          )}

          {!isConnected && !isCheckingStatus && (
            <div className="rounded-2xl border-2 border-dashed border-[rgba(0,163,255,0.15)] bg-[rgba(0,163,255,0.05)] p-12 text-center">
              <Zap className="h-12 w-12 text-[rgba(0,163,255,0.3)] mx-auto mb-4" />
              <p className="text-sm font-mono text-[#8a9bb5]">
                Connect your GitHub account above to browse repositories
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default GitHubReposPage;
