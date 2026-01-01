import { Response } from 'express';
import Issue, { IssueStatus } from '../models/Issue.js';
import User from '../models/User.js';
import { AuthRequest } from '../middleware/auth.js';

export const createIssue = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { title, description, category, priority, ward, location, image } = req.body;

    // Validation
    if (!title || !description || !category || !ward) {
      res.status(400).json({ error: 'Title, description, category, and ward are required' });
      return;
    }

    // Get user details
    const user = await User.findById(req.user.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Create new issue
    const newIssue = new Issue({
      title,
      description,
      category,
      priority: priority || 'Medium',
      ward,
      location,
      image,
      reportedBy: user.name,
      reportedByEmail: user.email,
      reportedById: req.user.userId
    });

    await newIssue.save();

    res.status(201).json({
      message: 'Issue created successfully',
      issue: newIssue
    });
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({ error: 'Failed to create issue' });
  }
};

export const getIssues = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { ward, status, category } = req.query;
    const filter: any = {};

    // Apply filters
    if (ward) filter.ward = ward;
    if (status) filter.status = status;
    if (category) filter.category = category;

    // Filter by user role
    if (req.user.role === 'CITIZEN') {
      filter.reportedById = req.user.userId;
    } else if (req.user.role === 'COUNCILLOR') {
      filter.ward = req.user.ward;
    }

    const issues = await Issue.find(filter)
      .sort({ createdAt: -1 })
      .populate('reportedById', 'name email')
      .populate('assignedTo', 'name email');

    res.status(200).json({ issues });
  } catch (error) {
    console.error('Get issues error:', error);
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
};

export const getIssueById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;
    const issue = await Issue.findById(id)
      .populate('reportedById', 'name email')
      .populate('assignedTo', 'name email')
      .populate('comments.userId', 'name');

    if (!issue) {
      res.status(404).json({ error: 'Issue not found' });
      return;
    }

    // Check access
    if (req.user.role === 'CITIZEN' && issue.reportedById.toString() !== req.user.userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    if (req.user.role === 'COUNCILLOR' && issue.ward !== req.user.ward) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.status(200).json({ issue });
  } catch (error) {
    console.error('Get issue error:', error);
    res.status(500).json({ error: 'Failed to fetch issue' });
  }
};

export const updateIssueStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!Object.values(IssueStatus).includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    // Councillors can only update issues in their ward
    if (req.user.role === 'COUNCILLOR') {
      const issue = await Issue.findById(id);
      if (!issue) {
        res.status(404).json({ error: 'Issue not found' });
        return;
      }

      if (issue.ward !== req.user.ward) {
        res.status(403).json({ error: 'Can only update issues in your ward' });
        return;
      }

      issue.status = status as IssueStatus;
      issue.assignedTo = req.user.userId;
      await issue.save();

      res.status(200).json({
        message: 'Issue status updated',
        issue
      });
    } else {
      res.status(403).json({ error: 'Only councillors can update issue status' });
    }
  } catch (error) {
    console.error('Update issue error:', error);
    res.status(500).json({ error: 'Failed to update issue' });
  }
};

export const addComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;
    const { text } = req.body;

    if (!text) {
      res.status(400).json({ error: 'Comment text is required' });
      return;
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const issue = await Issue.findByIdAndUpdate(
      id,
      {
        $push: {
          comments: {
            userId: req.user.userId,
            userName: user.name,
            text,
            createdAt: new Date()
          }
        }
      },
      { new: true }
    );

    if (!issue) {
      res.status(404).json({ error: 'Issue not found' });
      return;
    }

    res.status(200).json({
      message: 'Comment added',
      issue
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

export const deleteIssue = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;
    const issue = await Issue.findById(id);

    if (!issue) {
      res.status(404).json({ error: 'Issue not found' });
      return;
    }

    // Only the issue reporter can delete
    if (issue.reportedById.toString() !== req.user.userId) {
      res.status(403).json({ error: 'Can only delete your own issues' });
      return;
    }

    await Issue.findByIdAndDelete(id);

    res.status(200).json({ message: 'Issue deleted successfully' });
  } catch (error) {
    console.error('Delete issue error:', error);
    res.status(500).json({ error: 'Failed to delete issue' });
  }
};
