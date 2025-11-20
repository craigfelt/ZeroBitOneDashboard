const db = require('../config/database');

function generateTicketNumber() {
  const date = new Date();
  const year = date.getFullYear();
  
  // Get the highest ticket number for this year
  const stmt = db.prepare(`
    SELECT ticket_number FROM tickets 
    WHERE ticket_number LIKE ? 
    ORDER BY id DESC LIMIT 1
  `);
  const lastTicket = stmt.get(`TKT-${year}-%`);
  
  let counter = 1;
  if (lastTicket) {
    const parts = lastTicket.ticket_number.split('-');
    counter = parseInt(parts[2]) + 1;
  }
  
  const number = String(counter).padStart(6, '0');
  return `TKT-${year}-${number}`;
}

function calculateSLADeadline(type, priorityId) {
  const now = new Date();
  
  // SLA times in hours
  const slaMatrix = {
    response: { 1: 24, 2: 8, 3: 4, 4: 1 },
    resolution: { 1: 120, 2: 48, 3: 24, 4: 8 }
  };
  
  const hoursToAdd = slaMatrix[type][priorityId];
  return new Date(now.getTime() + (hoursToAdd * 60 * 60 * 1000));
}

function createTicket(ticketData) {
  const ticketNumber = generateTicketNumber();
  const slaResponse = calculateSLADeadline('response', ticketData.priorityId || 2);
  const slaResolution = calculateSLADeadline('resolution', ticketData.priorityId || 2);
  
  const stmt = db.prepare(`
    INSERT INTO tickets (
      ticket_number, title, description, category_id, priority_id, status_id,
      created_by, assigned_to, estimated_hours, actual_hours,
      sla_response_deadline, sla_resolution_deadline, custom_fields
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    ticketNumber,
    ticketData.title,
    ticketData.description,
    ticketData.categoryId,
    ticketData.priorityId || 2,
    1, // Default to Open
    ticketData.createdBy,
    ticketData.assignedTo || null,
    ticketData.estimatedHours || null,
    ticketData.actualHours || null,
    slaResponse.toISOString(),
    slaResolution.toISOString(),
    ticketData.customFields ? JSON.stringify(ticketData.customFields) : null
  );
  
  const newTicket = getTicketById(result.lastInsertRowid);
  
  // Add watchers if specified
  if (ticketData.watchers && ticketData.watchers.length > 0) {
    const watcherStmt = db.prepare('INSERT INTO ticket_watchers (ticket_id, user_id) VALUES (?, ?)');
    ticketData.watchers.forEach(userId => {
      watcherStmt.run(newTicket.id, userId);
    });
  }
  
  // Add creator as watcher by default
  const watcherStmt = db.prepare('INSERT OR IGNORE INTO ticket_watchers (ticket_id, user_id) VALUES (?, ?)');
  watcherStmt.run(newTicket.id, ticketData.createdBy);
  
  return getTicketById(newTicket.id);
}

function updateTicket(ticketId, updates) {
  const fields = [];
  const values = [];
  
  if (updates.title !== undefined) {
    fields.push('title = ?');
    values.push(updates.title);
  }
  if (updates.description !== undefined) {
    fields.push('description = ?');
    values.push(updates.description);
  }
  if (updates.categoryId !== undefined) {
    fields.push('category_id = ?');
    values.push(updates.categoryId);
  }
  if (updates.priorityId !== undefined) {
    fields.push('priority_id = ?');
    values.push(updates.priorityId);
  }
  if (updates.statusId !== undefined) {
    fields.push('status_id = ?');
    values.push(updates.statusId);
    
    // Track status changes
    if (updates.statusId === 4) { // Resolved
      fields.push('resolved_at = CURRENT_TIMESTAMP');
    } else if (updates.statusId === 5) { // Closed
      fields.push('closed_at = CURRENT_TIMESTAMP');
    }
  }
  if (updates.assignedTo !== undefined) {
    fields.push('assigned_to = ?');
    values.push(updates.assignedTo);
  }
  if (updates.estimatedHours !== undefined) {
    fields.push('estimated_hours = ?');
    values.push(updates.estimatedHours);
  }
  if (updates.actualHours !== undefined) {
    fields.push('actual_hours = ?');
    values.push(updates.actualHours);
  }
  if (updates.customFields !== undefined) {
    fields.push('custom_fields = ?');
    values.push(JSON.stringify(updates.customFields));
  }
  
  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(ticketId);
  
  if (fields.length === 1) return getTicketById(ticketId); // Only updated_at, no real changes
  
  const stmt = db.prepare(`UPDATE tickets SET ${fields.join(', ')} WHERE id = ?`);
  stmt.run(...values);
  
  return getTicketById(ticketId);
}

function deleteTicket(ticketId) {
  const stmt = db.prepare('DELETE FROM tickets WHERE id = ?');
  const result = stmt.run(ticketId);
  return result.changes > 0;
}

function getTicketById(ticketId) {
  const stmt = db.prepare('SELECT * FROM tickets WHERE id = ?');
  const ticket = stmt.get(ticketId);
  
  if (!ticket) return null;
  
  // Get comments
  ticket.comments = getTicketComments(ticketId);
  
  // Get watchers
  const watcherStmt = db.prepare('SELECT user_id FROM ticket_watchers WHERE ticket_id = ?');
  ticket.watchers = watcherStmt.all(ticketId).map(w => w.user_id);
  
  // Parse custom fields if present
  if (ticket.custom_fields) {
    ticket.customFields = JSON.parse(ticket.custom_fields);
  }
  
  // Convert snake_case to camelCase for consistency
  return convertTicketKeys(ticket);
}

function getTicketByNumber(ticketNumber) {
  const stmt = db.prepare('SELECT * FROM tickets WHERE ticket_number = ?');
  const ticket = stmt.get(ticketNumber);
  
  if (!ticket) return null;
  
  ticket.comments = getTicketComments(ticket.id);
  const watcherStmt = db.prepare('SELECT user_id FROM ticket_watchers WHERE ticket_id = ?');
  ticket.watchers = watcherStmt.all(ticket.id).map(w => w.user_id);
  
  if (ticket.custom_fields) {
    ticket.customFields = JSON.parse(ticket.custom_fields);
  }
  
  return convertTicketKeys(ticket);
}

function getAllTickets(filters = {}) {
  let query = 'SELECT * FROM tickets WHERE 1=1';
  const params = [];
  
  if (filters.statusId) {
    query += ' AND status_id = ?';
    params.push(parseInt(filters.statusId));
  }
  
  if (filters.priorityId) {
    query += ' AND priority_id = ?';
    params.push(parseInt(filters.priorityId));
  }
  
  if (filters.categoryId) {
    query += ' AND category_id = ?';
    params.push(parseInt(filters.categoryId));
  }
  
  if (filters.assignedTo) {
    query += ' AND assigned_to = ?';
    params.push(parseInt(filters.assignedTo));
  }
  
  if (filters.createdBy) {
    query += ' AND created_by = ?';
    params.push(parseInt(filters.createdBy));
  }
  
  if (filters.search) {
    query += ' AND (title LIKE ? OR description LIKE ? OR ticket_number LIKE ?)';
    const searchTerm = `%${filters.search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }
  
  // Sort
  const sortBy = filters.sortBy || 'created_at';
  const sortOrder = filters.sortOrder || 'desc';
  query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
  
  const stmt = db.prepare(query);
  const tickets = stmt.all(...params);
  
  // Add comments and watchers for each ticket
  return tickets.map(ticket => {
    ticket.comments = getTicketComments(ticket.id);
    const watcherStmt = db.prepare('SELECT user_id FROM ticket_watchers WHERE ticket_id = ?');
    ticket.watchers = watcherStmt.all(ticket.id).map(w => w.user_id);
    
    if (ticket.custom_fields) {
      ticket.customFields = JSON.parse(ticket.custom_fields);
    }
    
    return convertTicketKeys(ticket);
  });
}

function getTicketComments(ticketId) {
  const stmt = db.prepare('SELECT * FROM ticket_comments WHERE ticket_id = ? ORDER BY created_at ASC');
  const comments = stmt.all(ticketId);
  return comments.map(c => convertCommentKeys(c));
}

function addComment(ticketId, commentData) {
  const stmt = db.prepare(`
    INSERT INTO ticket_comments (ticket_id, user_id, content, is_internal) 
    VALUES (?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    ticketId,
    commentData.userId,
    commentData.content,
    commentData.isInternal ? 1 : 0
  );
  
  // Update ticket's updated_at timestamp
  db.prepare('UPDATE tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(ticketId);
  
  const commentStmt = db.prepare('SELECT * FROM ticket_comments WHERE id = ?');
  const comment = commentStmt.get(result.lastInsertRowid);
  
  return convertCommentKeys(comment);
}

function updateComment(ticketId, commentId, content) {
  const stmt = db.prepare(`
    UPDATE ticket_comments 
    SET content = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ? AND ticket_id = ?
  `);
  
  stmt.run(content, commentId, ticketId);
  
  // Update ticket's updated_at timestamp
  db.prepare('UPDATE tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(ticketId);
  
  const commentStmt = db.prepare('SELECT * FROM ticket_comments WHERE id = ?');
  const comment = commentStmt.get(commentId);
  
  return comment ? convertCommentKeys(comment) : null;
}

function deleteComment(ticketId, commentId) {
  const stmt = db.prepare('DELETE FROM ticket_comments WHERE id = ? AND ticket_id = ?');
  const result = stmt.run(commentId, ticketId);
  
  if (result.changes > 0) {
    // Update ticket's updated_at timestamp
    db.prepare('UPDATE tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(ticketId);
    return true;
  }
  
  return false;
}

function addWatcher(ticketId, userId) {
  const stmt = db.prepare('INSERT OR IGNORE INTO ticket_watchers (ticket_id, user_id) VALUES (?, ?)');
  stmt.run(ticketId, userId);
  
  // Update ticket's updated_at timestamp
  db.prepare('UPDATE tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(ticketId);
  
  return getTicketById(ticketId);
}

function removeWatcher(ticketId, userId) {
  const stmt = db.prepare('DELETE FROM ticket_watchers WHERE ticket_id = ? AND user_id = ?');
  stmt.run(ticketId, userId);
  
  // Update ticket's updated_at timestamp
  db.prepare('UPDATE tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(ticketId);
  
  return getTicketById(ticketId);
}

function getTicketStatistics() {
  const totalStmt = db.prepare('SELECT COUNT(*) as count FROM tickets');
  const total = totalStmt.get().count;
  
  const openStmt = db.prepare('SELECT COUNT(*) as count FROM tickets WHERE status_id IN (1, 2, 3, 6)');
  const open = openStmt.get().count;
  
  const resolvedStmt = db.prepare('SELECT COUNT(*) as count FROM tickets WHERE status_id = 4');
  const resolved = resolvedStmt.get().count;
  
  const closedStmt = db.prepare('SELECT COUNT(*) as count FROM tickets WHERE status_id = 5');
  const closed = closedStmt.get().count;
  
  const slaBreachStmt = db.prepare('SELECT COUNT(*) as count FROM tickets WHERE sla_breached = 1');
  const slaBreach = slaBreachStmt.get().count;
  
  // Tickets created today
  const todayStmt = db.prepare(`
    SELECT COUNT(*) as count FROM tickets 
    WHERE DATE(created_at) = DATE('now')
  `);
  const ticketsCreatedToday = todayStmt.get().count;
  
  // By status
  const byStatusStmt = db.prepare(`
    SELECT ts.name, COUNT(*) as count
    FROM tickets t
    JOIN ticket_statuses ts ON t.status_id = ts.id
    GROUP BY ts.name
  `);
  const byStatusRows = byStatusStmt.all();
  const byStatus = {};
  byStatusRows.forEach(row => {
    byStatus[row.name] = row.count;
  });
  
  // By priority
  const byPriorityStmt = db.prepare(`
    SELECT tp.name, COUNT(*) as count
    FROM tickets t
    JOIN ticket_priorities tp ON t.priority_id = tp.id
    GROUP BY tp.name
  `);
  const byPriorityRows = byPriorityStmt.all();
  const byPriority = {};
  byPriorityRows.forEach(row => {
    byPriority[row.name] = row.count;
  });
  
  // By category
  const byCategoryStmt = db.prepare(`
    SELECT tc.name, COUNT(*) as count
    FROM tickets t
    JOIN ticket_categories tc ON t.category_id = tc.id
    GROUP BY tc.name
  `);
  const byCategoryRows = byCategoryStmt.all();
  const byCategory = {};
  byCategoryRows.forEach(row => {
    byCategory[row.name] = row.count;
  });
  
  // Average resolution time
  const avgResolutionStmt = db.prepare(`
    SELECT AVG(
      (JULIANDAY(resolved_at) - JULIANDAY(created_at)) * 24
    ) as avg_hours
    FROM tickets
    WHERE resolved_at IS NOT NULL
  `);
  const avgResolution = avgResolutionStmt.get();
  const averageResolutionTime = avgResolution.avg_hours ? Math.round(avgResolution.avg_hours) : 0;
  
  return {
    total,
    open,
    resolved,
    closed,
    slaBreach,
    ticketsCreatedToday,
    byStatus,
    byPriority,
    byCategory,
    averageResolutionTime
  };
}

function getTicketCategories() {
  const stmt = db.prepare('SELECT * FROM ticket_categories ORDER BY name');
  return stmt.all();
}

function getTicketPriorities() {
  const stmt = db.prepare('SELECT * FROM ticket_priorities ORDER BY level');
  return stmt.all();
}

function getTicketStatuses() {
  const stmt = db.prepare('SELECT * FROM ticket_statuses ORDER BY id');
  return stmt.all();
}

function checkSLABreaches() {
  const stmt = db.prepare(`
    UPDATE tickets 
    SET sla_breached = 1 
    WHERE status_id NOT IN (4, 5) 
    AND DATETIME(sla_resolution_deadline) < DATETIME('now')
  `);
  
  stmt.run();
}

// Convert database snake_case to JavaScript camelCase
function convertTicketKeys(ticket) {
  return {
    id: ticket.id,
    ticketNumber: ticket.ticket_number,
    title: ticket.title,
    description: ticket.description,
    categoryId: ticket.category_id,
    priorityId: ticket.priority_id,
    statusId: ticket.status_id,
    createdBy: ticket.created_by,
    assignedTo: ticket.assigned_to,
    createdAt: ticket.created_at,
    updatedAt: ticket.updated_at,
    resolvedAt: ticket.resolved_at,
    closedAt: ticket.closed_at,
    estimatedHours: ticket.estimated_hours,
    actualHours: ticket.actual_hours,
    sla: {
      responseDeadline: ticket.sla_response_deadline,
      resolutionDeadline: ticket.sla_resolution_deadline,
      breached: ticket.sla_breached === 1
    },
    customFields: ticket.customFields || {},
    comments: ticket.comments || [],
    watchers: ticket.watchers || []
  };
}

function convertCommentKeys(comment) {
  return {
    id: comment.id,
    userId: comment.user_id,
    content: comment.content,
    isInternal: comment.is_internal === 1,
    createdAt: comment.created_at,
    updatedAt: comment.updated_at
  };
}

// Run SLA check every hour
setInterval(checkSLABreaches, 60 * 60 * 1000);

module.exports = {
  createTicket,
  updateTicket,
  deleteTicket,
  getTicketById,
  getTicketByNumber,
  getAllTickets,
  addComment,
  updateComment,
  deleteComment,
  addWatcher,
  removeWatcher,
  getTicketStatistics,
  ticketCategories: getTicketCategories,
  ticketPriorities: getTicketPriorities,
  ticketStatuses: getTicketStatuses
};
