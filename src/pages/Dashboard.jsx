import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { fetchWithAuth } from '../services/api';
import { Star } from 'lucide-react';

const Dashboard = () => {
  const { user, token } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPostsData = async () => {
      try {
        const response = await fetchWithAuth(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/posts`, {
          method: 'GET',
        });

        if (response.ok) {
          const data = await response.json();
          setPosts(data.posts || []);
        } else if (response.status === 401) {
          console.warn('Unauthorized: Please log in');
          setPosts([]);
        } else {
          console.error('Failed to fetch posts:', response.status);
          setPosts([]);
        }
      } catch (error) {
        console.error('Failed to fetch posts:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchPostsData();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Calculate real statistics from posts
  const totalPosts = posts.length;
  const uniqueRepos = new Set(posts.map(p => `${p.owner}/${p.repo}`)).size;
  const totalCommits = posts.reduce((sum, p) => sum + (p.commitSummary?.length || 0), 0);

  const statCards = [
    { label: 'POSTS GENERATED', value: totalPosts.toString(), delta: loading ? 'Loading...' : `${totalPosts} total` },
    { label: 'REPOS USED', value: uniqueRepos.toString(), delta: loading ? 'Loading...' : `${uniqueRepos} repos` },
    { label: 'COMMITS ANALYZED', value: totalCommits.toString(), delta: loading ? 'Loading...' : `${totalCommits} total` },
  ];

  const recentActivity = posts.slice(0, 4).map((post) => {
    const date = new Date(post.createdAt);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    let timeString = 'just now';
    if (diffMins > 0) timeString = `${diffMins}m ago`;
    if (diffHours > 0) timeString = `${diffHours}h ago`;
    if (diffDays > 0) timeString = `${diffDays}d ago`;

    return {
      repo: `${post.owner}/${post.repo}`,
      commits: `${post.commitSummary?.length || 0} commits`,
      time: timeString
    };
  });

  const modelUsage = [
    { name: 'llama-3.1-70b', percentage: 85 },
    { name: 'mistral-7b', percentage: 10 },
    { name: 'gemma-7b', percentage: 5 },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#0a0e1a] px-3 py-5 text-[#e8edf5]">
      <div className="rounded-3xl border border-[rgba(0,163,255,0.15)] bg-[#111827] p-6">
            <div className="mb-4">
              <h1 className="text-[22px] font-medium text-[#e8edf5]">Dashboard</h1>
              <p className="text-sm font-mono text-[#8a9bb5] mt-1">
                Welcome back, {user?.name ?? 'developer'}. Your workspace summary is below.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3 mb-6">
              {statCards.map((card) => (
                <div key={card.label} className="rounded-2xl border border-[rgba(0,163,255,0.15)] bg-[#0d1220] p-4">
                  <div className="font-mono text-[10px] tracking-[0.4px] text-[#4a5a72] uppercase mb-2">
                    {card.label}
                  </div>
                  <div className="text-[24px] font-medium text-[#e8edf5]">{card.value}</div>
                  <div className="font-mono text-[11px] text-[#00a3ff] mt-2">{card.delta}</div>
                </div>
              ))}
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.25fr_0.85fr]">
              <div className="rounded-2xl border border-[rgba(0,163,255,0.15)] bg-[#0d1220] p-5">
                <div className="font-mono text-[10px] tracking-[0.4px] text-[#4a5a72] uppercase mb-4">
                  Recent activity
                </div>
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#00a3ff] border-r-transparent"></div>
                <p className="mt-2 text-xs font-mono text-[#8a9bb5]">Loading posts...</p>
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.repo} className="rounded-2xl border border-[rgba(0,163,255,0.12)] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-mono text-sm text-[#e8edf5] truncate">{activity.repo}</div>
                      <div className="font-mono text-[11px] text-[#4a5a72]">{activity.time}</div>
                    </div>
                    <div className="mt-2 font-mono text-[11px] text-[#8a9bb5]">{activity.commits}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-xs font-mono text-[#8a9bb5]">No posts yet. Generate your first post to see it here.</p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[rgba(0,163,255,0.15)] bg-[#0d1220] p-5">
            <div className="font-mono text-[10px] tracking-[0.4px] text-[#4a5a72] uppercase mb-4">
              Model usage
            </div>
            <div className="space-y-4">
              {modelUsage.map((model) => (
                <div key={model.name}>
                  <div className="flex items-center justify-between text-[11px] text-[#e8edf5] mb-2">
                    <span>{model.name}</span>
                    <span className="text-[#4a5a72]">{model.percentage}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#0a1122] overflow-hidden">
                    <div className="h-full rounded-full bg-[#00a3ff]" style={{ width: `${model.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-[rgba(0,163,255,0.15)]">
              <div className="font-mono text-[10px] tracking-[0.4px] text-[#4a5a72] uppercase mb-2">API quota</div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs text-[#e8edf5]">Requests used</span>
                <span className="font-mono text-xs text-[#4a5a72]">504 / 1200</span>
              </div>
              <div className="h-2 rounded-full bg-[#0a1122] overflow-hidden">
                <div className="h-full rounded-full bg-[#00a3ff]" style={{ width: '42%' }} />
              </div>
              <div className="font-mono text-[10px] text-[#4a5a72] mt-1">42% used</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
