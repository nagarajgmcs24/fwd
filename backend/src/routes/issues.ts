import { Router } from 'express';
import {
  createIssue,
  getIssues,
  getIssueById,
  updateIssueStatus,
  addComment,
  deleteIssue
} from '../controllers/issuesController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Create issue (citizens)
router.post('/', createIssue);

// Get all issues (filtered by role)
router.get('/', getIssues);

// Get specific issue
router.get('/:id', getIssueById);

// Update issue status (councillors only)
router.patch('/:id/status', requireRole(['COUNCILLOR']), updateIssueStatus);

// Add comment
router.post('/:id/comments', addComment);

// Delete issue (only reporter)
router.delete('/:id', deleteIssue);

export default router;
