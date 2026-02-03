'use client';

import { Play, Pause, Square, SkipBack, Loader2 } from 'lucide-react';

interface PlayControlsProps {
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  currentTime: number;
  totalDuration: number;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onSeek: (time: number) => void;
}

export default function PlayControls({
  isPlaying,
  isPaused,
  isLoading,
  currentTime,
  totalDuration,
  onPlay,
  onPause,
  onStop,
  onSeek,
}: PlayControlsProps) {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * totalDuration;
    onSeek(newTime);
  };

  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div className="h-16 bg-[#1a1d24] border-t border-[#2d3139] flex items-center px-4 gap-4 flex-shrink-0">
      {/* Transport controls */}
      <div className="flex items-center gap-2">
        {/* Rewind to start */}
        <button
          onClick={onStop}
          className="p-2 text-gray-400 hover:text-white hover:bg-[#252830] rounded transition-colors"
          title="Stop and rewind"
        >
          <SkipBack className="w-5 h-5" />
        </button>

        {/* Play/Pause */}
        <button
          onClick={isPlaying ? onPause : onPlay}
          disabled={isLoading}
          className="p-3 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-600/50 text-white rounded-full transition-colors"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </button>

        {/* Stop */}
        <button
          onClick={onStop}
          className="p-2 text-gray-400 hover:text-white hover:bg-[#252830] rounded transition-colors"
          title="Stop"
        >
          <Square className="w-5 h-5" />
        </button>
      </div>

      {/* Time display */}
      <div className="flex items-center gap-2 text-sm font-mono">
        <span className="text-white w-24">{formatTime(currentTime)}</span>
        <span className="text-gray-500">/</span>
        <span className="text-gray-400 w-24">{formatTime(totalDuration)}</span>
      </div>

      {/* Progress bar */}
      <div className="flex-1 max-w-xl">
        <div
          onClick={handleProgressClick}
          className="h-2 bg-[#252830] rounded-full cursor-pointer relative overflow-hidden"
        >
          {/* Progress fill */}
          <div
            className="absolute inset-y-0 left-0 bg-violet-600 rounded-full transition-all duration-75"
            style={{ width: `${progress}%` }}
          />

          {/* Playhead indicator */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg transition-all duration-75"
            style={{ left: `calc(${progress}% - 6px)` }}
          />
        </div>
      </div>

      {/* Status indicator */}
      <div className="flex items-center gap-2 text-sm">
        {isPlaying && (
          <span className="flex items-center gap-1.5 text-green-400">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Playing
          </span>
        )}
        {isPaused && !isPlaying && (
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2 h-2 bg-amber-400 rounded-full" />
            Paused
          </span>
        )}
        {!isPlaying && !isPaused && (
          <span className="flex items-center gap-1.5 text-gray-400">
            <span className="w-2 h-2 bg-gray-400 rounded-full" />
            Stopped
          </span>
        )}
      </div>
    </div>
  );
}
