import mongoose, { Schema, Document, Types } from 'mongoose';

export enum NotificationType {
  SECURITY = 'SECURITY',
  DISPATCHED = 'DISPATCHED',
  RECEIVED = 'RECEIVED',
  UPDATE = 'UPDATE',
  RESET = 'RESET'
}

export interface INotification extends Document {
  to: string;
  userId: Types.ObjectId;
  subject: string;
  body: string;
  type: NotificationType;
  issueId?: Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    to: {
      type: String,
      required: true,
      lowercase: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    subject: {
      type: String,
      required: true
    },
    body: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true
    },
    issueId: {
      type: Schema.Types.ObjectId,
      ref: 'Issue',
      default: null
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

export default mongoose.model<INotification>('Notification', notificationSchema);
