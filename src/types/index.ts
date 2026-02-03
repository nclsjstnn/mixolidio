import { Types } from 'mongoose';

// User interface
export interface IUser {
  _id?: Types.ObjectId | string;
  googleId: string;
  email: string;
  username: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// AudioFile interface
export interface IAudioFile {
  _id?: Types.ObjectId | string;
  userId: Types.ObjectId | string;
  originalName: string;
  blobUrl: string;
  mimeType: string;
  fileSize: number;
  uploadedAt?: Date;
}

// Track interface (embedded in Project)
export interface ITrack {
  id: string;
  audioFileId: Types.ObjectId | string;
  blobUrl: string;
  trackName: string;
  position: number;
  volume: number;
  isMuted: boolean;
  isSolo: boolean;
  color: string;
}

// Project interface
export interface IProject {
  _id?: Types.ObjectId | string;
  userId: Types.ObjectId | string;
  name: string;
  bpm: number;
  tracks: ITrack[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Client-side track with duration (computed from audio)
export interface ITrackWithDuration extends ITrack {
  duration?: number;
}

// Session user type for NextAuth
export interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  username?: string | null;
  googleId?: string;
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UploadResponse {
  id: string;
  blobUrl: string;
  originalName: string;
}

// Playback state
export interface PlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
}
