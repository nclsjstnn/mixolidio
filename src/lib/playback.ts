import { ITrack } from '@/types';

interface AudioTrackNode {
  trackId: string;
  source: AudioBufferSourceNode;
  gainNode: GainNode;
}

class PlaybackEngine {
  private audioContext: AudioContext | null = null;
  private trackNodes: AudioTrackNode[] = [];
  private audioBufferCache: Map<string, AudioBuffer> = new Map();
  private startTime: number = 0;
  private pauseTime: number = 0;
  private isPlaying: boolean = false;
  private animationFrameId: number | null = null;
  private onTimeUpdate: ((time: number) => void) | null = null;
  private totalDuration: number = 0;

  getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  async loadAudio(url: string): Promise<AudioBuffer> {
    // Check cache first
    if (this.audioBufferCache.has(url)) {
      return this.audioBufferCache.get(url)!;
    }

    const ctx = this.getContext();
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

    // Cache the decoded buffer
    this.audioBufferCache.set(url, audioBuffer);

    return audioBuffer;
  }

  async preloadTracks(tracks: ITrack[]): Promise<Map<string, number>> {
    const durations = new Map<string, number>();

    await Promise.all(
      tracks.map(async (track) => {
        try {
          const buffer = await this.loadAudio(track.blobUrl);
          durations.set(track.id, buffer.duration);
        } catch (error) {
          console.error(`Failed to load audio for track ${track.id}:`, error);
        }
      })
    );

    return durations;
  }

  async play(tracks: ITrack[], startOffset: number = 0): Promise<void> {
    const ctx = this.getContext();

    // Resume context if suspended (required by browser autoplay policies)
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    // Stop any current playback
    this.stopAllSources();

    // Determine which tracks to play (handle solo)
    const hasSolo = tracks.some((t) => t.isSolo);
    const tracksToPlay = tracks.filter((t) => {
      if (t.isMuted) return false;
      if (hasSolo && !t.isSolo) return false;
      return true;
    });

    // Calculate total duration
    this.totalDuration = 0;
    for (const track of tracks) {
      const buffer = this.audioBufferCache.get(track.blobUrl);
      if (buffer) {
        const trackEnd = track.position + buffer.duration;
        if (trackEnd > this.totalDuration) {
          this.totalDuration = trackEnd;
        }
      }
    }

    this.startTime = ctx.currentTime - startOffset;
    this.isPlaying = true;

    // Create and schedule audio nodes for each track
    for (const track of tracksToPlay) {
      const buffer = this.audioBufferCache.get(track.blobUrl);
      if (!buffer) continue;

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const gainNode = ctx.createGain();
      gainNode.gain.value = track.volume;

      source.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Calculate when to start based on track position and current offset
      const trackStartTime = track.position - startOffset;

      if (trackStartTime >= 0) {
        // Track hasn't started yet
        source.start(ctx.currentTime + trackStartTime);
      } else if (trackStartTime + buffer.duration > 0) {
        // We're in the middle of this track
        source.start(0, -trackStartTime);
      }
      // Else: track has already finished, don't play it

      this.trackNodes.push({
        trackId: track.id,
        source,
        gainNode,
      });

      // Handle track end
      source.onended = () => {
        this.trackNodes = this.trackNodes.filter((n) => n.trackId !== track.id);
      };
    }

    // Start time update loop
    this.startTimeUpdateLoop();
  }

  private startTimeUpdateLoop(): void {
    const update = () => {
      if (!this.isPlaying || !this.audioContext) return;

      const currentTime = this.audioContext.currentTime - this.startTime;

      if (this.onTimeUpdate) {
        this.onTimeUpdate(currentTime);
      }

      // Check if playback should stop
      if (currentTime >= this.totalDuration) {
        this.stop();
        return;
      }

      this.animationFrameId = requestAnimationFrame(update);
    };

    this.animationFrameId = requestAnimationFrame(update);
  }

  pause(): number {
    if (!this.isPlaying || !this.audioContext) return this.pauseTime;

    this.pauseTime = this.audioContext.currentTime - this.startTime;
    this.stopAllSources();
    this.isPlaying = false;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    return this.pauseTime;
  }

  stop(): void {
    this.stopAllSources();
    this.isPlaying = false;
    this.pauseTime = 0;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.onTimeUpdate) {
      this.onTimeUpdate(0);
    }
  }

  private stopAllSources(): void {
    for (const node of this.trackNodes) {
      try {
        node.source.stop();
        node.source.disconnect();
        node.gainNode.disconnect();
      } catch {
        // Source might already be stopped
      }
    }
    this.trackNodes = [];
  }

  setTrackVolume(trackId: string, volume: number): void {
    const node = this.trackNodes.find((n) => n.trackId === trackId);
    if (node) {
      node.gainNode.gain.value = volume;
    }
  }

  setOnTimeUpdate(callback: (time: number) => void): void {
    this.onTimeUpdate = callback;
  }

  getCurrentTime(): number {
    if (!this.isPlaying || !this.audioContext) {
      return this.pauseTime;
    }
    return this.audioContext.currentTime - this.startTime;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getTotalDuration(): number {
    return this.totalDuration;
  }

  clearCache(): void {
    this.audioBufferCache.clear();
  }

  getAudioDuration(url: string): number | null {
    const buffer = this.audioBufferCache.get(url);
    return buffer ? buffer.duration : null;
  }
}

// Singleton instance
export const playbackEngine = new PlaybackEngine();
