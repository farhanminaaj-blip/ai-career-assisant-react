import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Copy, RefreshCw, History, LinkedinIcon } from 'lucide-react';
import { generatePost } from '../services/api';
import ActionButton from '../components/ui/ActionButton';

const GeneratePost = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Input states
  const [username, setUsername] = useState('');
  const [repo, setRepo] = useState('');
  const [branch, setBranch] = useState('main');
  const [selectedModel, setSelectedModel] = useState('llama-3.1-70b-instruct');
  const [tone, setTone] = useState('professional');
  const [outputType, setOutputType] = useState('linkedin post');
  const [commitCount, setCommitCount] = useState('10');

  // Output states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPost, setGeneratedPost] = useState('');
  const [displayedPost, setDisplayedPost] = useState('');
  const [captions, setCaptions] = useState([]);
  const [tokenCount, setTokenCount] = useState(0);
  const [genTime, setGenTime] = useState(0);

  // UI states
  const [errors, setErrors] = useState({ username: '', repo: '' });
  const [toast, setToast] = useState({ show: false, message: '' });
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(null);
  const [alertError, setAlertError] = useState({ show: false, message: '', title: '' });

  // Clear errors on input
  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    if (errors.username) setErrors((prev) => ({ ...prev, username: '' }));
  };

  const handleRepoChange = (e) => {
    setRepo(e.target.value);
    if (errors.repo) setErrors((prev) => ({ ...prev, repo: '' }));
  };

  useEffect(() => {
    if (location.state?.repo) {
      setRepo(location.state.repo);
    }
    if (location.state?.username) {
      setUsername(location.state.username);
    }
    if (location.state?.branch) {
      setBranch(location.state.branch);
    }
  }, [location.state]);

  // Mock generate function
  const handleGenerate = async () => {
    // STEP 1: Validate input
    const newErrors = { username: '', repo: '' };
    if (!username.trim()) newErrors.username = 'GitHub username is required';
    if (!repo.trim()) newErrors.repo = 'Repository name is required';

    if (newErrors.username || newErrors.repo) {
      setErrors(newErrors);
      return;
    }

    setErrors({ username: '', repo: '' });
    setIsGenerating(true);
    setGeneratedPost('');
    setDisplayedPost('');
    setProgress(0);

    // STEP 2: Show progress during API call
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      const startTime = Date.now();
      
      // STEP 3: Fetch commits from GitHub and generate post via AI
      const result = await generatePost({
        owner: username.trim(),
        repo: repo.trim(),
        branch: branch || 'main',
        model: selectedModel,
        tone,
        outputType,
        commitCount,
      });

      const endTime = Date.now();
      const generationTime = ((endTime - startTime) / 1000).toFixed(2);

      if (!result.success) {
        throw new Error(result.message || 'Failed to generate post');
      }

      const post = result.post || '';
      const captions = result.captions || [];

      // STEP 4: Complete progress and display results
      setProgress(100);
      clearInterval(progressInterval);

      setGeneratedPost(post);
      setCaptions(captions);
      setTokenCount(result.commitSummary?.length * 50 || 300);
      setGenTime(parseFloat(generationTime));

      // STEP 5: Animate typing effect
      let i = 0;
      const typeInterval = setInterval(() => {
        setDisplayedPost(post.slice(0, i));
        i++;
        if (i > post.length) clearInterval(typeInterval);
      }, 8);

      // STEP 6: Post automatically saved to history via backend
      setToast({ show: true, message: '✓ Post generated & auto-saved to History!' });
      window.dispatchEvent(new Event('historyUpdated'));
      localStorage.setItem('historyUpdatedAt', Date.now().toString());
      setTimeout(() => setToast({ show: false, message: '' }), 2000);
    } catch (error) {
      console.error('❌ Error generating post:', error);
      let errorMsg = error.message || 'Failed to generate post';
      let errorTitle = 'Error Generating Post';
      
      // Improve error messages for common issues
      if (errorMsg.includes('404') || errorMsg.includes('not found')) {
        errorTitle = '❌ Repository Not Found';
        errorMsg = 'The repository could not be found.\n\nPlease check:\n• GitHub username is correct\n• Repository name exists\n• Repository is public';
      } else if (errorMsg.includes('rate limit')) {
        errorTitle = '⏱️ Rate Limit Exceeded';
        errorMsg = 'GitHub API rate limit exceeded.\n\nPlease wait a few minutes and try again.';
      } else if (errorMsg.includes('Failed to fetch') || errorMsg.includes('Network')) {
        errorTitle = '🌐 Network Error';
        errorMsg = 'Could not connect to the server.\n\nPlease check your internet connection and try again.';
      } else if (errorMsg.includes('401') || errorMsg.includes('Unauthorized')) {
        errorTitle = '🔒 Authentication Error';
        errorMsg = 'Your session may have expired.\n\nPlease log in again.';
      }
      
      // Show error in styled alert box
      setAlertError({ show: true, message: errorMsg, title: errorTitle });
      
      setGeneratedPost('');
      setDisplayedPost('');
      setCaptions([]);
    } finally {
      setIsGenerating(false);
      clearInterval(progressInterval);
    }
  };

  // Copy to clipboard
  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setToast({ show: true, message: `${type === 'post' ? 'Post' : 'Caption'} copied!` });
    setTimeout(() => {
      setCopied(null);
      setToast({ show: false, message: '' });
    }, 2000);
  };

  return (
    <div className="min-h-full bg-[#0a0e1a] text-[#e8edf5] overflow-y-auto p-5">
          <div className="max-w-[1400px] mx-auto flex flex-col gap-4">
            <div className="rounded-3xl border border-[rgba(0,163,255,0.15)] bg-[#111827] p-6">
          <div className="mb-4">
            <h1 className="text-[22px] font-medium text-[#e8edf5]">Generate LinkedIn Post from GitHub</h1>
            <p className="text-sm font-mono text-[#8a9bb5] mt-1">
              Analyze commits, generate a post, and save it directly to your history.
            </p>
          </div>

          <div className="grid grid-cols-[1fr_1.2fr] gap-4 min-h-[55vh]">
            <div className="bg-[#111827] border-0.5 border-[rgba(0,163,255,0.15)] rounded-xl p-5 flex flex-col gap-4">
              <div className="font-mono text-[10px] tracking-[0.5px] text-[#4a5a72] uppercase">Step 1: Select Repository</div>

              <div>
                <label className="block font-mono text-[11px] tracking-[0.4px] text-[#4a5a72] uppercase mb-2">
                  👤 GitHub Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  placeholder="e.g. torvalds"
                  className={`w-full h-[38px] bg-[#1a2236] border-0.5 rounded-lg px-3 font-mono text-xs text-[#e8edf5] placeholder-[#4a5a72] focus:outline-none focus:border-[#00a3ff] focus:ring-1 focus:ring-[rgba(0,163,255,0.10)] transition-all ${
                    errors.username ? 'border-[#e24b4a]' : 'border-[rgba(0,163,255,0.15)]'
                  }`}
                />
                {errors.username && <p className="font-mono text-[11px] text-[#e24b4a] mt-1">{errors.username}</p>}
                <p className="font-mono text-[10px] text-[#4a5a72] mt-1">🔗 Your GitHub username</p>
              </div>

              <div>
                <label className="block font-mono text-[11px] tracking-[0.4px] text-[#4a5a72] uppercase mb-2">
                  📦 Repository Name
                </label>
                <input
                  type="text"
                  value={repo}
                  onChange={handleRepoChange}
                  placeholder="e.g. linux"
                  className={`w-full h-[38px] bg-[#1a2236] border-0.5 rounded-lg px-3 font-mono text-xs text-[#e8edf5] placeholder-[#4a5a72] focus:outline-none focus:border-[#00a3ff] focus:ring-1 focus:ring-[rgba(0,163,255,0.10)] transition-all ${
                    errors.repo ? 'border-[#e24b4a]' : 'border-[rgba(0,163,255,0.15)]'
                  }`}
                />
                {errors.repo && <p className="font-mono text-[11px] text-[#e24b4a] mt-1">{errors.repo}</p>}
                <p className="font-mono text-[10px] text-[#4a5a72] mt-1">📝 Fetches the latest commits automatically</p>
              </div>

              <div>
                <label className="block font-mono text-[11px] tracking-[0.4px] text-[#4a5a72] uppercase mb-2">
                  🌿 Branch Name
                </label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="e.g. main"
                  className="w-full h-[38px] bg-[#1a2236] border-0.5 rounded-lg px-3 font-mono text-xs text-[#e8edf5] placeholder-[#4a5a72] focus:outline-none focus:border-[#00a3ff] focus:ring-1 focus:ring-[rgba(0,163,255,0.10)] transition-all border-[rgba(0,163,255,0.15)]"
                />
                <p className="font-mono text-[10px] text-[#4a5a72] mt-1">🔀 Select the repo branch used to fetch commits</p>
              </div>

              <div className="h-[1px] bg-[rgba(0,163,255,0.15)]" />

              <div className="font-mono text-[10px] tracking-[0.5px] text-[#4a5a72] uppercase">Step 2: Configure Post</div>

              <div>
                <label className="block font-mono text-[11px] tracking-[0.4px] text-[#4a5a72] uppercase mb-2">
                  AI Model
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full h-[38px] bg-[#1a2236] border-0.5 border-[rgba(0,163,255,0.15)] rounded-lg px-3 font-mono text-xs text-[#e8edf5] focus:outline-none focus:border-[#00a3ff] focus:ring-1 focus:ring-[rgba(0,163,255,0.10)] appearance-none cursor-pointer transition-all"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%238a9bb5' d='M1 1l5 5 5-5'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    paddingRight: '32px',
                  }}
                >
                  <option value="llama-3.1-70b-instruct">llama-3.1-70b-instruct</option>
                  <option value="mistral-7b-instruct">mistral-7b-instruct</option>
                  <option value="gemma-7b">gemma-7b</option>
                  <option value="codellama-70b">codellama-70b</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-[11px] tracking-[0.4px] text-[#4a5a72] uppercase mb-2">
                  Post Tone
                </label>
                <div className="flex gap-2 flex-wrap">
                  {['professional', 'casual', 'technical'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTone(t)}
                      className={`font-mono text-xs px-3 py-1 rounded-full cursor-pointer transition-all ${
                        tone === t
                          ? 'bg-[rgba(0,163,255,0.12)] border-0.5 border-[rgba(0,163,255,0.28)] text-[#00a3ff]'
                          : 'bg-[#1a2236] border-0.5 border-[rgba(0,163,255,0.15)] text-[#8a9bb5] hover:bg-[rgba(0,163,255,0.06)] hover:text-[#e8edf5]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] tracking-[0.4px] text-[#4a5a72] uppercase mb-2">
                  Output Type
                </label>
                <div className="flex gap-2 flex-wrap">
                  {['linkedin post', 'caption', 'thread'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setOutputType(type)}
                      className={`font-mono text-xs px-3 py-1 rounded-full cursor-pointer transition-all ${
                        outputType === type
                          ? 'bg-[rgba(0,163,255,0.12)] border-0.5 border-[rgba(0,163,255,0.28)] text-[#00a3ff]'
                          : 'bg-[#1a2236] border-0.5 border-[rgba(0,163,255,0.15)] text-[#8a9bb5] hover:bg-[rgba(0,163,255,0.06)] hover:text-[#e8edf5]'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] tracking-[0.4px] text-[#4a5a72] uppercase mb-2">
                  Commits to Analyze
                </label>
                <div className="flex gap-2 flex-wrap">
                  {['5', '10', '20', 'all'].map((count) => (
                    <button
                      key={count}
                      onClick={() => setCommitCount(count)}
                      className={`font-mono text-xs px-3 py-1 rounded-full cursor-pointer transition-all ${
                        commitCount === count
                          ? 'bg-[rgba(0,163,255,0.12)] border-0.5 border-[rgba(0,163,255,0.28)] text-[#00a3ff]'
                          : 'bg-[#1a2236] border-0.5 border-[rgba(0,163,255,0.15)] text-[#8a9bb5] hover:bg-[rgba(0,163,255,0.06)] hover:text-[#e8edf5]'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="mt-auto h-[40px] bg-[#00a3ff] hover:bg-[#0078d4] disabled:opacity-70 disabled:cursor-not-allowed text-white font-mono text-xs font-medium rounded-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Analyzing commits & generating...
                  </>
                ) : (
                  'Fetch Commits → Generate Post →'
                )}
              </button>

              {isGenerating && (
                <div className="h-[2px] bg-[#1a2236] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#00a3ff] rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>

            <div className="bg-[#111827] border-0.5 border-[rgba(0,163,255,0.15)] rounded-xl p-5 flex flex-col gap-3 min-h-0">
              <div>
                <div className="font-mono text-[10px] tracking-[0.5px] text-[#4a5a72] uppercase">🤖 AI Generated Post (Auto-saves to History)</div>
                <p className="text-[10px] text-[#4a5a72] mt-1">Uses NVIDIA Llama 3.8B to write from commit analysis</p>
              </div>

              {generatedPost && (
                <div className="flex items-center gap-2 pb-2 border-b border-[rgba(0,163,255,0.15)]">
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[rgba(0,163,255,0.12)] border-0.5 border-[rgba(0,163,255,0.28)] text-[#00a3ff]">
                    {selectedModel}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-[#4a5a72]" />
                  <span className="font-mono text-[11px] text-[#4a5a72]">{tokenCount} tokens</span>
                  <span className="w-1 h-1 rounded-full bg-[#4a5a72]" />
                  <span className="font-mono text-[11px] text-[#4a5a72]">{genTime}s</span>
                  <button className="ml-auto text-[#4a5a72] hover:text-[#00a3ff] transition-colors">
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              <div className="flex-1 bg-[#1a2236] border-0.5 border-[rgba(0,163,255,0.15)] rounded-lg p-4 overflow-y-auto min-h-[160px] relative">
                {displayedPost || generatedPost ? (
                  <div className="text-xs text-[#e8edf5] leading-relaxed whitespace-pre-wrap">
                    {displayedPost || generatedPost}
                    {isGenerating && displayedPost.length < (generatedPost?.length || 0) && (
                      <span className="inline-block w-1 h-4 bg-[#00a3ff] animate-pulse ml-1" />
                    )}
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="text-[#4a5a72] mb-2"
                    >
                      <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                    <p className="font-mono text-xs text-[#4a5a72]">AI post will generate here</p>
                    <p className="font-mono text-[10px] text-[#4a5a72] opacity-60 mt-1">
                      1️⃣ Enter GitHub username & repo name
                    </p>
                    <p className="font-mono text-[10px] text-[#4a5a72] opacity-60">
                      2️⃣ Click generate button
                    </p>
                    <p className="font-mono text-[10px] text-[#4a5a72] opacity-60">
                      3️⃣ Post auto-saves to History
                    </p>
                  </div>
                )}
              </div>

              {captions.length > 0 && (
                <div>
                  <p className="font-mono text-[10px] tracking-[0.5px] text-[#4a5a72] uppercase mb-1.5">
                    Suggested Captions
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {captions.map((caption, idx) => (
                      <div
                        key={idx}
                        className="bg-[#1a2236] border-0.5 border-[rgba(0,163,255,0.15)] rounded-lg px-3 py-2 flex items-center justify-between hover:border-[rgba(0,163,255,0.28)] hover:text-[#e8edf5] cursor-pointer transition-all group"
                      >
                        <p className="font-mono text-xs text-[#8a9bb5] group-hover:text-[#e8edf5]">
                          {caption}
                        </p>
                        <button
                          onClick={() => handleCopy(caption, 'caption')}
                          className="text-[#4a5a72] hover:text-[#00a3ff] transition-colors flex-shrink-0 ml-2"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {generatedPost && (
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <ActionButton
                      onClick={() => handleCopy(generatedPost, 'post')}
                      icon={Copy}
                      variant="primary"
                      disabled={isGenerating}
                      className="w-full sm:w-auto"
                    >
                      {copied === 'post' ? '✓ Copied' : 'Copy to clipboard'}
                    </ActionButton>
                    <ActionButton
                      onClick={handleGenerate}
                      icon={RefreshCw}
                      variant="secondary"
                      disabled={isGenerating}
                      className="w-full sm:w-auto"
                    >
                      Generate again
                    </ActionButton>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <ActionButton
                      onClick={() => navigate('/dashboard/history')}
                      icon={History}
                      variant="tertiary"
                      disabled={isGenerating}
                      className="w-full sm:w-auto"
                    >
                      View in History
                    </ActionButton>
                    <ActionButton
                      onClick={() => {
                        const text = encodeURIComponent(generatedPost);
                        window.open(`https://www.linkedin.com/sharing/share-offsite/?summary=${text}`, '_blank');
                      }}
                      icon={Linkedin}
                      variant="tertiary"
                      disabled={isGenerating}
                      className="w-full sm:w-auto"
                    >
                      Share on LinkedIn
                    </ActionButton>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ERROR ALERT MODAL */}
      {alertError.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#111827] border border-[#e24b4a] rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-lg font-medium text-[#e24b4a] mb-3">{alertError.title}</div>
            <p className="text-sm text-[#e8edf5] mb-6 whitespace-pre-wrap leading-relaxed font-mono">
              {alertError.message}
            </p>
            <button
              onClick={() => setAlertError({ show: false, message: '', title: '' })}
              className="w-full h-[36px] bg-[#e24b4a] hover:bg-[#c93f3f] text-white font-mono text-xs font-medium rounded-lg transition-all"
            >
              OK, Got it
            </button>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toast.show && (
        <div className="fixed bottom-5 right-5 bg-[#111827] border-0.5 border-[rgba(0,200,120,0.3)] rounded-lg px-4 py-2.5 flex items-center gap-2 font-mono text-xs text-[#00c878] animate-in fade-in slide-in-from-bottom-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-[#00c878]">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path d="M8 12l2.5 2.5L16 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default GeneratePost;
