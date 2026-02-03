'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import {
  Save,
  FolderOpen,
  FilePlus,
  Upload,
  LogOut,
  User,
  Loader2,
  Music2,
  Check,
} from 'lucide-react';

interface ToolbarProps {
  projectName: string;
  bpm: number;
  isSaving: boolean;
  onNameChange: (name: string) => void;
  onBpmChange: (bpm: number) => void;
  onSave: () => void;
  onNewProject: () => void;
  onLoadProject: () => void;
  onUpload: () => void;
}

export default function Toolbar({
  projectName,
  bpm,
  isSaving,
  onNameChange,
  onBpmChange,
  onSave,
  onNewProject,
  onLoadProject,
  onUpload,
}: ToolbarProps) {
  const { data: session } = useSession();
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(projectName);
  const [showSaved, setShowSaved] = useState(false);

  const handleNameClick = () => {
    setTempName(projectName);
    setIsEditingName(true);
  };

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
      setIsEditingName(false);
    }
  };

  const handleSave = async () => {
    onSave();
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  return (
    <header className="h-14 bg-[#1a1d24] border-b border-[#2d3139] flex items-center justify-between px-4 flex-shrink-0">
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
          <Music2 className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-white">Mixolidio</span>
      </div>

      {/* Center: Project name and BPM */}
      <div className="flex items-center gap-6">
        {/* Project name */}
        <div className="flex items-center">
          {isEditingName ? (
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onBlur={handleNameSubmit}
              onKeyDown={handleNameKeyDown}
              className="bg-[#0f1117] border border-violet-500 rounded px-2 py-1 text-white text-sm focus:outline-none w-48"
              autoFocus
            />
          ) : (
            <button
              onClick={handleNameClick}
              className="text-white font-medium hover:text-violet-400 transition-colors"
            >
              {projectName}
            </button>
          )}
        </div>

        {/* BPM */}
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">BPM</span>
          <input
            type="number"
            value={bpm}
            onChange={(e) => onBpmChange(Math.max(20, Math.min(300, parseInt(e.target.value) || 120)))}
            className="w-16 bg-[#0f1117] border border-[#2d3139] rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-violet-500"
            min={20}
            max={300}
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-[#252830] rounded transition-colors disabled:opacity-50"
            title="Save project"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : showSaved ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {showSaved ? 'Saved!' : 'Save'}
          </button>

          <button
            onClick={onNewProject}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-[#252830] rounded transition-colors"
            title="New project"
          >
            <FilePlus className="w-4 h-4" />
            New
          </button>

          <button
            onClick={onLoadProject}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-[#252830] rounded transition-colors"
            title="Load project"
          >
            <FolderOpen className="w-4 h-4" />
            Load
          </button>

          <button
            onClick={onUpload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-violet-600 hover:bg-violet-700 rounded transition-colors"
            title="Upload audio"
          >
            <Upload className="w-4 h-4" />
            Upload
          </button>
        </div>
      </div>

      {/* Right: User info */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-8 h-8 rounded-full bg-[#252830] flex items-center justify-center">
            {session?.user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt="Avatar"
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <User className="w-4 h-4 text-gray-400" />
            )}
          </div>
          <span className="text-gray-300">{session?.user?.username || session?.user?.name}</span>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="p-2 text-gray-400 hover:text-white hover:bg-[#252830] rounded transition-colors"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
