'use client';

import { useState, useEffect } from 'react';
import { X, Folder, Trash2, Loader2, Calendar, Music } from 'lucide-react';

interface ProjectListItem {
  _id: string;
  name: string;
  bpm: number;
  trackCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (projectId: string) => void;
  onDelete: (projectId: string) => void;
}

export default function ProjectModal({
  isOpen,
  onClose,
  onSelect,
  onDelete,
}: ProjectModalProps) {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen]);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    setDeletingId(projectId);
    try {
      await onDelete(projectId);
      setProjects((prev) => prev.filter((p) => p._id !== projectId));
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-[#1a1d24] rounded-xl shadow-2xl border border-[#2d3139] max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2d3139]">
          <div className="flex items-center gap-2">
            <Folder className="w-5 h-5 text-violet-400" />
            <h2 className="text-lg font-semibold text-white">Load Project</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-[#252830] rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Folder className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-1">No projects yet</p>
              <p className="text-sm">Create a new project to get started</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {projects.map((project) => (
                <li
                  key={project._id}
                  onClick={() => onSelect(project._id)}
                  className="group bg-[#252830] hover:bg-[#2d3139] rounded-lg p-4 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium truncate group-hover:text-violet-400 transition-colors">
                        {project.name}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Music className="w-3.5 h-3.5" />
                          {project.trackCount} tracks
                        </span>
                        <span>{project.bpm} BPM</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(project.updatedAt)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDelete(e, project._id)}
                      disabled={deletingId === project._id}
                      className="p-2 text-gray-500 hover:text-red-400 hover:bg-[#1a1d24] rounded transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete project"
                    >
                      {deletingId === project._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2d3139] text-sm text-gray-500 text-center">
          Click a project to load it
        </div>
      </div>
    </div>
  );
}
