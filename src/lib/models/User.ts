import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser } from '@/types';

export interface IUserDocument extends Omit<IUser, '_id'>, Document {}

const UserSchema = new Schema<IUserDocument>(
  {
    googleId: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      default: null,
      unique: true,
      sparse: true,
      validate: {
        validator: function (v: string | null) {
          if (v === null) return true;
          return /^[a-zA-Z0-9_]{3,20}$/.test(v);
        },
        message: 'Username must be 3-20 characters, alphanumeric and underscores only',
      },
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);

export default User;
