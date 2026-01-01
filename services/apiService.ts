import { User, Issue, EmailNotification, UserRole, IssueStatus } from '../types.ts';
import { io, Socket } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  private token: string | null = null;
  private socket: Socket | null = null;
  private userId: string | null = null;

  constructor() {
    this.token = localStorage.getItem('authToken');
    this.userId = localStorage.getItem('userId');
  }

  // ==================== Authentication ====================

  async signup(data: {
    username: string;
    email: string;
    name: string;
    password: string;
    role: UserRole;
    ward: string;
  }): Promise<{ user: User; token: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Signup failed');
    }

    const result = await response.json();
    this.token = result.token;
    this.userId = result.user.id;
    localStorage.setItem('authToken', result.token);
    localStorage.setItem('userId', result.user.id);
    return result;
  }

  async login(data: {
    username: string;
    password: string;
    role: UserRole;
  }): Promise<{ user: User; token: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const result = await response.json();
    this.token = result.token;
    this.userId = result.user.id;
    localStorage.setItem('authToken', result.token);
    localStorage.setItem('userId', result.user.id);
    return result;
  }

  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch current user');
    }

    const result = await response.json();
    return result.user;
  }

  logout(): void {
    this.token = null;
    this.userId = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    this.disconnectSocket();
  }

  // ==================== Issues ====================

  async createIssue(data: {
    title: string;
    description: string;
    category: string;
    priority?: string;
    ward: string;
    location?: { lat: number; lng: number; address?: string };
    image?: string;
  }): Promise<{ message: string; issue: Issue }> {
    const response = await fetch(`${API_BASE_URL}/issues`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create issue');
    }

    const result = await response.json();
    
    // Emit socket event for real-time update
    if (this.socket && this.socket.connected) {
      this.socket.emit('issue-created', {
        issueId: result.issue.id,
        ward: result.issue.ward,
        category: result.issue.category,
        title: result.issue.title
      });
    }

    return result;
  }

  async getIssues(filters?: {
    ward?: string;
    status?: IssueStatus;
    category?: string;
  }): Promise<{ issues: Issue[] }> {
    const queryParams = new URLSearchParams();
    if (filters?.ward) queryParams.append('ward', filters.ward);
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.category) queryParams.append('category', filters.category);

    const response = await fetch(
      `${API_BASE_URL}/issues?${queryParams.toString()}`,
      {
        headers: this.getAuthHeaders()
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch issues');
    }

    return response.json();
  }

  async getIssueById(id: string): Promise<{ issue: Issue }> {
    const response = await fetch(`${API_BASE_URL}/issues/${id}`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch issue');
    }

    return response.json();
  }

  async updateIssueStatus(
    id: string,
    status: IssueStatus
  ): Promise<{ message: string; issue: Issue }> {
    const response = await fetch(`${API_BASE_URL}/issues/${id}/status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update issue');
    }

    const result = await response.json();
    
    // Emit socket event for real-time update
    if (this.socket && this.socket.connected) {
      this.socket.emit('issue-status-update', {
        issueId: id,
        status: status,
        ward: result.issue.ward,
        message: `Issue status updated to ${status}`
      });
    }

    return result;
  }

  async addComment(id: string, text: string): Promise<{ message: string; issue: Issue }> {
    const response = await fetch(`${API_BASE_URL}/issues/${id}/comments`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add comment');
    }

    return response.json();
  }

  async deleteIssue(id: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/issues/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete issue');
    }

    return response.json();
  }

  // ==================== Real-time Socket.io ====================

  initializeSocket(ward: string, onUpdate: (data: any) => void): void {
    if (this.socket && this.socket.connected) {
      this.socket.disconnect();
    }

    this.socket = io(API_BASE_URL.replace('/api', ''), {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.socket?.emit('join-ward', ward);
    });

    this.socket.on('issue-updated', (data) => {
      console.log('Issue updated:', data);
      onUpdate(data);
    });

    this.socket.on('new-issue', (data) => {
      console.log('New issue:', data);
      onUpdate(data);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  changeWard(oldWard: string, newWard: string): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('leave-ward', oldWard);
      this.socket.emit('join-ward', newWard);
    }
  }

  disconnectSocket(): void {
    if (this.socket && this.socket.connected) {
      this.socket.disconnect();
    }
  }

  // ==================== Helper Methods ====================

  private getAuthHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    };
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }
}

export const apiService = new ApiService();
