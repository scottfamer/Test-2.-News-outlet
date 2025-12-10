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
}

/**
 * Hook for managing text-to-speech audio playback
 * Handles audio loading, playback, and cleanup
 */
export function useTTS(articleId: number | null, autoPlay: boolean = false): UseTTSReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<TTSState>({
    isPlaying: false,
    isLoading: false,
    error: null,
    currentTime: 0,
    duration: 0,
  });

  // Cache of loaded audio URLs to avoid regeneration
  const audioUrlCache = useRef<Map<number, string>>(new Map());
  
  // Track if this is the first load to enable autoplay workaround
  const isFirstLoadRef = useRef(true);
  
  // Track current article ID to detect changes immediately
  const currentArticleIdRef = useRef<number | null>(null);

  // Cleanup function to immediately stop and dispose audio
  const cleanupAudio = useCallback(() => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = '';
        audioRef.current.load(); // Force cleanup
        audioRef.current = null;
      } catch (err) {
        console.error('Error cleaning up audio:', err);
      }
    }
    setState({
      isPlaying: false,
      isLoading: false,
      error: null,
      currentTime: 0,
      duration: 0,
    });
  }, []);

  // Load and play audio for an article
  const loadAndPlay = useCallback(async (id: number) => {
    try {
      // Immediately cleanup any existing audio
      cleanupAudio();
      
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Check cache first
      let audioUrl = audioUrlCache.current.get(id);
      
      if (!audioUrl) {
        // Fetch TTS audio URL
        audioUrl = `/api/news/${id}/tts`;
        audioUrlCache.current.set(id, audioUrl);
      }

      // Create new audio element
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

      // Auto-play if enabled
      if (autoPlay) {
        try {
          // For first load, try to play with muted initially to bypass autoplay restrictions
          if (isFirstLoadRef.current) {
            audio.muted = true;
            await audio.play();
            // Unmute after a brief moment
            setTimeout(() => {
              if (audioRef.current === audio) {
                audio.muted = false;
              }
            }, 100);
            isFirstLoadRef.current = false;
          } else {
            // Subsequent plays should work without muting
            await audio.play();
          }
        } catch (err) {
          console.warn('Auto-play prevented by browser:', err);
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
  }, [autoPlay, cleanupAudio]);

  // Play current audio
  const play = useCallback(() => {
    if (audioRef.current && !state.isPlaying) {
      audioRef.current.play().catch(err => {
        console.error('Play error:', err);
        setState(prev => ({ ...prev, error: 'Failed to play audio' }));
      });
    }
  }, [state.isPlaying]);

  // Pause current audio
  const pause = useCallback(() => {
    if (audioRef.current && state.isPlaying) {
      audioRef.current.pause();
    }
  }, [state.isPlaying]);

  // Stop and reset audio
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
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
    // If article changed, immediately stop previous audio
    if (currentArticleIdRef.current !== null && currentArticleIdRef.current !== articleId) {
      cleanupAudio();
    }
    
    currentArticleIdRef.current = articleId;
    
    if (articleId !== null) {
      // Small delay to ensure previous cleanup completed
      const timer = setTimeout(() => {
        loadAndPlay(articleId);
      }, 50);
      
      return () => {
        clearTimeout(timer);
        cleanupAudio();
      };
    } else {
      // If no article, cleanup immediately
      cleanupAudio();
    }
    
    // Cleanup on unmount
    return () => {
      cleanupAudio();
    };
  }, [articleId, loadAndPlay, cleanupAudio]);

  return {
    ...state,
    play,
    pause,
    stop,
    seek,
  };
}
