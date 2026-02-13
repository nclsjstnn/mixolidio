'use client';

import { useState, useRef, useEffect } from 'react';
import { ITrack } from '@/types';

interface ClipProps {
  track: ITrack;
  duration: number;
  pixelsPerSecond: number;
  onPositionChange: (position: number) => void;
  snapInterval: number;
}

export default function Clip({
  track,
  duration,
  pixelsPerSecond,
  onPositionChange,
  snapInterval,
}: ClipProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const clipRef = useRef<HTMLDivElement>(null);

  const clipWidth = duration * pixelsPerSecond;
  const clipLeft = track.position * pixelsPerSecond;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const clipRect = clipRef.current?.getBoundingClientRect();
    if (clipRect) {
      setDragOffset(e.clientX - clipRect.left);
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const timelineContainer = clipRef.current?.parentElement;
      if (!timelineContainer) return;

      const timelineRect = timelineContainer.getBoundingClientRect();
      const relativeX = e.clientX - timelineRect.left - dragOffset + timelineContainer.scrollLeft;

      // Convert to seconds
      let newPosition = relativeX / pixelsPerSecond;

      // Snap to grid
      newPosition = Math.round(newPosition / snapInterval) * snapInterval;

      // Clamp to valid range
      newPosition = Math.max(0, newPosition);

      onPositionChange(newPosition);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, pixelsPerSecond, snapInterval, onPositionChange]);

  const truncateName = (name: string, maxWidth: number): string => {
    // Estimate chars that fit (roughly 7px per char at 11px font)
    const maxChars = Math.floor(maxWidth / 7);
    if (name.length <= maxChars) return name;
    return name.slice(0, maxChars - 2) + '..';
  };

  return (
    <div
      ref={clipRef}
      onMouseDown={handleMouseDown}
      className={`absolute top-1 bottom-1 rounded cursor-grab transition-shadow ${
        isDragging ? 'cursor-grabbing shadow-lg ring-2 ring-white/30 z-10' : 'hover:brightness-110'
      } ${track.isMuted ? 'opacity-50' : ''}`}
      style={{
        left: `${clipLeft}px`,
        width: `${Math.max(clipWidth, 40)}px`,
        backgroundColor: track.color,
      }}
    >
      {/* Clip content */}
      <div className="absolute inset-0 px-2 py-1 overflow-hidden">
        {/* Track name */}
        <span className="text-xs font-medium text-white/90 whitespace-nowrap">
          {truncateName(track.trackName, clipWidth - 16)}
        </span>

        {/* Waveform placeholder - could be replaced with actual waveform */}
        <div className="absolute inset-x-0 bottom-0 top-5 flex items-center px-1">
          <div className="w-full h-full flex items-center gap-px opacity-40">
            {Array.from({ length: Math.max(Math.floor(clipWidth / 3), 1) }).map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-white/60 rounded-sm"
                style={{
                  height: `${20 + Math.sin(i * 0.3) * 30 + Math.random() * 30}%`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Resize handles (visual only for now) */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-black/20 cursor-ew-resize opacity-0 hover:opacity-100 transition-opacity" />
      <div className="absolute right-0 top-0 bottom-0 w-1 bg-black/20 cursor-ew-resize opacity-0 hover:opacity-100 transition-opacity" />
    </div>
  );
}
