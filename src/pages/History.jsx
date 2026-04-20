import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Trash2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { getUserPosts, deletePost as deletePostApi } from '../services/api';

const History = () => {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetchPosts();
  }, [token]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getUserPosts();
      setPosts(data.posts || []);
    } catch (err) {
      setError(err.message || 'Failed to load history.');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };



  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await deletePostApi(postId);
      setPosts((currentPosts) => currentPosts.filter((p) => p._id !== postId));
    } catch (err) {
      setError(err.message || 'Failed to delete post');
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] text-[#e8edf5] flex items-center justify-center p-5">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#00a3ff] border-r-transparent"></div>
          <p className="mt-4 font-mono text-sm text-[#8a9bb5]">Loading posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] text-[#e8edf5] flex items-center justify-center p-5">
        <div className="w-full max-w-2xl rounded-2xl border border-[rgba(226,75,74,0.3)] bg-[rgba(226,75,74,0.1)] p-6">
          <p className="text-[#e24b4a] font-mono text-sm">{error}</p>
          <button
            onClick={fetchPosts}
            className="mt-4 px-3 py-2 bg-[#00a3ff] text-[#0d1220] rounded font-mono text-xs hover:bg-[#0088cc]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] text-[#e8edf5] flex items-center justify-center p-5">
        <div className="w-full max-w-2xl rounded-2xl border border-[rgba(0,163,255,0.15)] bg-[#111827] p-6 text-center">
          <p className="font-mono text-[#8a9bb5] mb-4">Please log in to view your history</p>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-[#00a3ff] text-[#0d1220] rounded font-mono text-xs"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] text-[#e8edf5] flex items-center justify-center p-5">
        <div className="w-full max-w-2xl rounded-2xl border border-[rgba(0,163,255,0.15)] bg-[#111827] p-6 text-center">
          <p className="font-mono text-[#8a9bb5] mb-4">No posts yet</p>
          <button
            onClick={() => navigate('/generate')}
            className="px-4 py-2 bg-[#00a3ff] text-[#0d1220] rounded font-mono text-xs"
          >
            Generate Post
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] px-3 py-5 text-[#e8edf5]">
      <div className="max-w-4xl mx-auto rounded-2xl border border-[rgba(0,163,255,0.15)] bg-[#111827] p-6">
        <h1 className="text-2xl font-medium mb-1">Post History</h1>
        <p className="text-xs font-mono text-[#8a9bb5] mb-6">{posts.length} posts saved</p>

        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post._id}
              className="rounded-xl border border-[rgba(0,163,255,0.15)] bg-[#0d1220] p-5"
            >
              <div className="flex justify-between items-start gap-4 mb-3">
                <div className="flex-1">
                  <p className="font-mono text-sm font-medium">
                    {post.owner}/{post.repo}
                  </p>
                  <p className="text-xs font-mono text-[#8a9bb5] mt-1">
                    {post.tone ? `Tone: ${post.tone}` : ''} • {formatDate(post.createdAt)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(post.post)}
                    className="p-2 rounded bg-[#1a2236] hover:bg-[#00a3ff] text-[#8a9bb5] hover:text-[#0d1220] transition"
                    title="Copy to clipboard"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(post._id)}
                    className="p-2 rounded bg-[#1a2236] hover:bg-[#e24b4a] text-[#8a9bb5] hover:text-white transition"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-[#8a9bb5] leading-relaxed line-clamp-2">
                {post.post}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default History;

