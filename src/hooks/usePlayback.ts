import { useState, useCallback, useRef, useEffect } from 'react';
import { playbackEngine } from '@/lib/playback';
import { ITrack } from '@/types';

export function usePlayback() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const tracksRef = useRef<ITrack[]>([]);
  const durations = useRef<Map<string, number>>(new Map());

  // Set up time update callback
  useEffect(() => {
    playbackEngine.setOnTimeUpdate((time) => {
      setCurrentTime(time);
    });
  }, []);

  const loadTracks = useCallback(async (tracks: ITrack[]) => {
    setIsLoading(true);
    try {
      durations.current = await playbackEngine.preloadTracks(tracks);
      tracksRef.current = tracks;

      // Calculate total duration
      let maxDuration = 0;
      for (const track of tracks) {
        const trackDuration = durations.current.get(track.id) || 0;
        const trackEnd = track.position + trackDuration;
        if (trackEnd > maxDuration) {
          maxDuration = trackEnd;
        }
      }
      setTotalDuration(maxDuration);
    } catch (error) {
      console.error('Failed to load tracks:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const play = useCallback(async (tracks?: ITrack[]) => {
    const tracksToPlay = tracks || tracksRef.current;
    if (tracksToPlay.length === 0) return;

    tracksRef.current = tracksToPlay;

    // Preload if needed
    const needsLoading = tracksToPlay.some(
      (t) => !durations.current.has(t.id)
    );

    if (needsLoading) {
      await loadTracks(tracksToPlay);
    }

    const startOffset = isPaused ? currentTime : 0;
    await playbackEngine.play(tracksToPlay, startOffset);

    setIsPlaying(true);
    setIsPaused(false);
  }, [isPaused, currentTime, loadTracks]);

  const pause = useCallback(() => {
    const pausedAt = playbackEngine.pause();
    setCurrentTime(pausedAt);
    setIsPlaying(false);
    setIsPaused(true);
  }, []);

  const stop = useCallback(() => {
    playbackEngine.stop();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentTime(0);
  }, []);

  const seek = useCallback(async (time: number) => {
    const wasPlaying = isPlaying;

    if (wasPlaying) {
      playbackEngine.stop();
    }

    setCurrentTime(time);

    if (wasPlaying) {
      await playbackEngine.play(tracksRef.current, time);
    } else {
      setIsPaused(true);
    }
  }, [isPlaying]);

  const setTrackVolume = useCallback((trackId: string, volume: number) => {
    playbackEngine.setTrackVolume(trackId, volume);
  }, []);

  const getAudioDuration = useCallback((url: string): number | null => {
    return playbackEngine.getAudioDuration(url);
  }, []);

  const getDurations = useCallback(() => {
    return durations.current;
  }, []);

  return {
    isPlaying,
    isPaused,
    currentTime,
    totalDuration,
    isLoading,
    play,
    pause,
    stop,
    seek,
    loadTracks,
    setTrackVolume,
    getAudioDuration,
    getDurations,
  };
}
