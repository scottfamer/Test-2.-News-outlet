import { useEffect, useRef, useState, useCallback } from 'react';

interface TTSState {
  isPlaying: boolean;
  isMuted: boolean;
  isLoading: boolean;
  error: string | null;
  currentTime: number;
  duration: number;
}

interface UseTTSReturn extends TTSState {
  toggleMute: () => void;
}

// Global mute state that persists across article changes
let globalMuted = false;

/**
 * Hook for managing text-to-speech audio playback
 * Auto-plays when article becomes active
 * Button toggles mute/unmute
 */
export function useTTS(articleId: number | null, isActive: boolean = false): UseTTSReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<TTSState>({
    isPlaying: false,
    isMuted: globalMuted,
    isLoading: false,
    error: null,
    currentTime: 0,
    duration: 0,
  });

  // Track the current article ID
  const currentArticleIdRef = useRef<number | null>(null);

  // Cleanup function to immediately stop and dispose audio
  const cleanupAudio = useCallback(() => {
    if (audioRef.current) {
      try {
        console.log('🧹 Cleaning up audio');
        const oldAudio = audioRef.current;
        oldAudio.pause();
        oldAudio.src = '';
        oldAudio.load();
      } catch (err) {
        console.error('Error cleaning up audio:', err);
      }
      audioRef.current = null;
    }
    setState(prev => ({
      ...prev,
      isPlaying: false,
      isLoading: false,
      error: null,
      currentTime: 0,
      duration: 0,
    }));
  }, []);

  // Toggle mute/unmute
  const toggleMute = useCallback(() => {
    const newMutedState = !state.isMuted;
    globalMuted = newMutedState;
    setState(prev => ({ ...prev, isMuted: newMutedState }));
    
    if (audioRef.current) {
      if (newMutedState) {
        console.log('🔇 Muting audio');
        audioRef.current.pause();
      } else {
        console.log('🔊 Unmuting audio');
        audioRef.current.play().catch(err => {
          console.error('❌ Error resuming audio:', err);
        });
      }
    }
  }, [state.isMuted]);

  // Load and manage audio when article becomes active
  useEffect(() => {
    // Cleanup previous audio when article changes
    if (currentArticleIdRef.current !== articleId) {
      console.log('📝 Article changed, cleaning up previous audio');
      cleanupAudio();
      currentArticleIdRef.current = articleId;
    }
    
    // Only load and play audio if article is active
    if (articleId === null || !isActive) {
      return;
    }

    console.log(`🎬 Loading audio for article ${articleId}`);

    // Create and load new audio
    const loadAudio = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        const audioUrl = `/api/news/${articleId}/tts`;
        const audio = new Audio(audioUrl);
        audio.preload = 'auto';
        
        // Set up event listeners
        audio.addEventListener('loadedmetadata', () => {
          setState(prev => ({ ...prev, duration: audio.duration }));
        });

        audio.addEventListener('loadeddata', () => {
          setState(prev => ({ ...prev, isLoading: false }));
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
          console.error('❌ Audio playback error:', e);
          setState(prev => ({ 
            ...prev, 
            isPlaying: false, 
            isLoading: false,
            error: 'Failed to load audio' 
          }));
        });

        // Auto-play when ready (unless muted)
        audio.addEventListener('canplay', async () => {
          console.log('🎵 Audio ready');
          
          // Only auto-play if not muted and this is still the current audio
          if (!globalMuted && audioRef.current === audio) {
            console.log('🚀 Auto-playing audio...');
            try {
              await audio.play();
              console.log('✅ Auto-play successful');
            } catch (err) {
              console.log('🚫 Auto-play blocked by browser');
              // Set muted state if auto-play fails
              globalMuted = true;
              setState(prev => ({ ...prev, isMuted: true }));
            }
          } else {
            console.log('🔇 Audio loaded but muted');
          }
        }, { once: true });

        audioRef.current = audio;
        audio.load();
      } catch (error) {
        console.error('❌ Error loading TTS:', error);
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
  }, [articleId, isActive, cleanupAudio]);

  return {
    ...state,
    toggleMute,
  };
}
