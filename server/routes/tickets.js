const express = require('express');
const { ensureAuthenticated, checkPermission, ensureAdmin } = require('../middleware/auth');
const {
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
  getTicketStatistics
} = require('../models/ticket');

const router = express.Router();

// Get ticket metadata (categories, priorities, statuses)
router.get('/metadata/tickets', ensureAuthenticated, (req, res) => {
  try {
    const ticketModel = require('../models/ticket');
    res.json({
      categories: ticketModel.ticketCategories(),
      priorities: ticketModel.ticketPriorities(),
      statuses: ticketModel.ticketStatuses()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all tickets with filtering
router.get('/tickets', ensureAuthenticated, (req, res) => {
  try {
    const filters = req.query;
    const tickets = getAllTickets(filters);
    
    res.json({
      tickets,
      total: tickets.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get ticket by ID
router.get('/tickets/:id', ensureAuthenticated, (req, res) => {
  try {
    const ticketId = parseInt(req.params.id);
    const ticket = getTicketById(ticketId);
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    res.json({ ticket });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get ticket by number
router.get('/tickets/number/:ticketNumber', ensureAuthenticated, (req, res) => {
  try {
    const { ticketNumber } = req.params;
    const ticket = getTicketByNumber(ticketNumber);
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    res.json({ ticket });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new ticket
router.post('/tickets', ensureAuthenticated, (req, res) => {
  try {
    const ticketData = {
      ...req.body,
      createdBy: req.user.id
    };
    
    // Validation
    if (!ticketData.title || !ticketData.description || !ticketData.categoryId) {
      return res.status(400).json({ 
        error: 'Title, description, and category are required' 
      });
    }
    
    const newTicket = createTicket(ticketData);
    
    res.status(201).json({
      message: 'Ticket created successfully',
      ticket: newTicket
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a ticket
router.put('/tickets/:id', ensureAuthenticated, (req, res) => {
  try {
    const ticketId = parseInt(req.params.id);
    const ticket = getTicketById(ticketId);
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    // Check permissions - only creator, assignee, or admin can update
    const canUpdate = 
      ticket.createdBy === req.user.id ||
      ticket.assignedTo === req.user.id ||
      req.user.role === 'admin';
    
    if (!canUpdate) {
      return res.status(403).json({ error: 'Insufficient permissions to update this ticket' });
    }
    
    const updatedTicket = updateTicket(ticketId, req.body);
    
    res.json({
      message: 'Ticket updated successfully',
      ticket: updatedTicket
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a ticket (admin only)
router.delete('/tickets/:id', ensureAuthenticated, ensureAdmin, (req, res) => {
  try {
    const ticketId = parseInt(req.params.id);
    const deleted = deleteTicket(ticketId);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a comment to a ticket
router.post('/tickets/:id/comments', ensureAuthenticated, (req, res) => {
  try {
    const ticketId = parseInt(req.params.id);
    const ticket = getTicketById(ticketId);
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    const { content, isInternal, attachments } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Comment content is required' });
    }
    
    const comment = addComment(ticketId, {
      userId: req.user.id,
      content,
      isInternal,
      attachments
    });
    
    res.status(201).json({
      message: 'Comment added successfully',
      comment
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a comment
router.put('/tickets/:id/comments/:commentId', ensureAuthenticated, (req, res) => {
  try {
    const ticketId = parseInt(req.params.id);
    const commentId = parseInt(req.params.commentId);
    const ticket = getTicketById(ticketId);
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    const comment = ticket.comments.find(c => c.id === commentId);
    
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    // Only comment author or admin can update
    if (comment.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions to update this comment' });
    }
    
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Comment content is required' });
    }
    
    const updatedComment = updateComment(ticketId, commentId, content);
    
    res.json({
      message: 'Comment updated successfully',
      comment: updatedComment
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a comment
router.delete('/tickets/:id/comments/:commentId', ensureAuthenticated, (req, res) => {
  try {
    const ticketId = parseInt(req.params.id);
    const commentId = parseInt(req.params.commentId);
    const ticket = getTicketById(ticketId);
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    const comment = ticket.comments.find(c => c.id === commentId);
    
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    // Only comment author or admin can delete
    if (comment.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions to delete this comment' });
    }
    
    const deleted = deleteComment(ticketId, commentId);
    
    if (deleted) {
      res.json({ message: 'Comment deleted successfully' });
    } else {
      res.status(500).json({ error: 'Failed to delete comment' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a watcher to a ticket
router.post('/tickets/:id/watchers', ensureAuthenticated, (req, res) => {
  try {
    const ticketId = parseInt(req.params.id);
    const { userId } = req.body;
    
    // Users can add themselves, admins can add anyone
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Can only add yourself as a watcher' });
    }
    
    const ticket = addWatcher(ticketId, userId || req.user.id);
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    res.json({
      message: 'Watcher added successfully',
      ticket
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove a watcher from a ticket
router.delete('/tickets/:id/watchers/:userId', ensureAuthenticated, (req, res) => {
  try {
    const ticketId = parseInt(req.params.id);
    const userId = parseInt(req.params.userId);
    
    // Users can remove themselves, admins can remove anyone
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Can only remove yourself as a watcher' });
    }
    
    const ticket = removeWatcher(ticketId, userId);
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    res.json({
      message: 'Watcher removed successfully',
      ticket
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get ticket statistics
router.get('/statistics/tickets', ensureAuthenticated, (req, res) => {
  try {
    const stats = getTicketStatistics();
    res.json({ statistics: stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
