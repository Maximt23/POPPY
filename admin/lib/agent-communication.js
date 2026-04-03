/**
 * POPPY Agent Communication Hub
 * 
 * Message bus system allowing agents to communicate with each other.
 * Agents can post messages, subscribe to channels, and collaborate.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import EventEmitter from 'events';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const POPPY_DIR = path.join(os.homedir(), '.poppy');
const COMMUNICATION_DIR = path.join(POPPY_DIR, 'communication');
const MESSAGES_FILE = path.join(COMMUNICATION_DIR, 'messages.json');
const CHANNELS_DIR = path.join(COMMUNICATION_DIR, 'channels');

/**
 * Message Types
 */
export const MessageTypes = {
  TASK: 'task',           // Agent assigns task to another
  QUESTION: 'question',   // Agent asks for help/info
  ANSWER: 'answer',       // Response to question
  UPDATE: 'update',       // Status/progress update
  ALERT: 'alert',         // Important notification
  HANDOFF: 'handoff',     // Transferring work to another agent
  REVIEW: 'review',       // Requesting code review
  DECISION: 'decision'    // Seeking decision/approval
};

/**
 * Communication Priority
 */
export const Priority = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent'
};

/**
 * Agent Communication Hub
 */
export class AgentCommunicationHub extends EventEmitter {
  constructor() {
    super();
    this.ensureDirectories();
    this.messageQueue = [];
    this.subscriptions = new Map();
  }

  async ensureDirectories() {
    await fs.mkdir(COMMUNICATION_DIR, { recursive: true });
    await fs.mkdir(CHANNELS_DIR, { recursive: true });
  }

  /**
   * Post a message to the hub
   */
  async postMessage(message) {
    const msg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: message.type || MessageTypes.UPDATE,
      priority: message.priority || Priority.NORMAL,
      from: message.from,        // Sending agent ID
      to: message.to || 'broadcast', // Target agent ID or 'broadcast'
      channel: message.channel || 'general', // Channel name
      subject: message.subject || '',
      content: message.content,
      context: message.context || {}, // Additional context (file refs, etc)
      timestamp: new Date().toISOString(),
      read: false,
      replies: []
    };

    // Save to messages file
    await this.appendMessage(msg);
    
    // Emit event for real-time listeners
    this.emit('message', msg);
    this.emit(`channel:${msg.channel}`, msg);
    
    if (msg.to !== 'broadcast') {
      this.emit(`agent:${msg.to}`, msg);
    }

