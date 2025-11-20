const { useState, useEffect } = React;

const API_BASE = window.location.origin + '/api';

// API helper functions
const api = {
  async call(endpoint, options = {}) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'An error occurred');
    }
    
    return data;
  },
  
  // Auth
  login: (credentials) => api.call('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  
  logout: () => api.call('/auth/logout', { method: 'POST' }),
  
  getCurrentUser: () => api.call('/auth/me'),
  
  register: (userData) => api.call('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  
  // Tickets
  getTickets: (filters) => {
    const params = new URLSearchParams(filters);
    return api.call(`/tickets?${params}`);
  },
  
  getTicket: (id) => api.call(`/tickets/${id}`),
  
  createTicket: (ticketData) => api.call('/tickets', {
    method: 'POST',
    body: JSON.stringify(ticketData),
  }),
  
  updateTicket: (id, updates) => api.call(`/tickets/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  }),
  
  addComment: (ticketId, comment) => api.call(`/tickets/${ticketId}/comments`, {
    method: 'POST',
    body: JSON.stringify(comment),
  }),
  
  getTicketMetadata: () => api.call('/metadata/tickets'),
  
  getTicketStatistics: () => api.call('/statistics/tickets'),
  
  // M365
  getM365Users: () => api.call('/m365/users'),
  getM365Feeds: () => api.call('/m365/feeds'),
  startM365Feed: (feedData) => api.call('/m365/feeds/start', {
    method: 'POST',
    body: JSON.stringify(feedData),
  }),
  
  // GitHub
  getGitHubRepos: (org) => {
    const params = org ? `?org=${org}` : '';
    return api.call(`/github/repositories${params}`);
  },
  
  getWorkflows: (owner, repo) => api.call(`/github/repositories/${owner}/${repo}/workflows`),
  
  triggerWorkflow: (owner, repo, workflowId, data) => 
    api.call(`/github/repositories/${owner}/${repo}/workflows/${workflowId}/dispatch`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  getGitHubTasks: () => api.call('/github/tasks'),
  
  executeCopilotTask: (taskConfig) => api.call('/github/copilot/tasks', {
    method: 'POST',
    body: JSON.stringify(taskConfig),
  }),
};

// Login Component
function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.login({ username, password });
      onLogin(response.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>ZeroBitOne Dashboard</h1>
          <p>Sign in to your account</p>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#6B7280' }}>
          Default credentials: admin / admin123
        </div>
      </div>
    </div>
  );
}

// Dashboard Component
function Dashboard({ user }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const ticketStats = await api.getTicketStatistics();
      setStats(ticketStats.statistics);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  if (!stats) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <h2 style={{ marginBottom: '30px' }}>Welcome back, {user.username}!</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#DBEAFE', color: '#3B82F6' }}>
            <i className="fas fa-ticket-alt"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>Total Tickets</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#FEF3C7', color: '#F59E0B' }}>
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.open}</h3>
            <p>Open Tickets</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#D1FAE5', color: '#10B981' }}>
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.resolved}</h3>
            <p>Resolved Tickets</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#FEE2E2', color: '#EF4444' }}>
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.slaBreach}</h3>
            <p>SLA Breaches</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Ticket Statistics</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <h4 style={{ marginBottom: '10px' }}>By Status</h4>
            {Object.entries(stats.byStatus).map(([status, count]) => (
              <div key={status} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                <span>{status}</span>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
          <div>
            <h4 style={{ marginBottom: '10px' }}>By Priority</h4>
            {Object.entries(stats.byPriority).map(([priority, count]) => (
              <div key={priority} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                <span>{priority}</span>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Tickets Component
function Tickets({ user }) {
  const [tickets, setTickets] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [filters, setFilters] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTickets();
    loadMetadata();
  }, [filters]);

  const loadTickets = async () => {
    try {
      const response = await api.getTickets(filters);
      setTickets(response.tickets);
    } catch (err) {
      console.error('Error loading tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMetadata = async () => {
    try {
      const response = await api.getTicketMetadata();
      setMetadata(response);
    } catch (err) {
      console.error('Error loading metadata:', err);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (!metadata) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Support Tickets</h2>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <i className="fas fa-plus"></i> Create Ticket
        </button>
      </div>

      <div className="ticket-filters">
        <select 
          className="form-select" 
          value={filters.statusId || ''}
          onChange={(e) => handleFilterChange('statusId', e.target.value)}
          style={{ width: 'auto' }}
        >
          <option value="">All Statuses</option>
          {metadata.statuses.map(status => (
            <option key={status.id} value={status.id}>{status.name}</option>
          ))}
        </select>

        <select 
          className="form-select" 
          value={filters.priorityId || ''}
          onChange={(e) => handleFilterChange('priorityId', e.target.value)}
          style={{ width: 'auto' }}
        >
          <option value="">All Priorities</option>
          {metadata.priorities.map(priority => (
            <option key={priority.id} value={priority.id}>{priority.name}</option>
          ))}
        </select>

        <select 
          className="form-select" 
          value={filters.categoryId || ''}
          onChange={(e) => handleFilterChange('categoryId', e.target.value)}
          style={{ width: 'auto' }}
        >
          <option value="">All Categories</option>
          {metadata.categories.map(category => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : (
        <div className="ticket-list">
          {tickets.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: '#6B7280' }}>No tickets found</p>
            </div>
          ) : (
            tickets.map(ticket => {
              const status = metadata.statuses.find(s => s.id === ticket.statusId);
              const priority = metadata.priorities.find(p => p.id === ticket.priorityId);
              const category = metadata.categories.find(c => c.id === ticket.categoryId);
              
              return (
                <div key={ticket.id} className="ticket-item" onClick={() => setSelectedTicket(ticket)}>
                  <div className="ticket-header">
                    <span className="ticket-number">{ticket.ticketNumber}</span>
                    <div className="ticket-meta">
                      <span className="badge badge-primary">{status?.name}</span>
                      <span className="badge badge-warning">{priority?.name}</span>
                    </div>
                  </div>
                  <h3 className="ticket-title">{ticket.title}</h3>
                  <div className="ticket-meta">
                    <span style={{ fontSize: '14px', color: '#6B7280' }}>
                      <i className="fas fa-folder"></i> {category?.name}
                    </span>
                    <span style={{ fontSize: '14px', color: '#6B7280' }}>
                      <i className="fas fa-clock"></i> {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                    <span style={{ fontSize: '14px', color: '#6B7280' }}>
                      <i className="fas fa-comment"></i> {ticket.comments.length} comments
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {showCreateModal && (
        <CreateTicketModal 
          metadata={metadata}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadTickets();
          }}
        />
      )}

      {selectedTicket && (
        <TicketDetailModal 
          ticket={selectedTicket}
          metadata={metadata}
          onClose={() => setSelectedTicket(null)}
          onUpdate={() => {
            loadTickets();
            setSelectedTicket(null);
          }}
        />
      )}
    </div>
  );
}

// Create Ticket Modal
function CreateTicketModal({ metadata, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    priorityId: 2,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.createTicket({
        ...formData,
        categoryId: parseInt(formData.categoryId),
        priorityId: parseInt(formData.priorityId),
      });
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Ticket</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        {error && <div className="alert alert-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              type="text"
              className="form-input"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category *</label>
            <select
              className="form-select"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              required
            >
              <option value="">Select a category</option>
              {metadata.categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Priority</label>
            <select
              className="form-select"
              value={formData.priorityId}
              onChange={(e) => setFormData({ ...formData, priorityId: e.target.value })}
            >
              {metadata.priorities.map(priority => (
                <option key={priority.id} value={priority.id}>{priority.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              className="form-textarea"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Ticket Detail Modal
function TicketDetailModal({ ticket, metadata, onClose, onUpdate }) {
  const [comments, setComments] = useState(ticket.comments || []);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  const status = metadata.statuses.find(s => s.id === ticket.statusId);
  const priority = metadata.priorities.find(p => p.id === ticket.priorityId);
  const category = metadata.categories.find(c => c.id === ticket.categoryId);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const response = await api.addComment(ticket.id, { content: newComment });
      setComments([...comments, response.comment]);
      setNewComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatusId) => {
    try {
      await api.updateTicket(ticket.id, { statusId: parseInt(newStatusId) });
      onUpdate();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>{ticket.title}</h2>
            <div style={{ fontSize: '14px', color: '#6B7280', marginTop: '5px' }}>
              {ticket.ticketNumber}
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <span className="badge badge-primary">{category?.name}</span>
          <span className="badge badge-warning">{priority?.name}</span>
          <select
            className="form-select"
            value={ticket.statusId}
            onChange={(e) => handleStatusChange(e.target.value)}
            style={{ width: 'auto', padding: '4px 8px', fontSize: '12px' }}
          >
            {metadata.statuses.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="card" style={{ marginBottom: '20px' }}>
          <p style={{ whiteSpace: 'pre-wrap' }}>{ticket.description}</p>
          <div style={{ marginTop: '15px', fontSize: '14px', color: '#6B7280' }}>
            Created: {new Date(ticket.createdAt).toLocaleString()}
          </div>
        </div>

        <h3 style={{ marginBottom: '15px' }}>Comments ({comments.length})</h3>
        
        <div className="comment-list">
          {comments.map(comment => (
            <div key={comment.id} className="comment-item">
              <div className="comment-header">
                <span>User {comment.userId}</span>
                <span>{new Date(comment.createdAt).toLocaleString()}</span>
              </div>
              <p>{comment.content}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddComment} style={{ marginTop: '20px' }}>
          <div className="form-group">
            <label className="form-label">Add Comment</label>
            <textarea
              className="form-textarea"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Enter your comment..."
              rows="3"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Adding...' : 'Add Comment'}
          </button>
        </form>
      </div>
    </div>
  );
}

// M365 Integration Component
function M365Integration() {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeeds();
  }, []);

  const loadFeeds = async () => {
    try {
      const response = await api.getM365Feeds();
      setFeeds(response.feeds);
    } catch (err) {
      console.error('Error loading feeds:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Microsoft 365 Integration</h2>
      
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Active Data Feeds</h3>
          <button className="btn btn-primary btn-sm">
            <i className="fas fa-plus"></i> Start Feed
          </button>
        </div>
        
        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : feeds.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
            <i className="fas fa-inbox" style={{ fontSize: '48px', marginBottom: '15px' }}></i>
            <p>No active data feeds</p>
            <p style={{ fontSize: '14px' }}>Configure your Microsoft 365 credentials in the .env file to enable integration</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Feed Type</th>
                <th>Status</th>
                <th>Last Update</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {feeds.map((feed, idx) => (
                <tr key={idx}>
                  <td>{feed.userId}</td>
                  <td>{feed.feedType}</td>
                  <td>
                    <span className={`badge ${feed.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                      {feed.status}
                    </span>
                  </td>
                  <td>{new Date(feed.lastUpdate).toLocaleString()}</td>
                  <td>
                    <button className="btn btn-danger btn-sm">Stop</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <h3 className="card-title">Configuration Guide</h3>
        <ol style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
          <li>Register an application in Azure Active Directory</li>
          <li>Configure the required API permissions for Microsoft Graph</li>
          <li>Add your Azure credentials to the .env file:
            <ul style={{ marginTop: '10px', listStyle: 'disc', paddingLeft: '20px' }}>
              <li>AZURE_CLIENT_ID</li>
              <li>AZURE_CLIENT_SECRET</li>
              <li>AZURE_TENANT_ID</li>
            </ul>
          </li>
          <li>Restart the server to apply changes</li>
        </ol>
      </div>
    </div>
  );
}

// GitHub Integration Component
function GitHubIntegration() {
  const [repos, setRepos] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [reposResponse, tasksResponse] = await Promise.all([
        api.getGitHubRepos().catch(() => ({ repositories: [] })),
        api.getGitHubTasks().catch(() => ({ tasks: [] }))
      ]);
      setRepos(reposResponse.repositories);
      setTasks(tasksResponse.tasks);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>GitHub & Copilot Agent Integration</h2>
      
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Execute Agent Tasks</h3>
          <button className="btn btn-primary" onClick={() => setShowTaskModal(true)}>
            <i className="fas fa-play"></i> Run Task
          </button>
        </div>
        
        <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
          <i className="fas fa-robot" style={{ fontSize: '48px', marginBottom: '15px', color: '#3B82F6' }}></i>
          <p>Execute GitHub workflows and Copilot agent tasks from this dashboard</p>
          <p style={{ fontSize: '14px', marginTop: '10px' }}>Configure your GITHUB_TOKEN in the .env file to enable integration</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Running Tasks ({tasks.length})</h3>
        </div>
        {tasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#6B7280' }}>
            No running tasks
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Task ID</th>
                <th>Type</th>
                <th>Status</th>
                <th>Started</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task.id}>
                  <td>{task.id}</td>
                  <td>{task.type}</td>
                  <td><span className="badge badge-warning">{task.status}</span></td>
                  <td>{new Date(task.startTime).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showTaskModal && (
        <CopilotTaskModal 
          onClose={() => setShowTaskModal(false)}
          onSuccess={() => {
            setShowTaskModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}

// Copilot Task Modal
function CopilotTaskModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    action: '',
    repository: '',
    parameters: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const taskConfig = {
        action: formData.action,
        repository: formData.repository,
        parameters: formData.parameters ? JSON.parse(formData.parameters) : {}
      };
      await api.executeCopilotTask(taskConfig);
      onSuccess();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Execute Copilot Agent Task</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Action *</label>
            <input
              type="text"
              className="form-input"
              value={formData.action}
              onChange={(e) => setFormData({ ...formData, action: e.target.value })}
              placeholder="e.g., analyze-code, run-tests, deploy"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Repository</label>
            <input
              type="text"
              className="form-input"
              value={formData.repository}
              onChange={(e) => setFormData({ ...formData, repository: e.target.value })}
              placeholder="owner/repo"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Parameters (JSON)</label>
            <textarea
              className="form-textarea"
              value={formData.parameters}
              onChange={(e) => setFormData({ ...formData, parameters: e.target.value })}
              placeholder='{"key": "value"}'
              rows="4"
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Executing...' : 'Execute Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Main App Component
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await api.getCurrentUser();
      setUser(response.user);
    } catch (err) {
      console.log('Not authenticated');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      setUser(null);
      setCurrentPage('dashboard');
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const navItems = [
    { id: 'dashboard', icon: 'fa-th-large', label: 'Dashboard' },
    { id: 'tickets', icon: 'fa-ticket-alt', label: 'Tickets' },
    { id: 'm365', icon: 'fa-cloud', label: 'Microsoft 365' },
    { id: 'github', icon: 'fa-github', label: 'GitHub / Copilot' },
  ];

  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-header">
          <h1>ZeroBitOne</h1>
        </div>
        <div className="sidebar-nav">
          {navItems.map(item => (
            <div
              key={item.id}
              className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => setCurrentPage(item.id)}
            >
              <i className={`fas ${item.icon}`}></i>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '14px' }}>{user.username}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>{user.role}</div>
            </div>
          </div>
          <button className="btn btn-outline" style={{ width: '100%', color: 'white', borderColor: 'rgba(255, 255, 255, 0.2)' }} onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </div>
      
      <div className="main-content">
        <div className="top-bar">
          <div className="page-title">
            {navItems.find(item => item.id === currentPage)?.label}
          </div>
        </div>
        
        <div className="content-area">
          {currentPage === 'dashboard' && <Dashboard user={user} />}
          {currentPage === 'tickets' && <Tickets user={user} />}
          {currentPage === 'm365' && <M365Integration />}
          {currentPage === 'github' && <GitHubIntegration />}
        </div>
      </div>
    </div>
  );
}

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
