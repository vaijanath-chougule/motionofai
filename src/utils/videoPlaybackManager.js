/**
 * Global Video Playback Manager — Exclusive Priority System
 *
 * Single source of truth for video playback across ALL video collections
 * (Jewellery, Wedding, and any other reel collections). Enforces the rule:
 *
 *   WHEN ANY VIDEO IS UNMUTED, ONLY THAT VIDEO MAY PLAY.
 *
 * Two modes:
 *   NORMAL_MODE   — viewport-based playback, multiple muted videos allowed
 *   PRIORITY_MODE — one unmuted video owns playback, all others paused
 *
 * The manager maintains:
 *   - Registry of all mounted video elements across all collections
 *   - Single priority video ID (the unmuted video)
 *   - Playback generation counter to invalidate stale play() requests
 *   - Synchronous refs for immediate authority checks
 */

// Development logging (stripped in production)
const DEV = import.meta.env.DEV;
const log = (...args) => {
  if (DEV) console.log('[Playback]', ...args);
};

class VideoPlaybackManager {
  constructor() {
    // Registry: id → { element, collectionId }
    this.registry = new Map();

    // The one video allowed to play with audio (null = NORMAL_MODE)
    this.priorityVideoId = null;

    // Generation counter to invalidate stale async play() requests
    this.playbackGeneration = 0;

    // Priority buffer state (for scheduler coordination)
    this.priorityReady = true;
  }

  /**
   * Register a video element with the manager.
   * Called when a video component mounts.
   */
  registerVideo(id, element, collectionId = 'default') {
    if (!id || !element) return;
    this.registry.set(id, { element, collectionId });
    log(`Registered: ${id} (collection: ${collectionId})`);
  }

  /**
   * Unregister a video element.
   * Called when a video component unmounts.
   */
  unregisterVideo(id) {
    if (this.registry.delete(id)) {
      log(`Unregistered: ${id}`);
    }
    // If the unmounted video was the priority, release priority
    if (this.priorityVideoId === id) {
      this.releasePriority();
    }
  }

  /**
   * Claim exclusive priority for a video.
   * This is PRIORITY_MODE — only this video may play.
   */
  claimPriority(videoId) {
    if (!videoId || this.priorityVideoId === videoId) return;

    log(`PRIORITY → ${videoId}`);
    this.priorityVideoId = videoId;
    this.playbackGeneration += 1;
    this.priorityReady = false;

    // Immediately pause and mute ALL other videos
    this.pauseAllExcept(videoId);
  }

  /**
   * Release priority mode.
   * Return to NORMAL_MODE where viewport-based playback can resume.
   */
  releasePriority() {
    if (!this.priorityVideoId) return;

    log('PRIORITY RELEASED → NORMAL MODE');
    this.priorityVideoId = null;
    this.playbackGeneration += 1;
    this.priorityReady = true;
  }

  /**
   * Pause and mute every video except the given ID.
   * This is the core enforcement mechanism for PRIORITY_MODE.
   */
  pauseAllExcept(videoId) {
    log(`Pausing all except ${videoId}`);
    let pausedCount = 0;

    this.registry.forEach(({ element }, id) => {
      if (id === videoId) return;

      try {
        // Pause the video
        if (element && !element.paused) {
          element.pause();
          pausedCount += 1;
        }
        // Mute the video
        if (element && !element.muted) {
          element.muted = true;
        }
      } catch (err) {
        // Ignore errors from elements that are being unmounted
      }
    });

    if (pausedCount > 0) {
      log(`Paused ${pausedCount} competing videos`);
    }
  }

  /**
   * Check if a video is allowed to play right now.
   * This is the gate that every play() request must pass through.
   */
  canPlay(videoId) {
    // In NORMAL_MODE (no priority video), allow viewport-based playback
    if (!this.priorityVideoId) return true;

    // In PRIORITY_MODE, only the priority video may play
    return videoId === this.priorityVideoId;
  }

  /**
   * Check if a video is the current priority video.
   */
  isPriority(videoId) {
    return this.priorityVideoId === videoId;
  }

  /**
   * Get the current playback generation.
   * Used to detect stale async play() requests.
   */
  getGeneration() {
    return this.playbackGeneration;
  }

  /**
   * Check if priority mode is active.
   */
  inPriorityMode() {
    return this.priorityVideoId !== null;
  }

  /**
   * Get priority video ID (for debugging/state checks).
   */
  getPriorityVideoId() {
    return this.priorityVideoId;
  }

  /**
   * Update priority buffer state.
   * Called by the scheduler when the priority video's buffer changes.
   */
  setPriorityReady(ready) {
    this.priorityReady = ready;
  }

  /**
   * Check if background loading should be blocked.
   * Returns true when in PRIORITY_MODE and the priority video needs more buffer.
   */
  shouldBlockBackgroundLoading() {
    return this.priorityVideoId !== null && !this.priorityReady;
  }

  /**
   * Request to play a video (centralized gate).
   * Returns a generation token that the caller must verify before actually playing.
   */
  requestPlay(videoId) {
    if (!this.canPlay(videoId)) {
      log(`Play request REJECTED for ${videoId} (priority: ${this.priorityVideoId})`);
      return null;
    }

    // Return current generation so caller can verify it hasn't changed
    return this.getGeneration();
  }

  /**
   * Get all registered video IDs (for debugging).
   */
  getRegisteredVideos() {
    return Array.from(this.registry.keys());
  }

  /**
   * Clear all state (for testing/cleanup).
   */
  reset() {
    log('Manager reset');
    this.registry.clear();
    this.priorityVideoId = null;
    this.playbackGeneration = 0;
    this.priorityReady = true;
  }
}

// Singleton instance
const playbackManager = new VideoPlaybackManager();

// Export the singleton
export default playbackManager;

// Export for debugging in development
if (DEV) {
  window.__videoPlaybackManager = playbackManager;
}
