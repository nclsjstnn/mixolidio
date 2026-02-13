'use client';

import { useRef, useEffect, useState } from 'react';
import TrackLane from './TrackLane';
import { ITrack, IAudioFile } from '@/types';

interface TimelineProps {
  tracks: ITrack[];
  durations: Map<string, number>;
  currentTime: number;
  isPlaying: boolean;
  bpm: number;
  onTrackVolumeChange: (trackId: string, volume: number) => void;
  onTrackMuteToggle: (trackId: string) => void;
  onTrackSoloToggle: (trackId: string) => void;
  onTrackColorChange: (trackId: string, color: string) => void;
  onTrackNameChange: (trackId: string, name: string) => void;
  onTrackDelete: (trackId: string) => void;
  onTrackPositionChange: (trackId: string, position: number) => void;
  onDropFile: (file: IAudioFile, position: number) => void;
  onSeek: (time: number) => void;
}

const PIXELS_PER_SECOND = 50;
const MIN_TIMELINE_WIDTH = 1200;
const SNAP_INTERVAL = 0.25; // Snap to quarter seconds

export default function Timeline({
  tracks,
  durations,
  currentTime,
  isPlaying,
  onTrackVolumeChange,
  onTrackMuteToggle,
  onTrackSoloToggle,
  onTrackColorChange,
  onTrackNameChange,
  onTrackDelete,
  onTrackPositionChange,
  onDropFile,
  onSeek,
}: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Calculate timeline width based on content
  const maxTime = tracks.reduce((max, track) => {
    const duration = durations.get(track.id) || 0;
    return Math.max(max, track.position + duration);
  }, 0);

  const timelineWidth = Math.max((maxTime + 30) * PIXELS_PER_SECOND, MIN_TIMELINE_WIDTH);

  // Generate time markers
  const timeMarkers: number[] = [];
  for (let i = 0; i <= Math.ceil(timelineWidth / PIXELS_PER_SECOND); i++) {
    timeMarkers.push(i);
  }

  // Auto-scroll to follow playhead during playback
  useEffect(() => {
    if (!isPlaying || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const playheadPosition = currentTime * PIXELS_PER_SECOND + 192; // 192 = track header width
    const containerWidth = container.clientWidth;
    const scrollLeft = container.scrollLeft;

    // If playhead is near the right edge, scroll
    if (playheadPosition > scrollLeft + containerWidth - 100) {
      container.scrollLeft = playheadPosition - containerWidth / 2;
    }
  }, [currentTime, isPlaying]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      const data = e.dataTransfer.getData('application/json');
      if (!data) return;

      const file: IAudioFile = JSON.parse(data);

      // Calculate drop position in seconds
      const rect = scrollContainerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const scrollLeft = scrollContainerRef.current?.scrollLeft || 0;
      const relativeX = e.clientX - rect.left + scrollLeft - 192; // Subtract track header width
      const position = Math.max(0, relativeX / PIXELS_PER_SECOND);

      // Snap to grid
      const snappedPosition = Math.round(position / SNAP_INTERVAL) * SNAP_INTERVAL;

      onDropFile(file, snappedPosition);
    } catch (error) {
      console.error('Drop error:', error);
    }
  };

  const handleRulerClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const scrollLeft = scrollContainerRef.current?.scrollLeft || 0;
    const x = e.clientX - rect.left + scrollLeft;
    const time = x / PIXELS_PER_SECOND;
    onSeek(Math.max(0, time));
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    return `${secs}s`;
  };

  const playheadLeft = currentTime * PIXELS_PER_SECOND;

  return (
    <div ref={containerRef} className="flex-1 flex flex-col overflow-hidden bg-[#0f1117]">
      {/* Timeline header with ruler */}
      <div className="flex border-b border-[#2d3139] bg-[#1a1d24] h-8 flex-shrink-0">
        {/* Header spacer for track headers */}
        <div className="w-48 flex-shrink-0 border-r border-[#2d3139] flex items-center px-2">
          <span className="text-xs text-gray-500">Tracks ({tracks.length})</span>
        </div>

        {/* Ruler */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-x-auto overflow-y-hidden"
          style={{ scrollbarWidth: 'none' }}
        >
          <div
            className="relative h-full cursor-pointer"
            style={{ width: `${timelineWidth}px` }}
            onClick={handleRulerClick}
          >
            {/* Time markers */}
            {timeMarkers.map((second) => (
              <div
                key={second}
                className="absolute top-0 bottom-0 border-l border-[#2d3139] flex items-end pb-1"
                style={{ left: `${second * PIXELS_PER_SECOND}px` }}
              >
                <span className="text-xs text-gray-500 ml-1">{formatTime(second)}</span>
              </div>
            ))}

            {/* Playhead on ruler */}
            <div
              className="absolute top-0 bottom-0 w-px bg-violet-500 z-10 transition-all duration-75"
              style={{ left: `${playheadLeft}px` }}
            >
              <div className="absolute -top-0 -left-1.5 w-3 h-3 bg-violet-500 rounded-b-sm transform rotate-45" />
            </div>
          </div>
        </div>
      </div>

      {/* Track lanes */}
      <div
        className={`flex-1 overflow-auto transition-colors ${
          isDragOver ? 'bg-violet-500/5' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="min-h-full">
          {tracks.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[300px] text-gray-500">
              <div className="text-center">
                <p className="text-lg mb-2">No tracks yet</p>
                <p className="text-sm">Drag audio files from the library to add tracks</p>
              </div>
            </div>
          ) : (
            <div className="relative">
              {tracks.map((track) => (
                <TrackLane
                  key={track.id}
                  track={track}
                  duration={durations.get(track.id) || 0}
                  pixelsPerSecond={PIXELS_PER_SECOND}
                  timelineWidth={timelineWidth}
                  snapInterval={SNAP_INTERVAL}
                  onVolumeChange={(volume) => onTrackVolumeChange(track.id, volume)}
                  onMuteToggle={() => onTrackMuteToggle(track.id)}
                  onSoloToggle={() => onTrackSoloToggle(track.id)}
                  onColorChange={(color) => onTrackColorChange(track.id, color)}
                  onNameChange={(name) => onTrackNameChange(track.id, name)}
                  onDelete={() => onTrackDelete(track.id)}
                  onPositionChange={(position) => onTrackPositionChange(track.id, position)}
                />
              ))}

              {/* Playhead line across all tracks */}
              <div
                className="absolute top-0 bottom-0 w-px bg-violet-500/70 pointer-events-none z-10 transition-all duration-75"
                style={{ left: `${playheadLeft + 192}px` }} // 192 = track header width
              />
            </div>
          )}
        </div>
      </div>

      {/* Drop overlay */}
      {isDragOver && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-violet-500/10 border-2 border-dashed border-violet-500/50 m-4 rounded-lg">
          <span className="text-violet-400 text-lg font-medium">Drop to add track</span>
        </div>
      )}
    </div>
  );
}
