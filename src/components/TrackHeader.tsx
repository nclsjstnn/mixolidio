'use client';

import { useState } from 'react';
import { Volume2, VolumeX, Headphones, Trash2 } from 'lucide-react';
import { ITrack } from '@/types';

interface TrackHeaderProps {
  track: ITrack;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  onSoloToggle: () => void;
  onColorChange: (color: string) => void;
  onNameChange: (name: string) => void;
  onDelete: () => void;
}

const TRACK_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f97316', // orange
  '#22c55e', // green
  '#14b8a6', // teal
  '#f59e0b', // amber
  '#ef4444', // red
  '#6366f1', // indigo
  '#84cc16', // lime
];

export default function TrackHeader({
  track,
  onVolumeChange,
  onMuteToggle,
  onSoloToggle,
  onColorChange,
  onNameChange,
  onDelete,
}: TrackHeaderProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(track.trackName);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleNameSubmit = () => {
    if (tempName.trim()) {
      onNameChange(tempName.trim());
    }
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSubmit();
    } else if (e.key === 'Escape') {
      setTempName(track.trackName);
      setIsEditingName(false);
    }
  };

  return (
    <div className="w-48 bg-[#1a1d24] border-r border-[#2d3139] p-2 flex flex-col gap-2 flex-shrink-0">
      {/* Top row: Color, Name, Delete */}
      <div className="flex items-center gap-2">
        {/* Color picker */}
        <div className="relative">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="w-4 h-4 rounded flex-shrink-0 ring-1 ring-white/20"
            style={{ backgroundColor: track.color }}
            title="Change color"
          />

          {showColorPicker && (
            <div className="absolute top-6 left-0 z-10 p-2 bg-[#252830] rounded-lg shadow-xl border border-[#2d3139] grid grid-cols-5 gap-1">
              {TRACK_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    onColorChange(color);
                    setShowColorPicker(false);
                  }}
                  className="w-5 h-5 rounded hover:scale-110 transition-transform ring-1 ring-white/10"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Track name */}
        <div className="flex-1 min-w-0">
          {isEditingName ? (
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onBlur={handleNameSubmit}
              onKeyDown={handleNameKeyDown}
              className="w-full bg-[#0f1117] border border-violet-500 rounded px-1.5 py-0.5 text-white text-xs focus:outline-none"
              autoFocus
            />
          ) : (
            <button
              onClick={() => {
                setTempName(track.trackName);
                setIsEditingName(true);
              }}
              className="w-full text-left text-xs text-white truncate hover:text-violet-400 transition-colors"
              title={track.trackName}
            >
              {track.trackName}
            </button>
          )}
        </div>

        {/* Delete button */}
        <button
          onClick={onDelete}
          className="p-1 text-gray-500 hover:text-red-400 transition-colors"
          title="Delete track"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Middle row: Mute, Solo buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={onMuteToggle}
          className={`flex-1 py-1 text-xs font-medium rounded transition-colors ${
            track.isMuted
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : 'bg-[#252830] text-gray-400 hover:text-white border border-transparent'
          }`}
          title={track.isMuted ? 'Unmute' : 'Mute'}
        >
          {track.isMuted ? (
            <VolumeX className="w-3.5 h-3.5 mx-auto" />
          ) : (
            <span>M</span>
          )}
        </button>

        <button
          onClick={onSoloToggle}
          className={`flex-1 py-1 text-xs font-medium rounded transition-colors ${
            track.isSolo
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'bg-[#252830] text-gray-400 hover:text-white border border-transparent'
          }`}
          title={track.isSolo ? 'Unsolo' : 'Solo'}
        >
          {track.isSolo ? (
            <Headphones className="w-3.5 h-3.5 mx-auto" />
          ) : (
            <span>S</span>
          )}
        </button>
      </div>

      {/* Bottom row: Volume slider */}
      <div className="flex items-center gap-2">
        <Volume2 className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={track.volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="flex-1 h-1"
          title={`Volume: ${Math.round(track.volume * 100)}%`}
        />
        <span className="text-xs text-gray-500 w-8 text-right">
          {Math.round(track.volume * 100)}%
        </span>
      </div>
    </div>
  );
}
