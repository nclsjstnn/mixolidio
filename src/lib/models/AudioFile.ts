import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { IAudioFile } from '@/types';

export interface IAudioFileDocument extends Omit<IAudioFile, '_id' | 'userId'>, Document {
  userId: Types.ObjectId;
}

const AudioFileSchema = new Schema<IAudioFileDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    blobUrl: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// Index for fast queries by user
AudioFileSchema.index({ userId: 1 });

const AudioFile: Model<IAudioFileDocument> =
  mongoose.models.AudioFile || mongoose.model<IAudioFileDocument>('AudioFile', AudioFileSchema);

export default AudioFile;
