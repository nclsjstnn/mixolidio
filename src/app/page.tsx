'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Toolbar from '@/components/Toolbar';
import Sidebar from '@/components/Sidebar';
import Timeline from '@/components/Timeline';
import PlayControls from '@/components/PlayControls';
import ProjectModal from '@/components/ProjectModal';
import { ToastContainer } from '@/components/Toast';
import { useProject } from '@/hooks/useProject';
import { usePlayback } from '@/hooks/usePlayback';
import { useToast } from '@/hooks/useToast';
import { IAudioFile } from '@/types';
import { Loader2 } from 'lucide-react';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/ogg',
  'audio/webm',
  'audio/flac',
  'audio/mp4',
  'audio/x-m4a',
];

export default function DAWPage() {
  const { status } = useSession();
  const { toasts, removeToast, success, error: showError } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Audio files state
  const [audioFiles, setAudioFiles] = useState<IAudioFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [, setIsLoadingFiles] = useState(true);

  // Project state
  const {
    project,
    isSaving,
    isLoading: isLoadingProject,
    createProject,
    loadProject,
    saveProject,
    deleteProject,
    setName,
    setBpm,
    addTrack,
    setTrackPosition,
    setTrackVolume,
    toggleTrackMute,
    toggleTrackSolo,
    setTrackColor,
    setTrackName,
    removeTrack,
  } = useProject();

  // Playback state
  const {
    isPlaying,
    isPaused,
    currentTime,
    totalDuration,
    isLoading: isLoadingPlayback,
    play,
    pause,
    stop,
    seek,
    loadTracks,
    setTrackVolume: setPlaybackVolume,
    getDurations,
  } = usePlayback();

  // Modal state
  const [showProjectModal, setShowProjectModal] = useState(false);

  // Track durations from playback engine
  const [trackDurations, setTrackDurations] = useState<Map<string, number>>(new Map());

  // Fetch audio files on mount
  useEffect(() => {
    fetchAudioFiles();
  }, []);

  // Create initial project if none exists
  useEffect(() => {
    if (!project.id && !isLoadingProject && status === 'authenticated') {
      createProject().catch((err) => {
        showError('Failed to create project');
        console.error(err);
      });
    }
  }, [project.id, isLoadingProject, status, createProject, showError]);

  // Load tracks when project changes
  useEffect(() => {
    if (project.tracks.length > 0) {
      loadTracks(project.tracks).then(() => {
        setTrackDurations(getDurations());
      });
    }
  }, [project.tracks, loadTracks, getDurations]);

  const fetchAudioFiles = async () => {
    setIsLoadingFiles(true);
    try {
      const response = await fetch('/api/upload');
      if (response.ok) {
        const files = await response.json();
        setAudioFiles(files);
      }
    } catch (err) {
      console.error('Failed to fetch audio files:', err);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleUpload = async (file: File) => {
    // Validate file type
    if (!ALLOWED_AUDIO_TYPES.includes(file.type)) {
      showError('Invalid file type. Only audio files are allowed.');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      showError('File too large. Maximum size is 50 MB.');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      const newFile = await response.json();

      // Refresh the file list
      await fetchAudioFiles();

      success(`Uploaded: ${newFile.originalName}`);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (id: string) => {
    try {
      const response = await fetch(`/api/upload/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }

      setAudioFiles((prev) => prev.filter((f) => f._id !== id));
      success('File deleted');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to delete file');
      throw err;
    }
  };

  const handleDragStart = (e: React.DragEvent, file: IAudioFile) => {
    e.dataTransfer.setData('application/json', JSON.stringify(file));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDropFile = useCallback(
    (file: IAudioFile, position: number) => {
      addTrack(file, position);
      success(`Added track: ${file.originalName}`);
    },
    [addTrack, success]
  );

  const handleSave = async () => {
    try {
      await saveProject();
      success('Project saved');
    } catch {
      showError('Failed to save project');
    }
  };

  const handleNewProject = async () => {
    stop();
    try {
      await createProject();
      success('New project created');
    } catch {
      showError('Failed to create project');
    }
  };

  const handleLoadProject = async (projectId: string) => {
    stop();
    setShowProjectModal(false);
    try {
      await loadProject(projectId);
      success('Project loaded');
    } catch {
      showError('Failed to load project');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProject(projectId);
      success('Project deleted');
    } catch {
      showError('Failed to delete project');
    }
  };

  const handlePlay = useCallback(async () => {
    if (project.tracks.length === 0) {
      showError('No tracks to play');
      return;
    }
    await play(project.tracks);
  }, [play, project.tracks, showError]);

  const handleVolumeChange = useCallback(
    (trackId: string, volume: number) => {
      setTrackVolume(trackId, volume);
      setPlaybackVolume(trackId, volume);
    },
    [setTrackVolume, setPlaybackVolume]
  );

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Show loading state while session is loading
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#0f1117] overflow-hidden">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleUpload(file);
            e.target.value = '';
          }
        }}
        className="hidden"
      />

      {/* Toolbar */}
      <Toolbar
        projectName={project.name}
        bpm={project.bpm}
        isSaving={isSaving}
        onNameChange={setName}
        onBpmChange={setBpm}
        onSave={handleSave}
        onNewProject={handleNewProject}
        onLoadProject={() => setShowProjectModal(true)}
        onUpload={handleUploadClick}
      />

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          audioFiles={audioFiles}
          onUpload={handleUpload}
          onDelete={handleDeleteFile}
          onDragStart={handleDragStart}
          isUploading={isUploading}
        />

        {/* Timeline */}
        <Timeline
          tracks={project.tracks}
          durations={trackDurations}
          currentTime={currentTime}
          isPlaying={isPlaying}
          bpm={project.bpm}
          onTrackVolumeChange={handleVolumeChange}
          onTrackMuteToggle={toggleTrackMute}
          onTrackSoloToggle={toggleTrackSolo}
          onTrackColorChange={setTrackColor}
          onTrackNameChange={setTrackName}
          onTrackDelete={removeTrack}
          onTrackPositionChange={setTrackPosition}
          onDropFile={handleDropFile}
          onSeek={seek}
        />
      </div>

      {/* Play controls */}
      <PlayControls
        isPlaying={isPlaying}
        isPaused={isPaused}
        isLoading={isLoadingPlayback}
        currentTime={currentTime}
        totalDuration={totalDuration}
        onPlay={handlePlay}
        onPause={pause}
        onStop={stop}
        onSeek={seek}
      />

      {/* Project modal */}
      <ProjectModal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onSelect={handleLoadProject}
        onDelete={handleDeleteProject}
      />

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
