import { motion } from 'framer-motion';
import { Copy, GitBranch } from 'lucide-react';

export default function HomeDemoPanel({
  username,
  setUsername,
  selectedRepo,
  setSelectedRepo,
  repos,
  onGenerate,
  isLoading,
  error,
  generatedPost,
  activeTab,
  setActiveTab,
  captions,
  onCopy,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm p-8 max-w-4xl mx-auto"
    >
      <h2 className="text-2xl font-bold text-white text-center mb-6">Try It Now</h2>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-white mb-2">GitHub Username</label>
          <input
            type="text"
            placeholder="octocat"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
          />
        </div>
        <div>
          <label className="block text-white mb-2">Select Repository</label>
          <select
            value={selectedRepo}
            onChange={(e) => setSelectedRepo(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
          >
            <option value="">Choose a repository</option>
            {repos.map((repo) => (
              <option key={repo} value={repo}>{repo}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="text-center mb-6">
        <button
          onClick={onGenerate}
          disabled={!username.trim() || !selectedRepo.trim() || isLoading}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 mx-auto disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <GitBranch className="h-5 w-5" />
          <span>{isLoading ? 'Generating...' : 'Generate Post'}</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {generatedPost && (
        <GeneratedPostPanel
          activeTab={activeTab}
          captions={captions}
          generatedPost={generatedPost}
          onCopy={onCopy}
          setActiveTab={setActiveTab}
        />
      )}
    </motion.div>
  );
}

function GeneratedPostPanel({ activeTab, captions, generatedPost, onCopy, setActiveTab }) {
  return (
    <div>
      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => setActiveTab('post')}
          className={`px-4 py-2 rounded-lg ${activeTab === 'post' ? 'bg-blue-600 text-white' : 'bg-white/10 text-white'}`}
        >
          Post
        </button>
        <button
          onClick={() => setActiveTab('captions')}
          className={`px-4 py-2 rounded-lg ${activeTab === 'captions' ? 'bg-blue-600 text-white' : 'bg-white/10 text-white'}`}
        >
          Captions
        </button>
      </div>

      <div className="bg-white/10 border border-white/20 rounded-lg p-6">
        {activeTab === 'post' ? (
          <div>
            <p className="text-white whitespace-pre-line">{generatedPost}</p>
            <button
              onClick={() => onCopy(generatedPost)}
              className="mt-4 flex items-center space-x-2 text-blue-400 hover:text-blue-300"
            >
              <Copy className="h-4 w-4" />
              <span>Copy</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {captions.map((caption, index) => (
              <div key={index} className="flex justify-between items-center">
                <p className="text-white">{caption}</p>
                <button
                  onClick={() => onCopy(caption)}
                  className="text-blue-400 hover:text-blue-300"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
