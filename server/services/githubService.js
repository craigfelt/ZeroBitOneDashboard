const { Octokit } = require('@octokit/rest');
require('dotenv').config();

class GitHubService {
  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });
    
    // Store for running tasks
    this.runningTasks = new Map();
    this.taskHistory = [];
  }

  // Get repositories
  async getRepositories(org = null) {
    try {
      if (org) {
        const { data } = await this.octokit.repos.listForOrg({
          org,
          type: 'all',
          sort: 'updated',
          direction: 'desc'
        });
        return data;
      } else {
        const { data } = await this.octokit.repos.listForAuthenticatedUser({
          sort: 'updated',
          direction: 'desc'
        });
        return data;
      }
    } catch (error) {
      console.error('Error fetching repositories:', error);
      throw error;
    }
  }

  // Get workflows for a repository
  async getWorkflows(owner, repo) {
    try {
      const { data } = await this.octokit.actions.listRepoWorkflows({
        owner,
        repo
      });
      return data.workflows;
    } catch (error) {
      console.error('Error fetching workflows:', error);
      throw error;
    }
  }

  // Get workflow runs
  async getWorkflowRuns(owner, repo, workflowId = null) {
    try {
      if (workflowId) {
        const { data } = await this.octokit.actions.listWorkflowRuns({
          owner,
          repo,
          workflow_id: workflowId
        });
        return data.workflow_runs;
      } else {
        const { data } = await this.octokit.actions.listWorkflowRunsForRepo({
          owner,
          repo
        });
        return data.workflow_runs;
      }
    } catch (error) {
      console.error('Error fetching workflow runs:', error);
      throw error;
    }
  }

  // Trigger a workflow
  async triggerWorkflow(owner, repo, workflowId, ref = 'main', inputs = {}) {
    try {
      const { data } = await this.octokit.actions.createWorkflowDispatch({
        owner,
        repo,
        workflow_id: workflowId,
        ref,
        inputs
      });
      
      // Track the task
      const taskId = `${owner}/${repo}/${workflowId}/${Date.now()}`;
      this.runningTasks.set(taskId, {
        owner,
        repo,
        workflowId,
        ref,
        inputs,
        status: 'triggered',
        startTime: new Date()
      });
      
      return { taskId, ...data };
    } catch (error) {
      console.error('Error triggering workflow:', error);
      throw error;
    }
  }

  // Get issues
  async getIssues(owner, repo, state = 'open') {
    try {
      const { data } = await this.octokit.issues.listForRepo({
        owner,
        repo,
        state
      });
      return data;
    } catch (error) {
      console.error('Error fetching issues:', error);
      throw error;
    }
  }

  // Create an issue
  async createIssue(owner, repo, title, body, labels = [], assignees = []) {
    try {
      const { data } = await this.octokit.issues.create({
        owner,
        repo,
        title,
        body,
        labels,
        assignees
      });
      return data;
    } catch (error) {
      console.error('Error creating issue:', error);
      throw error;
    }
  }

  // Get pull requests
  async getPullRequests(owner, repo, state = 'open') {
    try {
      const { data } = await this.octokit.pulls.list({
        owner,
        repo,
        state
      });
      return data;
    } catch (error) {
      console.error('Error fetching pull requests:', error);
      throw error;
    }
  }

  // Get Copilot usage (if available)
  async getCopilotUsage(org) {
    try {
      // This is a placeholder - actual Copilot API may vary
      const { data } = await this.octokit.request('GET /orgs/{org}/copilot/usage', {
        org
      });
      return data;
    } catch (error) {
      console.error('Error fetching Copilot usage:', error);
      // Return empty data if not available
      return { usage: [] };
    }
  }

  // Execute a Copilot agent task (simulated)
  async executeCopilotTask(taskConfig) {
    const taskId = `copilot-${Date.now()}`;
    
    const task = {
      id: taskId,
      type: 'copilot',
      config: taskConfig,
      status: 'running',
      startTime: new Date(),
      output: [],
      errors: []
    };

    this.runningTasks.set(taskId, task);

    // Simulate async task execution
    setTimeout(() => {
      const completedTask = this.runningTasks.get(taskId);
      if (completedTask) {
        completedTask.status = 'completed';
        completedTask.endTime = new Date();
        completedTask.output.push('Task completed successfully');
        
        // Move to history
        this.taskHistory.push(completedTask);
        this.runningTasks.delete(taskId);
      }
    }, 5000);

    return taskId;
  }

  // Get task status
  getTaskStatus(taskId) {
    const runningTask = this.runningTasks.get(taskId);
    if (runningTask) {
      return runningTask;
    }
    
    const historicalTask = this.taskHistory.find(t => t.id === taskId);
    return historicalTask || null;
  }

  // Get all running tasks
  getRunningTasks() {
    return Array.from(this.runningTasks.values());
  }

  // Get task history
  getTaskHistory(limit = 50) {
    return this.taskHistory.slice(-limit);
  }

  // Get branches
  async getBranches(owner, repo) {
    try {
      const { data } = await this.octokit.repos.listBranches({
        owner,
        repo
      });
      return data;
    } catch (error) {
      console.error('Error fetching branches:', error);
      throw error;
    }
  }

  // Get commits
  async getCommits(owner, repo, sha = null, per_page = 30) {
    try {
      const params = {
        owner,
        repo,
        per_page
      };
      
      if (sha) {
        params.sha = sha;
      }
      
      const { data } = await this.octokit.repos.listCommits(params);
      return data;
    } catch (error) {
      console.error('Error fetching commits:', error);
      throw error;
    }
  }
}

module.exports = new GitHubService();
