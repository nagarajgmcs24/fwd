import mongoose, { Schema, Document, Types } from 'mongoose';

export enum IssueStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED'
}

export enum IssuePriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export enum IssueCategory {
  POTHOLE = 'Pothole',
  STREET_LIGHT = 'Street Light',
  WASTE = 'Waste Management',
  ROAD_DAMAGE = 'Road Damage',
  TRAFFIC = 'Traffic Signal',
  WATER = 'Water Supply',
  DRAINAGE = 'Drainage',
  PARK = 'Park Maintenance',
  OTHER = 'Other'
}

export interface IIssue extends Document {
  title: string;
  description: string;
  category: IssueCategory;
  status: IssueStatus;
  priority: IssuePriority;
  ward: string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  image?: string;
  reportedBy: string;
  reportedByEmail: string;
  reportedById: Types.ObjectId;
  assignedTo?: Types.ObjectId;
  aiAnalysis?: string;
  comments?: Array<{
    userId: Types.ObjectId;
    userName: string;
    text: string;
    createdAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const issueSchema = new Schema<IIssue>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    category: {
      type: String,
      enum: Object.values(IssueCategory),
      required: true
    },
    status: {
      type: String,
      enum: Object.values(IssueStatus),
      default: IssueStatus.PENDING
    },
    priority: {
      type: String,
      enum: Object.values(IssuePriority),
      default: IssuePriority.MEDIUM
    },
    ward: {
      type: String,
      required: true,
      index: true
    },
    location: {
      type: {
        lat: Number,
        lng: Number,
        address: String
      },
      default: null
    },
    image: {
      type: String,
      default: null
    },
    reportedBy: {
      type: String,
      required: true
    },
    reportedByEmail: {
      type: String,
      required: true
    },
    reportedById: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    aiAnalysis: {
      type: String,
      default: null
    },
    comments: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        userName: String,
        text: String,
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true,
    indexes: [
      { ward: 1, status: 1 },
      { reportedById: 1 },
      { createdAt: -1 }
    ]
  }
);

export default mongoose.model<IIssue>('Issue', issueSchema);
