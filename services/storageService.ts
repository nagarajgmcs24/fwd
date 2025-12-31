
import { User, Issue, UserRole, IssueStatus } from '../types.ts';

const USERS_KEY = 'fmw_users';
const ISSUES_KEY = 'fmw_issues';
const CURRENT_USER_KEY = 'fmw_current_user';

export const storage = {
  getUsers: (): User[] => JSON.parse(localStorage.getItem(USERS_KEY) || '[]'),
  saveUser: (user: User) => {
    const users = storage.getUsers();
    users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },
  getCurrentUser: (): User | null => {
    const user = localStorage.getItem(CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
  },
  setCurrentUser: (user: User | null) => {
    if (user) localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(CURRENT_USER_KEY);
  },
  getIssues: (): Issue[] => JSON.parse(localStorage.getItem(ISSUES_KEY) || '[]'),
  addIssue: (issue: Issue) => {
    const issues = storage.getIssues();
    issues.unshift(issue);
    localStorage.setItem(ISSUES_KEY, JSON.stringify(issues));
  },
  updateIssueStatus: (issueId: string, status: IssueStatus) => {
    const issues = storage.getIssues();
    const index = issues.findIndex(i => i.id === issueId);
    if (index !== -1) {
      issues[index].status = status;
      localStorage.setItem(ISSUES_KEY, JSON.stringify(issues));
    }
  },
  seedData: () => {
    if (storage.getUsers().length === 0) {
      const demoUsers: User[] = [
        { id: 'u1', username: 'citizen1', name: 'Arjun Mehta', email: 'arjun@example.com', role: UserRole.CITIZEN, ward: 'HSR Layout (Ward 174)', password: 'password123' },
        { id: 'u2', username: 'councillor1', name: 'Meera Hegde', email: 'councillor.hsr@bbmp.gov.in', role: UserRole.COUNCILLOR, ward: 'HSR Layout (Ward 174)', password: 'password123' }
      ];
      localStorage.setItem(USERS_KEY, JSON.stringify(demoUsers));
    }
  }
};