    return msg;
  }

  /**
   * Agent asks another agent for help
   */
  async ask(fromAgent, toAgent, question, context = {}) {
    return this.postMessage({
      type: MessageTypes.QUESTION,
      from: fromAgent,
      to: toAgent,
      subject: `Question from ${fromAgent}`,
      content: question,
      context,
      priority: Priority.NORMAL
    });
  }

  /**
   * Agent assigns task to another agent
   */
  async assignTask(fromAgent, toAgent, task, details, priority = Priority.NORMAL) {
    return this.postMessage({
      type: MessageTypes.TASK,
      from: fromAgent,
      to: toAgent,
      subject: `Task: ${task}`,
      content: details,
      priority,
      context: { task }
    });
  }

  /**
   * Agent hands off work to another agent
   */
  async handoff(fromAgent, toAgent, workSummary, nextSteps) {
    return this.postMessage({
      type: MessageTypes.HANDOFF,
      from: fromAgent,
      to: toAgent,
      subject: `Handoff from ${fromAgent}`,
      content: workSummary,
      context: { nextSteps },
      priority: Priority.HIGH
    });
  }

  /**
   * Agent requests code review
   */
  async requestReview(fromAgent, reviewers, filePath, description) {
    const promises = reviewers.map(reviewer => 
      this.postMessage({
        type: MessageTypes.REVIEW,
        from: fromAgent,
        to: reviewer,
        subject: `Review Request: ${path.basename(filePath)}`,
        content: description,
        context: { filePath },
        priority: Priority.NORMAL
      })
    );
    
    return Promise.all(promises);
  }

  /**
   * Reply to a message
   */
  async reply(originalMessageId, fromAgent, content, context = {}) {
    const reply = {
      id: `reply-${Date.now()}`,
      type: MessageTypes.ANSWER,
      from: fromAgent,
      to: 'original-sender', // Will be resolved
      content,
      context,
      timestamp: new Date().toISOString()
    };

    // Get original message and add reply
    const messages = await this.getMessages();
    const original = messages.find(m => m.id === originalMessageId);
    
    if (original) {
      original.replies = original.replies || [];
      original.replies.push(reply);
      await this.saveMessages(messages);
      
      // Notify
      this.emit('reply', { original, reply });
    }

    return reply;
  }

  /**
   * Get messages for an agent
   */
  async getMessagesForAgent(agentId, options = {}) {
    const messages = await this.getMessages();
    
    let filtered = messages.filter(m => 
      m.to === agentId || 
      m.to === 'broadcast' || 
      m.from === agentId
    );
    
    if (options.unreadOnly) {
      filtered = filtered.filter(m => !m.read);
    }
    
    if (options.type) {
      filtered = filtered.filter(m => m.type === options.type);
    }
    
    if (options.since) {
      filtered = filtered.filter(m => new Date(m.timestamp) > options.since);
    }
    
    return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  /**
   * Get messages for a channel
   */
  async getChannelMessages(channel, limit = 50) {
    const messages = await this.getMessages();
    return messages
      .filter(m => m.channel === channel)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId) {
    const messages = await this.getMessages();
    const message = messages.find(m => m.id === messageId);
    if (message) {
      message.read = true;
      await this.saveMessages(messages);
    }
  }

  /**
   * Get conversation thread
   */
  async getThread(messageId) {
    const messages = await this.getMessages();
    const root = messages.find(m => m.id === messageId);
    if (!root) return null;
    
    return {
      root,
      replies: root.replies || []
    };
  }

  /**
   * Create a channel
   */
  async createChannel(channelName, description = '') {
    const channelPath = path.join(CHANNELS_DIR, `${channelName}.json`);
    const channel = {
      name: channelName,
      description,
      createdAt: new Date().toISOString(),
      subscribers: []
    };
    
    await fs.writeFile(channelPath, JSON.stringify(channel, null, 2));
    return channel;
  }

  /**
   * Subscribe agent to channel
   */
  async subscribeToChannel(agentId, channelName) {
    const channelPath = path.join(CHANNELS_DIR, `${channelName}.json`);
    try {
      const content = await fs.readFile(channelPath, 'utf8');
      const channel = JSON.parse(content);
      channel.subscribers = channel.subscribers || [];
      
      if (!channel.subscribers.includes(agentId)) {
        channel.subscribers.push(agentId);
        await fs.writeFile(channelPath, JSON.stringify(channel, null, 2));
      }
      
      return { success: true };
    } catch {
      return { success: false, error: 'Channel not found' };
    }
  }

  /**
   * Get all channels
   */
  async getChannels() {
    try {
      const files = await fs.readdir(CHANNELS_DIR);
      const channels = [];
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const content = await fs.readFile(path.join(CHANNELS_DIR, file), 'utf8');
          channels.push(JSON.parse(content));
        }
      }
      
      return channels;
    } catch {
      return [];
    }
  }

  /**
   * Get unread count for agent
   */
  async getUnreadCount(agentId) {
    const messages = await this.getMessagesForAgent(agentId, { unreadOnly: true });
    return messages.length;
  }

  /**
   * Archive old messages
   */
  async archiveOldMessages(days = 30) {
    const messages = await this.getMessages();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    const active = messages.filter(m => new Date(m.timestamp) > cutoff);
    const archived = messages.filter(m => new Date(m.timestamp) <= cutoff);
    
    await this.saveMessages(active);
    
    // Save archive
    const archivePath = path.join(COMMUNICATION_DIR, `archive-${Date.now()}.json`);
    await fs.writeFile(archivePath, JSON.stringify(archived, null, 2));
    
    return { archived: archived.length, kept: active.length };
  }

  // Private methods
  async getMessages() {
    try {
      const content = await fs.readFile(MESSAGES_FILE, 'utf8');
      return JSON.parse(content);
    } catch {
      return [];
    }
  }

  async saveMessages(messages) {
    await fs.writeFile(MESSAGES_FILE, JSON.stringify(messages, null, 2));
  }

  async appendMessage(message) {
    const messages = await this.getMessages();
    messages.push(message);
    await this.saveMessages(messages);
  }
}

export default AgentCommunicationHub;
