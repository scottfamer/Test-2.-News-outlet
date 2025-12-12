/**
 * Global Audio Manager
 * Ensures only one TTS audio instance plays at a time
 * Handles mute state persistently across article changes
 */

class AudioManager {
  private currentAudio: HTMLAudioElement | null = null;
  private currentArticleId: number | null = null;
  private isMuted: boolean = false;
  private listeners: Set<() => void> = new Set();

  /**
   * Play audio for a specific article
   * Automatically stops any currently playing audio
   */
  async playArticle(articleId: number): Promise<void> {
    console.log(`🎬 AudioManager: Playing article ${articleId}`);
    
    // Stop any existing audio
    this.stopCurrent();
    
    // Update current article
    this.currentArticleId = articleId;
    
    // Don't play if muted
    if (this.isMuted) {
      console.log('🔇 AudioManager: Muted, not starting audio');
      return;
    }
    
    try {
      // Create new audio instance
      const audioUrl = `/api/news/${articleId}/tts`;
      const audio = new Audio(audioUrl);
      audio.preload = 'auto';
      
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
        }
        this.notifyListeners();
      });
      
      audio.addEventListener('play', () => {
        console.log('▶️ AudioManager: Audio playing');
        this.notifyListeners();
      });
      
      audio.addEventListener('pause', () => {
        console.log('⏸️ AudioManager: Audio paused');
        this.notifyListeners();
      });
      
      // Store reference
      this.currentAudio = audio;
      
      // Wait for audio to be ready
      await new Promise<void>((resolve, reject) => {
        audio.addEventListener('canplay', () => resolve(), { once: true });
        audio.addEventListener('error', reject, { once: true });
        audio.load();
      });
      
      // Play the audio
      await audio.play();
      console.log('✅ AudioManager: Auto-play successful');
      this.notifyListeners();
      
    } catch (error) {
      console.error('❌ AudioManager: Failed to play audio', error);
      this.currentAudio = null;
      this.notifyListeners();
    }
  }
  
  /**
   * Stop current audio completely
   */
  stopCurrent(): void {
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
      this.notifyListeners();
    }
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
