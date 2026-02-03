import { useState, useCallback, useRef, useEffect } from 'react';
import { IProject, ITrack, IAudioFile } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface ProjectState {
  id: string | null;
  name: string;
  bpm: number;
  tracks: ITrack[];
  isDirty: boolean;
}

const DEFAULT_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f97316', // orange
  '#22c55e', // green
  '#14b8a6', // teal
  '#f59e0b', // amber
  '#ef4444', // red
];

export function useProject() {
  const [project, setProject] = useState<ProjectState>({
    id: null,
    name: 'Untitled Project',
    bpm: 120,
    tracks: [],
    isDirty: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const colorIndexRef = useRef(0);

  // Auto-save debounce
  useEffect(() => {
    if (project.isDirty && project.id) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        saveProject();
      }, 2000);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.isDirty, project.tracks, project.name, project.bpm]);

  const createProject = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      const newProject: IProject = await response.json();

      setProject({
        id: newProject._id as string,
        name: newProject.name,
        bpm: newProject.bpm,
        tracks: newProject.tracks,
        isDirty: false,
      });

      return newProject;
    } catch (error) {
      console.error('Create project error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadProject = useCallback(async (projectId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`);

      if (!response.ok) {
        throw new Error('Failed to load project');
      }

      const loadedProject: IProject = await response.json();

      setProject({
        id: loadedProject._id as string,
        name: loadedProject.name,
        bpm: loadedProject.bpm,
        tracks: loadedProject.tracks,
        isDirty: false,
      });

      return loadedProject;
    } catch (error) {
      console.error('Load project error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveProject = useCallback(async () => {
    if (!project.id) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: project.name,
          bpm: project.bpm,
          tracks: project.tracks,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save project');
      }

      setProject((prev) => ({ ...prev, isDirty: false }));
    } catch (error) {
      console.error('Save project error:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [project.id, project.name, project.bpm, project.tracks]);

  const deleteProject = useCallback(async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      // If we deleted the current project, clear state
      if (project.id === projectId) {
        setProject({
          id: null,
          name: 'Untitled Project',
          bpm: 120,
          tracks: [],
          isDirty: false,
        });
      }
    } catch (error) {
      console.error('Delete project error:', error);
      throw error;
    }
  }, [project.id]);

  const setName = useCallback((name: string) => {
    setProject((prev) => ({ ...prev, name, isDirty: true }));
  }, []);

  const setBpm = useCallback((bpm: number) => {
    setProject((prev) => ({ ...prev, bpm, isDirty: true }));
  }, []);

  const getNextColor = useCallback(() => {
    const color = DEFAULT_COLORS[colorIndexRef.current % DEFAULT_COLORS.length];
    colorIndexRef.current += 1;
    return color;
  }, []);

  const addTrack = useCallback((audioFile: IAudioFile, position: number = 0) => {
    const newTrack: ITrack = {
      id: uuidv4(),
      audioFileId: audioFile._id as string,
      blobUrl: audioFile.blobUrl,
      trackName: audioFile.originalName.replace(/\.[^/.]+$/, ''),
      position,
      volume: 1.0,
      isMuted: false,
      isSolo: false,
      color: getNextColor(),
    };

    setProject((prev) => ({
      ...prev,
      tracks: [...prev.tracks, newTrack],
      isDirty: true,
    }));

    return newTrack;
  }, [getNextColor]);

  const updateTrack = useCallback((trackId: string, updates: Partial<ITrack>) => {
    setProject((prev) => ({
      ...prev,
      tracks: prev.tracks.map((track) =>
        track.id === trackId ? { ...track, ...updates } : track
      ),
      isDirty: true,
    }));
  }, []);

  const removeTrack = useCallback((trackId: string) => {
    setProject((prev) => ({
      ...prev,
      tracks: prev.tracks.filter((track) => track.id !== trackId),
      isDirty: true,
    }));
  }, []);

  const setTrackPosition = useCallback((trackId: string, position: number) => {
    updateTrack(trackId, { position: Math.max(0, position) });
  }, [updateTrack]);

  const setTrackVolume = useCallback((trackId: string, volume: number) => {
    updateTrack(trackId, { volume: Math.max(0, Math.min(1, volume)) });
  }, [updateTrack]);

  const toggleTrackMute = useCallback((trackId: string) => {
    setProject((prev) => ({
      ...prev,
      tracks: prev.tracks.map((track) =>
        track.id === trackId ? { ...track, isMuted: !track.isMuted } : track
      ),
      isDirty: true,
    }));
  }, []);

  const toggleTrackSolo = useCallback((trackId: string) => {
    setProject((prev) => ({
      ...prev,
      tracks: prev.tracks.map((track) =>
        track.id === trackId ? { ...track, isSolo: !track.isSolo } : track
      ),
      isDirty: true,
    }));
  }, []);

  const setTrackColor = useCallback((trackId: string, color: string) => {
    updateTrack(trackId, { color });
  }, [updateTrack]);

  const setTrackName = useCallback((trackId: string, trackName: string) => {
    updateTrack(trackId, { trackName });
  }, [updateTrack]);

  const clearProject = useCallback(() => {
    setProject({
      id: null,
      name: 'Untitled Project',
      bpm: 120,
      tracks: [],
      isDirty: false,
    });
    colorIndexRef.current = 0;
  }, []);

  return {
    project,
    isSaving,
    isLoading,
    createProject,
    loadProject,
    saveProject,
    deleteProject,
    setName,
    setBpm,
    addTrack,
    updateTrack,
    removeTrack,
    setTrackPosition,
    setTrackVolume,
    toggleTrackMute,
    toggleTrackSolo,
    setTrackColor,
    setTrackName,
    clearProject,
  };
}
