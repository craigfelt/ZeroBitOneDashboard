const express = require('express');
const { ensureAuthenticated, checkPermission } = require('../middleware/auth');
const githubService = require('../services/githubService');

const router = express.Router();

// Get repositories
router.get('/repositories', ensureAuthenticated, checkPermission('github:read'), async (req, res) => {
  try {
    const { org } = req.query;
    const repos = await githubService.getRepositories(org);
    res.json({ repositories: repos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get workflows for a repository
router.get('/repositories/:owner/:repo/workflows', ensureAuthenticated, checkPermission('github:read'), async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const workflows = await githubService.getWorkflows(owner, repo);
    res.json({ workflows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get workflow runs
router.get('/repositories/:owner/:repo/runs', ensureAuthenticated, checkPermission('github:read'), async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { workflowId } = req.query;
    const runs = await githubService.getWorkflowRuns(owner, repo, workflowId);
    res.json({ runs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Trigger a workflow
router.post('/repositories/:owner/:repo/workflows/:workflowId/dispatch', ensureAuthenticated, checkPermission('github:execute'), async (req, res) => {
  try {
    const { owner, repo, workflowId } = req.params;
    const { ref, inputs } = req.body;
    
    const result = await githubService.triggerWorkflow(owner, repo, workflowId, ref, inputs);
    res.json({ 
      message: 'Workflow triggered successfully',
      taskId: result.taskId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get issues
router.get('/repositories/:owner/:repo/issues', ensureAuthenticated, checkPermission('github:read'), async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { state } = req.query;
    const issues = await githubService.getIssues(owner, repo, state);
    res.json({ issues });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create an issue
router.post('/repositories/:owner/:repo/issues', ensureAuthenticated, checkPermission('github:write'), async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { title, body, labels, assignees } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const issue = await githubService.createIssue(owner, repo, title, body, labels, assignees);
    res.json({ issue });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pull requests
router.get('/repositories/:owner/:repo/pulls', ensureAuthenticated, checkPermission('github:read'), async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { state } = req.query;
    const pulls = await githubService.getPullRequests(owner, repo, state);
    res.json({ pulls });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Copilot usage
router.get('/copilot/usage/:org', ensureAuthenticated, checkPermission('github:read'), async (req, res) => {
  try {
    const { org } = req.params;
    const usage = await githubService.getCopilotUsage(org);
    res.json({ usage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Execute a Copilot agent task
router.post('/copilot/tasks', ensureAuthenticated, checkPermission('github:execute'), async (req, res) => {
  try {
    const taskConfig = req.body;
    
    if (!taskConfig.action) {
      return res.status(400).json({ error: 'Task action is required' });
    }
    
    const taskId = await githubService.executeCopilotTask(taskConfig);
    res.json({ 
      message: 'Task started successfully',
      taskId 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get task status
router.get('/tasks/:taskId', ensureAuthenticated, checkPermission('github:read'), (req, res) => {
  try {
    const { taskId } = req.params;
    const task = githubService.getTaskStatus(taskId);
    
    if (task) {
      res.json({ task });
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all running tasks
router.get('/tasks', ensureAuthenticated, checkPermission('github:read'), (req, res) => {
  try {
    const tasks = githubService.getRunningTasks();
    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get task history
router.get('/tasks/history/all', ensureAuthenticated, checkPermission('github:read'), (req, res) => {
  try {
    const { limit } = req.query;
    const history = githubService.getTaskHistory(limit ? parseInt(limit) : 50);
    res.json({ history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get branches
router.get('/repositories/:owner/:repo/branches', ensureAuthenticated, checkPermission('github:read'), async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const branches = await githubService.getBranches(owner, repo);
    res.json({ branches });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get commits
router.get('/repositories/:owner/:repo/commits', ensureAuthenticated, checkPermission('github:read'), async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { sha, per_page } = req.query;
    const commits = await githubService.getCommits(owner, repo, sha, per_page ? parseInt(per_page) : 30);
    res.json({ commits });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
