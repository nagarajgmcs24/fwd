
export enum UserRole {
  CITIZEN = 'CITIZEN',
  COUNCILLOR = 'COUNCILLOR'
}

export enum IssueStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED'
}

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  ward: string;
  password: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  status: IssueStatus;
  priority: 'Low' | 'Medium' | 'High';
  reportedBy: string; // User name
  reportedByEmail: string; // Citizen's email for follow-up
  reportedById: string;
  ward: string;
  createdAt: string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  image?: string;
  aiAnalysis?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
