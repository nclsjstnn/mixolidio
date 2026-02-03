'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Play,
  Square,
  Trash2,
  Music,
  Upload,
  Loader2,
  GripVertical,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { IAudioFile } from '@/types';

interface SidebarProps {
  audioFiles: IAudioFile[];
  onUpload: (file: File) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onDragStart: (e: React.DragEvent, file: IAudioFile) => void;
  isUploading: boolean;
}

export default function Sidebar({
  audioFiles,
  onUpload,
  onDelete,
  onDragStart,
  isUploading,
}: SidebarProps) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onUpload(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handlePlay = (file: IAudioFile) => {
    if (playingId === file._id) {
      // Stop playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setPlayingId(null);
    } else {
      // Start playing
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(file.blobUrl);
      audio.onended = () => {
        setPlayingId(null);
        audioRef.current = null;
      };
      audio.play();
      audioRef.current = audio;
      setPlayingId(file._id as string);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const truncateName = (name: string, maxLength: number = 20): string => {
    if (name.length <= maxLength) return name;
    const ext = name.split('.').pop();
    const base = name.slice(0, name.lastIndexOf('.'));
    const truncatedBase = base.slice(0, maxLength - (ext?.length || 0) - 4);
    return `${truncatedBase}...${ext}`;
  };

  if (isCollapsed) {
    return (
      <div className="w-10 bg-[#1a1d24] border-r border-[#2d3139] flex flex-col items-center py-4">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 text-gray-400 hover:text-white hover:bg-[#252830] rounded transition-colors"
          title="Expand sidebar"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <div className="mt-4">
          <Music className="w-5 h-5 text-gray-500" />
        </div>
        <span className="mt-2 text-xs text-gray-500 writing-mode-vertical">
          {audioFiles.length} files
        </span>
      </div>
    );
  }

  return (
    <div className="w-64 bg-[#1a1d24] border-r border-[#2d3139] flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[#2d3139]">
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4 text-violet-400" />
          <span className="font-medium text-white text-sm">Audio Library</span>
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1 text-gray-400 hover:text-white hover:bg-[#252830] rounded transition-colors"
          title="Collapse sidebar"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Upload button */}
      <div className="p-3 border-b border-[#2d3139]">
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full flex items-center justify-center gap-2 py-2 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-600/50 text-white text-sm rounded transition-colors"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Upload Audio
            </>
          )}
        </button>
      </div>

      {/* File list */}
      <div className="flex-1 overflow-y-auto">
        {audioFiles.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            <Music className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No audio files yet</p>
            <p className="text-xs mt-1">Upload samples to get started</p>
          </div>
        ) : (
          <ul className="p-2 space-y-1">
            {audioFiles.map((file) => (
              <li
                key={file._id as string}
                draggable
                onDragStart={(e) => onDragStart(e, file)}
                className="group bg-[#252830] hover:bg-[#2d3139] rounded p-2 cursor-grab active:cursor-grabbing transition-colors"
              >
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-gray-600 group-hover:text-gray-400 flex-shrink-0" />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate" title={file.originalName}>
                      {truncateName(file.originalName)}
                    </p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.fileSize)}</p>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handlePlay(file)}
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-[#1a1d24] rounded transition-colors"
                      title={playingId === file._id ? 'Stop' : 'Preview'}
                    >
                      {playingId === file._id ? (
                        <Square className="w-3.5 h-3.5" />
                      ) : (
                        <Play className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(file._id as string)}
                      disabled={deletingId === file._id}
                      className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-[#1a1d24] rounded transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      {deletingId === file._id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-[#2d3139] text-xs text-gray-500 text-center">
        Drag files to timeline
      </div>
    </div>
  );
}
