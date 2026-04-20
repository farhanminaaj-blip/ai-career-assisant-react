import HomeHero from '../components/sections/HomeHero';
import HomeDemoPanel from '../components/sections/HomeDemoPanel';
import useGeneratePost from '../hooks/useGeneratePost';
import { repos, captions } from '../data/homeData';

export default function Home() {
  const {
    username,
    setUsername,
    selectedRepo,
    setSelectedRepo,
    generatedPost,
    activeTab,
    setActiveTab,
    error,
    isLoading,
    handleGenerate,
    copyToClipboard,
  } = useGeneratePost();

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-black relative overflow-hidden">
      <div className="absolute inset-0 bg-black/50"></div>

      <div className="relative z-10 h-full flex flex-col">
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-6xl w-full">
            <HomeHero />
            <HomeDemoPanel
              username={username}
              setUsername={setUsername}
              selectedRepo={selectedRepo}
              setSelectedRepo={setSelectedRepo}
              repos={repos}
              onGenerate={handleGenerate}
              isLoading={isLoading}
              error={error}
              generatedPost={generatedPost}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              captions={captions}
              onCopy={copyToClipboard}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
