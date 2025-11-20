const { ConfidentialClientApplication } = require('@azure/msal-node');
const { Client } = require('@microsoft/microsoft-graph-client');
require('dotenv').config();

class M365Service {
  constructor() {
    // Only initialize if credentials are provided
    if (process.env.AZURE_CLIENT_ID && process.env.AZURE_CLIENT_SECRET && process.env.AZURE_TENANT_ID) {
      this.msalConfig = {
        auth: {
          clientId: process.env.AZURE_CLIENT_ID,
          authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
          clientSecret: process.env.AZURE_CLIENT_SECRET,
        }
      };
      
      this.msalClient = new ConfidentialClientApplication(this.msalConfig);
      this.isConfigured = true;
    } else {
      this.isConfigured = false;
      console.log('M365 integration not configured - add Azure credentials to .env file to enable');
    }
    
    // Store for active sessions and data feeds
    this.activeSessions = new Map();
    this.dataFeeds = new Map();
  }

  // Check if M365 is configured
  checkConfigured() {
    if (!this.isConfigured) {
      throw new Error('M365 integration not configured. Please add AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, and AZURE_TENANT_ID to your .env file');
    }
  }

  // Get access token using client credentials
  async getAccessToken(scopes = ['https://graph.microsoft.com/.default']) {
    this.checkConfigured();
    try {
      const result = await this.msalClient.acquireTokenByClientCredential({
        scopes
      });
      return result.accessToken;
    } catch (error) {
      console.error('Error acquiring token:', error);
      throw new Error('Failed to acquire access token');
    }
  }

  // Get Graph client
  async getGraphClient() {
    this.checkConfigured();
    const accessToken = await this.getAccessToken();
    
    return Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      }
    });
  }

  // Get user data
  async getUsers(filter = null) {
    try {
      const client = await this.getGraphClient();
      let request = client.api('/users').select('id,displayName,mail,userPrincipalName');
      
      if (filter) {
        request = request.filter(filter);
      }
      
      const response = await request.get();
      return response.value;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Get groups
  async getGroups() {
    try {
      const client = await this.getGraphClient();
      const response = await client.api('/groups').get();
      return response.value;
    } catch (error) {
      console.error('Error fetching groups:', error);
      throw error;
    }
  }

  // Get mail folders
  async getMailFolders(userId) {
    try {
      const client = await this.getGraphClient();
      const response = await client.api(`/users/${userId}/mailFolders`).get();
      return response.value;
    } catch (error) {
      console.error('Error fetching mail folders:', error);
      throw error;
    }
  }

  // Get recent emails
  async getRecentEmails(userId, top = 10) {
    try {
      const client = await this.getGraphClient();
      const response = await client
        .api(`/users/${userId}/messages`)
        .top(top)
        .select('subject,from,receivedDateTime,isRead')
        .orderby('receivedDateTime DESC')
        .get();
      return response.value;
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw error;
    }
  }

  // Get OneDrive files
  async getOneDriveFiles(userId) {
    try {
      const client = await this.getGraphClient();
      const response = await client.api(`/users/${userId}/drive/root/children`).get();
      return response.value;
    } catch (error) {
      console.error('Error fetching OneDrive files:', error);
      throw error;
    }
  }

  // Get calendar events
  async getCalendarEvents(userId, startDate, endDate) {
    try {
      const client = await this.getGraphClient();
      let request = client
        .api(`/users/${userId}/calendar/events`)
        .select('subject,start,end,location,attendees');
      
      if (startDate && endDate) {
        request = request.filter(`start/dateTime ge '${startDate}' and end/dateTime le '${endDate}'`);
      }
      
      const response = await request.get();
      return response.value;
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      throw error;
    }
  }

  // Get SharePoint sites
  async getSharePointSites() {
    try {
      const client = await this.getGraphClient();
      const response = await client.api('/sites').get();
      return response.value;
    } catch (error) {
      console.error('Error fetching SharePoint sites:', error);
      throw error;
    }
  }

  // Get Teams
  async getTeams() {
    try {
      const client = await this.getGraphClient();
      const response = await client.api('/groups').filter('resourceProvisioningOptions/Any(x:x eq \'Team\')').get();
      return response.value;
    } catch (error) {
      console.error('Error fetching teams:', error);
      throw error;
    }
  }

  // Monitor data feed for a user
  async startDataFeed(userId, feedType, interval = 30000) {
    const feedId = `${userId}-${feedType}`;
    
    if (this.dataFeeds.has(feedId)) {
      return feedId; // Already monitoring
    }

    const feed = {
      userId,
      feedType,
      lastUpdate: new Date(),
      data: null,
      errors: []
    };

    // Start monitoring
    const intervalId = setInterval(async () => {
      try {
        let data;
        switch (feedType) {
          case 'emails':
            data = await this.getRecentEmails(userId);
            break;
          case 'calendar':
            data = await this.getCalendarEvents(userId);
            break;
          case 'files':
            data = await this.getOneDriveFiles(userId);
            break;
          default:
            throw new Error(`Unknown feed type: ${feedType}`);
        }
        
        feed.data = data;
        feed.lastUpdate = new Date();
        feed.status = 'active';
      } catch (error) {
        feed.errors.push({
          timestamp: new Date(),
          error: error.message
        });
        feed.status = 'error';
      }
    }, interval);

    feed.intervalId = intervalId;
    this.dataFeeds.set(feedId, feed);
    
    return feedId;
  }

  // Stop data feed
  stopDataFeed(feedId) {
    const feed = this.dataFeeds.get(feedId);
    if (feed && feed.intervalId) {
      clearInterval(feed.intervalId);
      this.dataFeeds.delete(feedId);
      return true;
    }
    return false;
  }

  // Get data feed status
  getDataFeedStatus(feedId) {
    return this.dataFeeds.get(feedId);
  }

  // Get all active feeds
  getAllDataFeeds() {
    return Array.from(this.dataFeeds.values());
  }
}

module.exports = new M365Service();
