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

  // Load and play audio for an article
  const loadAndPlay = useCallback(async (id: number) => {
    try {
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

      // Clean up previous audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }

      audioRef.current = audio;

      // Auto-play if enabled
      if (autoPlay) {
        try {
          await audio.play();
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
  }, [autoPlay]);

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
    if (articleId !== null) {
      loadAndPlay(articleId);
    }

    // Cleanup on unmount or article change
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
      setState({
        isPlaying: false,
        isLoading: false,
        error: null,
        currentTime: 0,
        duration: 0,
      });
    };
  }, [articleId, loadAndPlay]);

  return {
    ...state,
    play,
    pause,
    stop,
    seek,
  };
}
