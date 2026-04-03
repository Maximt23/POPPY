/**
 * POPPY Metrics & Analytics System
 * 
 * Track usage, popularity, and performance for marketplace insights.
 * Only the creator/admin gets access to these metrics.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const POPPY_DIR = path.join(os.homedir(), '.poppy');
const METRICS_FILE = path.join(POPPY_DIR, 'metrics.json');
const ANALYTICS_DIR = path.join(POPPY_DIR, 'analytics');

/**
 * Metrics Collector
 */
export class MetricsCollector {
  constructor() {
    this.ensureDirectories();
    this.sessionStart = Date.now();
  }

  async ensureDirectories() {
    await fs.mkdir(ANALYTICS_DIR, { recursive: true });
  }

  /**
   * Track agent installation
   */
  async trackAgentInstall(agentId, source = 'marketplace') {
    const metrics = await this.getMetrics();
    
    metrics.agentInstalls = metrics.agentInstalls || {};
    metrics.agentInstalls[agentId] = metrics.agentInstalls[agentId] || { count: 0, sources: {} };
    
    metrics.agentInstalls[agentId].count++;
    metrics.agentInstalls[agentId].sources[source] = (metrics.agentInstalls[agentId].sources[source] || 0) + 1;
    metrics.agentInstalls[agentId].lastInstalled = new Date().toISOString();
    
    await this.saveMetrics(metrics);
  }

  /**
   * Track skill installation
   */
  async trackSkillInstall(skillId) {
    const metrics = await this.getMetrics();
    
    metrics.skillInstalls = metrics.skillInstalls || {};
    metrics.skillInstalls[skillId] = metrics.skillInstalls[skillId] || { count: 0 };
    metrics.skillInstalls[skillId].count++;
    metrics.skillInstalls[skillId].lastInstalled = new Date().toISOString();
    
    await this.saveMetrics(metrics);
  }

  /**
   * Track agent usage (when agent is activated)
   */
  async trackAgentUsage(agentId, engine, duration) {
    const metrics = await this.getMetrics();
    
    metrics.agentUsage = metrics.agentUsage || {};
    metrics.agentUsage[agentId] = metrics.agentUsage[agentId] || { 
      sessions: 0, 
      totalDuration: 0,
      engines: {}
    };
    
    metrics.agentUsage[agentId].sessions++;
    metrics.agentUsage[agentId].totalDuration += duration;
    metrics.agentUsage[agentId].engines[engine] = (metrics.agentUsage[agentId].engines[engine] || 0) + 1;
    metrics.agentUsage[agentId].lastUsed = new Date().toISOString();
    
    await this.saveMetrics(metrics);
  }

  /**
   * Track engine usage
   */
  async trackEngineUsage(engine, success = true) {
    const metrics = await this.getMetrics();
    
    metrics.engineUsage = metrics.engineUsage || {};
    metrics.engineUsage[engine] = metrics.engineUsage[engine] || { 
      launches: 0, 
      successes: 0, 
      failures: 0 
    };
    
    metrics.engineUsage[engine].launches++;
    if (success) {
      metrics.engineUsage[engine].successes++;
    } else {
      metrics.engineUsage[engine].failures++;
    }
    
    await this.saveMetrics(metrics);
  }

  /**
   * Track project creation
   */
  async trackProjectCreated(template, projectType) {
    const metrics = await this.getMetrics();
    
    metrics.projectsCreated = metrics.projectsCreated || { total: 0, byTemplate: {}, byType: {} };
    metrics.projectsCreated.total++;
    metrics.projectsCreated.byTemplate[template] = (metrics.projectsCreated.byTemplate[template] || 0) + 1;
    metrics.projectsCreated.byType[projectType] = (metrics.projectsCreated.byType[projectType] || 0) + 1;
    
    await this.saveMetrics(metrics);
  }

  /**
   * Track API key configuration
   */
  async trackApiKeyConfigured(provider) {
    const metrics = await this.getMetrics();
    
    metrics.apiKeys = metrics.apiKeys || {};
    metrics.apiKeys[provider] = (metrics.apiKeys[provider] || 0) + 1;
    
    await this.saveMetrics(metrics);
  }

  /**
   * Track agent rating
   */
  async trackAgentRating(agentId, rating) {
    const metrics = await this.getMetrics();
    
    metrics.agentRatings = metrics.agentRatings || {};
    metrics.agentRatings[agentId] = metrics.agentRatings[agentId] || { 
      ratings: [], 
      average: 0,
      total: 0
    };
    
    metrics.agentRatings[agentId].ratings.push({
      rating,
      timestamp: new Date().toISOString()
    });
    metrics.agentRatings[agentId].total++;
    
    // Recalculate average
    const sum = metrics.agentRatings[agentId].ratings.reduce((a, b) => a + b.rating, 0);
    metrics.agentRatings[agentId].average = sum / metrics.agentRatings[agentId].ratings.length;
    
    await this.saveMetrics(metrics);
  }

