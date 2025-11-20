const express = require('express');
const { ensureAuthenticated, checkPermission } = require('../middleware/auth');
const m365Service = require('../services/m365Service');

const router = express.Router();

// Get users
router.get('/users', ensureAuthenticated, checkPermission('m365:read'), async (req, res) => {
  try {
    const { filter } = req.query;
    const users = await m365Service.getUsers(filter);
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get groups
router.get('/groups', ensureAuthenticated, checkPermission('m365:read'), async (req, res) => {
  try {
    const groups = await m365Service.getGroups();
    res.json({ groups });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get mail folders for a user
router.get('/users/:userId/mail-folders', ensureAuthenticated, checkPermission('m365:read'), async (req, res) => {
  try {
    const { userId } = req.params;
    const folders = await m365Service.getMailFolders(userId);
    res.json({ folders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recent emails for a user
router.get('/users/:userId/emails', ensureAuthenticated, checkPermission('m365:read'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { top } = req.query;
    const emails = await m365Service.getRecentEmails(userId, parseInt(top) || 10);
    res.json({ emails });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get OneDrive files for a user
router.get('/users/:userId/files', ensureAuthenticated, checkPermission('m365:read'), async (req, res) => {
  try {
    const { userId } = req.params;
    const files = await m365Service.getOneDriveFiles(userId);
    res.json({ files });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get calendar events for a user
router.get('/users/:userId/calendar', ensureAuthenticated, checkPermission('m365:read'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;
    const events = await m365Service.getCalendarEvents(userId, startDate, endDate);
    res.json({ events });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get SharePoint sites
router.get('/sharepoint/sites', ensureAuthenticated, checkPermission('m365:read'), async (req, res) => {
  try {
    const sites = await m365Service.getSharePointSites();
    res.json({ sites });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Teams
router.get('/teams', ensureAuthenticated, checkPermission('m365:read'), async (req, res) => {
  try {
    const teams = await m365Service.getTeams();
    res.json({ teams });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start data feed
router.post('/feeds/start', ensureAuthenticated, checkPermission('m365:admin'), async (req, res) => {
  try {
    const { userId, feedType, interval } = req.body;
    
    if (!userId || !feedType) {
      return res.status(400).json({ error: 'userId and feedType are required' });
    }

    const feedId = await m365Service.startDataFeed(userId, feedType, interval);
    res.json({ feedId, message: 'Data feed started successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stop data feed
router.post('/feeds/stop', ensureAuthenticated, checkPermission('m365:admin'), async (req, res) => {
  try {
    const { feedId } = req.body;
    
    if (!feedId) {
      return res.status(400).json({ error: 'feedId is required' });
    }

    const stopped = m365Service.stopDataFeed(feedId);
    
    if (stopped) {
      res.json({ message: 'Data feed stopped successfully' });
    } else {
      res.status(404).json({ error: 'Feed not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get data feed status
router.get('/feeds/:feedId', ensureAuthenticated, checkPermission('m365:read'), (req, res) => {
  try {
    const { feedId } = req.params;
    const feed = m365Service.getDataFeedStatus(feedId);
    
    if (feed) {
      res.json({ feed });
    } else {
      res.status(404).json({ error: 'Feed not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all active feeds
router.get('/feeds', ensureAuthenticated, checkPermission('m365:read'), (req, res) => {
  try {
    const feeds = m365Service.getAllDataFeeds();
    res.json({ feeds });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
