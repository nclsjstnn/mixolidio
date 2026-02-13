import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { IProject, ITrack } from '@/types';

// Track subdocument schema
const TrackSchema = new Schema<ITrack>(
  {
    id: {
      type: String,
      required: true,
    },
    audioFileId: {
      type: Schema.Types.ObjectId,
      ref: 'AudioFile',
      required: true,
    },
    blobUrl: {
      type: String,
      required: true,
    },
    trackName: {
      type: String,
      default: 'Track',
    },
    position: {
      type: Number,
      required: true,
      default: 0,
    },
    volume: {
      type: Number,
      required: true,
      default: 1.0,
      min: 0,
      max: 1,
    },
    isMuted: {
      type: Boolean,
      default: false,
    },
    isSolo: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: '#3b82f6',
    },
  },
  { _id: false }
);

export interface IProjectDocument extends Omit<IProject, '_id' | 'userId'>, Document {
  userId: Types.ObjectId;
}

const ProjectSchema = new Schema<IProjectDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      default: 'Untitled Project',
    },
    bpm: {
      type: Number,
      default: 120,
      min: 20,
      max: 300,
    },
    tracks: {
      type: [TrackSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast queries by user
ProjectSchema.index({ userId: 1 });

const Project: Model<IProjectDocument> =
  mongoose.models.Project || mongoose.model<IProjectDocument>('Project', ProjectSchema);

export default Project;