  /**
   * Get comprehensive dashboard data
   */
  async getDashboard() {
    const metrics = await this.getMetrics();
    
    return {
      // Overview
      summary: {
        totalAgentInstalls: this.sumObject(metrics.agentInstalls, 'count'),
        totalSkillInstalls: this.sumObject(metrics.skillInstalls, 'count'),
        totalProjects: metrics.projectsCreated?.total || 0,
        totalSessions: this.sumObject(metrics.agentUsage, 'sessions'),
        totalDuration: this.sumObject(metrics.agentUsage, 'totalDuration')
      },
      
      // Popular agents
      topAgents: this.sortByCount(metrics.agentInstalls, 10),
      
      // Most used agents
      mostUsedAgents: this.sortByCount(metrics.agentUsage, 'sessions', 10),
      
      // Engine popularity
      enginePopularity: this.sortByCount(metrics.engineUsage, 'launches'),
      
      // Project templates
      popularTemplates: this.sortByCount(metrics.projectsCreated?.byTemplate || {}),
      
      // API key distribution
      apiKeyDistribution: metrics.apiKeys || {},
      
      // Agent ratings
      topRatedAgents: this.sortByRating(metrics.agentRatings, 10),
      
      // Trends (last 30 days)
      recentActivity: await this.getRecentActivity(30)
    };
  }

  /**
   * Get recent activity
   */
  async getRecentActivity(days = 30) {
    const metrics = await this.getMetrics();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    // Filter recent agent installs
    const recentInstalls = Object.entries(metrics.agentInstalls || {})
      .filter(([id, data]) => new Date(data.lastInstalled) > cutoff);
    
    // Filter recent usage
    const recentUsage = Object.entries(metrics.agentUsage || {})
      .filter(([id, data]) => new Date(data.lastUsed) > cutoff);
    
    return {
      installs: recentInstalls.length,
      activeAgents: recentUsage.length,
      trends: this.calculateTrends(recentInstalls)
    };
  }

  /**
   * Generate daily report
   */
  async generateDailyReport() {
    const dashboard = await this.getDashboard();
    const date = new Date().toISOString().split('T')[0];
    
    const report = {
      date,
      summary: dashboard.summary,
      highlights: {
        topAgent: dashboard.topAgents[0],
        mostUsedEngine: dashboard.enginePopularity[0],
        popularTemplate: dashboard.popularTemplates[0]
      },
      changes: await this.compareToYesterday()
    };
    
    // Save report
    const reportPath = path.join(ANALYTICS_DIR, `report-${date}.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    return report;
  }

  /**
   * Export metrics for admin dashboard
   */
  async exportMetrics(format = 'json') {
    const metrics = await this.getMetrics();
    const dashboard = await this.getDashboard();
    
    if (format === 'json') {
      return { metrics, dashboard };
    }
    
    if (format === 'csv') {
      // Generate CSV for agent installs
      const headers = ['Agent ID', 'Installs', 'Last Installed'];
      const rows = Object.entries(metrics.agentInstalls || {}).map(([id, data]) => [
        id,
        data.count,
        data.lastInstalled
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
    
    return null;
  }

  /**
   * Reset metrics (for testing)
   */
  async resetMetrics() {
    await fs.writeFile(METRICS_FILE, JSON.stringify({
      resetAt: new Date().toISOString()
    }, null, 2));
  }

  // Private helpers
  async getMetrics() {
    try {
      const content = await fs.readFile(METRICS_FILE, 'utf8');
      return JSON.parse(content);
    } catch {
      return {
        createdAt: new Date().toISOString(),
        version: '1.0'
      };
    }
  }

  async saveMetrics(metrics) {
    await fs.writeFile(METRICS_FILE, JSON.stringify(metrics, null, 2));
  }

  sumObject(obj, field) {
    if (!obj) return 0;
    return Object.values(obj).reduce((sum, item) => {
      const value = field === 'count' ? item : item[field];
      return sum + (value || 0);
    }, 0);
  }

  sortByCount(obj, countField = 'count', limit = null) {
    if (!obj) return [];
    
    const sorted = Object.entries(obj)
      .map(([id, data]) => ({
        id,
        ...data,
        count: countField === 'count' ? data.count : data[countField]
      }))
      .sort((a, b) => b.count - a.count);
    
    return limit ? sorted.slice(0, limit) : sorted;
  }

  sortByRating(ratings, limit = null) {
    if (!ratings) return [];
    
    const sorted = Object.entries(ratings)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.average - a.average);
    
    return limit ? sorted.slice(0, limit) : sorted;
  }

  calculateTrends(recentData) {
    // Simple trend calculation
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    const byDay = {};
    for (let i = 0; i < 7; i++) {
      const day = new Date(now - (i * oneDay)).toISOString().split('T')[0];
      byDay[day] = 0;
    }
    
    // Count installs by day
    recentData.forEach(([id, data]) => {
      const day = new Date(data.lastInstalled).toISOString().split('T')[0];
      if (byDay[day] !== undefined) {
        byDay[day]++;
      }
    });
    
    return byDay;
  }

  async compareToYesterday() {
    // Compare today's metrics to yesterday
    return {
      installs: { change: 0, percent: 0 },
      usage: { change: 0, percent: 0 }
    };
  }
}

export default MetricsCollector;
