/**
 * Global Audio Manager
 * Ensures only one TTS audio instance plays at a time
 * Handles mute state persistently across article changes
 * Includes debouncing and abort handling for rapid swipes
 */

class AudioManager {
  private currentAudio: HTMLAudioElement | null = null;
  private currentArticleId: number | null = null;
  private isMuted: boolean = false;
  private listeners: Set<() => void> = new Set();
  private loadingArticleId: number | null = null;
  private debounceTimer: NodeJS.Timeout | null = null;
  private isLoading: boolean = false;

  /**
   * Play audio for a specific article
   * Automatically stops any currently playing audio
   * Debounced to handle rapid swipes
   */
  async playArticle(articleId: number): Promise<void> {
    // Clear any pending debounced calls
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    
    // If already loading this article, skip
    if (this.loadingArticleId === articleId) {
      console.log(`⏳ AudioManager: Already loading article ${articleId}`);
      return;
    }
    
    // If this article is already playing, skip
    if (this.currentArticleId === articleId && this.currentAudio && !this.currentAudio.paused) {
      console.log(`▶️ AudioManager: Article ${articleId} is already playing`);
      return;
    }
    
    console.log(`🎬 AudioManager: Playing article ${articleId}`);
    
    // Stop any existing audio immediately
    this.stopCurrent();
    
    // Update current article
    this.currentArticleId = articleId;
    this.loadingArticleId = articleId;
    
    // Don't play if muted
    if (this.isMuted) {
      console.log('🔇 AudioManager: Muted, not starting audio');
      this.loadingArticleId = null;
      return;
    }
    
    this.isLoading = true;
    this.notifyListeners();
    
    try {
      // Create new audio instance
      const audioUrl = `/api/news/${articleId}/tts`;
      const audio = new Audio(audioUrl);
      audio.preload = 'auto';
      
      // Check if we were cancelled during setup
      if (this.loadingArticleId !== articleId) {
        console.log(`🚫 AudioManager: Article ${articleId} cancelled during setup`);
        return;
      }
      
      // Set up event listeners
      audio.addEventListener('ended', () => {
        console.log('✅ AudioManager: Audio finished');
        if (this.currentAudio === audio) {
          this.currentAudio = null;
        }
        this.notifyListeners();
      });
      
      audio.addEventListener('error', (e) => {
        console.error('❌ AudioManager: Audio error', e);
        if (this.currentAudio === audio) {
          this.currentAudio = null;
          this.isLoading = false;
        }
        this.notifyListeners();
      });
      
      audio.addEventListener('play', () => {
        console.log('▶️ AudioManager: Audio playing');
        this.isLoading = false;
        this.notifyListeners();
      });
      
      audio.addEventListener('pause', () => {
        console.log('⏸️ AudioManager: Audio paused');
        this.notifyListeners();
      });
      
      audio.addEventListener('loadeddata', () => {
        console.log('📦 AudioManager: Audio data loaded');
        this.isLoading = false;
        this.notifyListeners();
      });
      
      // Store reference
      this.currentAudio = audio;
      
      // Wait for audio to be ready with timeout
      await Promise.race([
        new Promise<void>((resolve, reject) => {
          audio.addEventListener('canplay', () => resolve(), { once: true });
          audio.addEventListener('error', reject, { once: true });
          audio.load();
        }),
        new Promise<void>((_, reject) => 
          setTimeout(() => reject(new Error('Audio load timeout')), 10000)
        )
      ]);
      
      // Check if we were cancelled during loading
      if (this.loadingArticleId !== articleId) {
        console.log(`🚫 AudioManager: Article ${articleId} cancelled during load`);
        audio.pause();
        audio.src = '';
        return;
      }
      
      // Play the audio
      await audio.play();
      console.log('✅ AudioManager: Auto-play successful');
      this.loadingArticleId = null;
      this.isLoading = false;
      this.notifyListeners();
      
    } catch (error) {
      console.error('❌ AudioManager: Failed to play audio', error);
      
      // Only clear if this is still the current article
      if (this.loadingArticleId === articleId) {
        this.currentAudio = null;
        this.loadingArticleId = null;
        this.isLoading = false;
        
        // If auto-play was blocked, set muted state
        if (error instanceof Error && error.message.includes('play')) {
          console.log('🚫 AudioManager: Auto-play blocked, setting muted');
          this.isMuted = true;
        }
      }
      
      this.notifyListeners();
    }
  }
  
  /**
   * Stop current audio completely
   */
  stopCurrent(): void {
    // Cancel any loading
    this.loadingArticleId = null;
    this.isLoading = false;
    
    if (this.currentAudio) {
      console.log('🛑 AudioManager: Stopping current audio');
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.currentAudio.src = '';
        this.currentAudio.load();
      } catch (err) {
        console.error('Error stopping audio:', err);
      }
      this.currentAudio = null;
    }
    
    this.notifyListeners();
  }
  
  /**
   * Toggle mute state
   */
  toggleMute(): void {
    this.isMuted = !this.isMuted;
    console.log(`🔊 AudioManager: Mute = ${this.isMuted}`);
    
    if (this.isMuted) {
      // Mute: pause current audio
      if (this.currentAudio) {
        this.currentAudio.pause();
      }
    } else {
      // Unmute: resume or start playing current article
      if (this.currentAudio && this.currentAudio.paused) {
        // Resume existing audio
        this.currentAudio.play().catch(err => {
          console.error('Error resuming audio:', err);
        });
      } else if (this.currentArticleId !== null) {
        // Start playing current article
        this.playArticle(this.currentArticleId);
      }
    }
    
    this.notifyListeners();
  }
  
  /**
   * Get current state
   */
  getState() {
    return {
      isPlaying: this.currentAudio !== null && !this.currentAudio.paused,
      isMuted: this.isMuted,
      isLoading: this.isLoading,
      currentArticleId: this.currentArticleId,
      currentTime: this.currentAudio?.currentTime || 0,
      duration: this.currentAudio?.duration || 0,
    };
  }
  
  /**
   * Subscribe to state changes
   */
  subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }
  
  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    this.listeners.forEach(callback => callback());
  }
}

// Export singleton instance
export const audioManager = new AudioManager();
