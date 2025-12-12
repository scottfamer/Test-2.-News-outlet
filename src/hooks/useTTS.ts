import { useEffect, useRef, useState, useCallback } from 'react';

interface TTSState {
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  currentTime: number;
  duration: number;
}

interface UseTTSReturn extends TTSState {
  play: () => void;
  pause: () => void;
  stop: () => void;
  seek: (time: number) => void;
  toggle: () => void;
}

/**
 * Hook for managing text-to-speech audio playback
 * Handles audio loading, playback, and cleanup
 */
export function useTTS(articleId: number | null, shouldAutoPlay: boolean = false): UseTTSReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<TTSState>({
    isPlaying: false,
    isLoading: false,
    error: null,
    currentTime: 0,
    duration: 0,
  });

  // Track if audio has been user-paused (to prevent auto-resume)
  const userPausedRef = useRef(false);
  
  // Track the current article ID
  const currentArticleIdRef = useRef<number | null>(null);

  // Cleanup function to immediately stop and dispose audio
  const cleanupAudio = useCallback(() => {
    if (audioRef.current) {
      try {
        // Remove all event listeners by cloning the audio element
        const oldAudio = audioRef.current;
        oldAudio.pause();
        oldAudio.src = '';
        oldAudio.load();
      } catch (err) {
        console.error('Error cleaning up audio:', err);
      }
      audioRef.current = null;
    }
    setState({
      isPlaying: false,
      isLoading: false,
      error: null,
      currentTime: 0,
      duration: 0,
    });
    userPausedRef.current = false;
  }, []);

  // Play current audio
  const play = useCallback(() => {
    if (audioRef.current) {
      userPausedRef.current = false;
      audioRef.current.play().catch(err => {
        console.error('Play error:', err);
        setState(prev => ({ ...prev, error: 'Failed to play audio', isPlaying: false }));
      });
    }
  }, []);

  // Pause current audio
  const pause = useCallback(() => {
    if (audioRef.current) {
      userPausedRef.current = true;
      audioRef.current.pause();
    }
  }, []);

  // Toggle play/pause
  const toggle = useCallback(() => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [state.isPlaying, play, pause]);

  // Stop and reset audio
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      userPausedRef.current = true;
    }
  }, []);

  // Seek to specific time
  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, []);

  // Load audio when articleId changes
  useEffect(() => {
    // Cleanup previous audio when article changes
    if (currentArticleIdRef.current !== articleId) {
      cleanupAudio();
      currentArticleIdRef.current = articleId;
    }
    
    // If no article ID, just cleanup and return
    if (articleId === null) {
      return;
    }

    // Create and load new audio
    const loadAudio = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        const audioUrl = `/api/news/${articleId}/tts`;
        const audio = new Audio(audioUrl);
        audio.preload = 'auto';
        
        // Set up event listeners
        audio.addEventListener('loadedmetadata', () => {
          setState(prev => ({ ...prev, duration: audio.duration, isLoading: false }));
        });

        audio.addEventListener('timeupdate', () => {
          setState(prev => ({ ...prev, currentTime: audio.currentTime }));
        });

        audio.addEventListener('play', () => {
          setState(prev => ({ ...prev, isPlaying: true }));
        });

        audio.addEventListener('pause', () => {
          setState(prev => ({ ...prev, isPlaying: false }));
        });

        audio.addEventListener('ended', () => {
          setState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
          userPausedRef.current = false;
        });

        audio.addEventListener('error', (e) => {
          console.error('Audio playback error:', e);
          setState(prev => ({ 
            ...prev, 
            isPlaying: false, 
            isLoading: false,
            error: 'Failed to load audio' 
          }));
        });

        audioRef.current = audio;

        // Auto-play if enabled and user hasn't manually paused
        if (shouldAutoPlay && !userPausedRef.current) {
          try {
            await audio.play();
          } catch (err) {
            // Auto-play blocked by browser - this is expected
            console.log('Auto-play blocked, user interaction required');
            setState(prev => ({ ...prev, isLoading: false }));
          }
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Error loading TTS:', error);
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: 'Failed to load audio' 
        }));
      }
    };

    loadAudio();

    // Cleanup on unmount or article change
    return () => {
      cleanupAudio();
    };
  }, [articleId, shouldAutoPlay, cleanupAudio]);

  return {
    ...state,
    play,
    pause,
    stop,
    seek,
    toggle,
  };
}
