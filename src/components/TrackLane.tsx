'use client';

import TrackHeader from './TrackHeader';
import Clip from './Clip';
import { ITrack } from '@/types';

interface TrackLaneProps {
  track: ITrack;
  duration: number;
  pixelsPerSecond: number;
  timelineWidth: number;
  snapInterval: number;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  onSoloToggle: () => void;
  onColorChange: (color: string) => void;
  onNameChange: (name: string) => void;
  onDelete: () => void;
  onPositionChange: (position: number) => void;
}

export default function TrackLane({
  track,
  duration,
  pixelsPerSecond,
  timelineWidth,
  snapInterval,
  onVolumeChange,
  onMuteToggle,
  onSoloToggle,
  onColorChange,
  onNameChange,
  onDelete,
  onPositionChange,
}: TrackLaneProps) {
  return (
    <div className="flex border-b border-[#2d3139] h-16">
      {/* Track header */}
      <TrackHeader
        track={track}
        onVolumeChange={onVolumeChange}
        onMuteToggle={onMuteToggle}
        onSoloToggle={onSoloToggle}
        onColorChange={onColorChange}
        onNameChange={onNameChange}
        onDelete={onDelete}
      />

      {/* Clip area */}
      <div
        className="flex-1 relative bg-[#0f1117] timeline-grid"
        style={{
          minWidth: `${timelineWidth}px`,
          backgroundSize: `${pixelsPerSecond}px 100%`,
        }}
      >
        {duration > 0 && (
          <Clip
            track={track}
            duration={duration}
            pixelsPerSecond={pixelsPerSecond}
            onPositionChange={onPositionChange}
            snapInterval={snapInterval}
          />
        )}
      </div>
    </div>
  );
}
