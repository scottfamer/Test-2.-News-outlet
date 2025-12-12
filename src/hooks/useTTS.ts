import { useEffect, useState } from 'react';
import { audioManager } from '../services/AudioManager';

interface TTSState {
  isPlaying: boolean;
  isMuted: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
}

interface UseTTSReturn extends TTSState {
  toggleMute: () => void;
}

/**
 * Hook for managing text-to-speech audio playback via global AudioManager
 * Automatically plays audio when article becomes active
 * Provides mute/unmute toggle
 */
export function useTTS(articleId: number, isActive: boolean): UseTTSReturn {
  const [state, setState] = useState<TTSState>(() => {
    const managerState = audioManager.getState();
    return {
      isPlaying: managerState.isPlaying,
      isMuted: managerState.isMuted,
      isLoading: managerState.isLoading,
      currentTime: managerState.currentTime,
      duration: managerState.duration,
    };
  });

  // Subscribe to audio manager state changes
  useEffect(() => {
    const unsubscribe = audioManager.subscribe(() => {
      const managerState = audioManager.getState();
      setState({
        isPlaying: managerState.isPlaying,
        isMuted: managerState.isMuted,
        isLoading: managerState.isLoading,
        currentTime: managerState.currentTime,
        duration: managerState.duration,
      });
    });

    return unsubscribe;
  }, []);

  // Handle article activation/deactivation
  useEffect(() => {
    if (isActive && articleId) {
      console.log(`✨ Article ${articleId} became active`);
      // Play this article's audio
      audioManager.playArticle(articleId);
    } else if (!isActive) {
      // Article is no longer active
      const managerState = audioManager.getState();
      if (managerState.currentArticleId === articleId) {
        console.log(`👋 Article ${articleId} is no longer active, stopping audio`);
        audioManager.stopCurrent();
      }
    }
  }, [articleId, isActive]);

  // Toggle mute function
  const toggleMute = () => {
    audioManager.toggleMute();
  };

  return {
    ...state,
    toggleMute,
  };
}
