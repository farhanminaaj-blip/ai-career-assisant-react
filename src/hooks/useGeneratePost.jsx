import { useState } from 'react';
import { generatePost } from '../services/api';

export default function useGeneratePost() {
  const [username, setUsername] = useState('');
  const [selectedRepo, setSelectedRepo] = useState('');
  const [generatedPost, setGeneratedPost] = useState('');
  const [activeTab, setActiveTab] = useState('post');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!username.trim() || !selectedRepo.trim()) {
      setError('GitHub username and repository are required.');
      return;
    }

    setError('');
    setIsLoading(true);
    setGeneratedPost('');

    try {
      const postResponse = await generatePost({ owner: username.trim(), repo: selectedRepo.trim() });

      if (postResponse?.success) {
        setGeneratedPost(postResponse.post || '');
      } else {
        setError(postResponse?.message || 'Failed to generate post.');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Unable to generate post.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  return {
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
  };
}
