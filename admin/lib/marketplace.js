/**
 * POPPY Agent Marketplace
 * 
 * Community-driven agent sharing platform
 * - Browse public agents
 * - Share your agents
 * - Install agents without sharing API keys
 * - Rate and review agents
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// POPPY Registry (GitHub-based public registry)
const POPPY_REGISTRY_URL = 'https://raw.githubusercontent.com/Maximt23/poppy-registry/main/agents';
const POPPY_REGISTRY_REPO = 'https://github.com/Maximt23/poppy-registry';

// Local paths
const POPPY_DIR = path.join(os.homedir(), '.poppy');
const INSTALLED_AGENTS_DIR = path.join(POPPY_DIR, 'installed-agents');
const USER_AGENTS_DIR = path.join(POPPY_DIR, 'my-agents');
const MARKETPLACE_CACHE = path.join(POPPY_DIR, 'marketplace-cache.json');

/**
 * Agent Registry Entry
 */
export class AgentRegistry {
  constructor() {
    this.ensureDirectories();
  }

  async ensureDirectories() {
    await fs.mkdir(INSTALLED_AGENTS_DIR, { recursive: true });
    await fs.mkdir(USER_AGENTS_DIR, { recursive: true });
  }

  /**
   * Fetch public agents from registry
   */
  async fetchPublicAgents(filters = {}) {
    try {
      // In production, this fetches from POPPY_REGISTRY_URL
      // For now, return local + example public agents
      const localPublic = await this.getLocalPublicAgents();
      const cached = await this.getCachedAgents();
      
      let agents = [...localPublic, ...cached];
      
      // Apply filters
      if (filters.category) {
        agents = agents.filter(a => a.category === filters.category);
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        agents = agents.filter(a => 
          a.name.toLowerCase().includes(search) ||
          a.description.toLowerCase().includes(search) ||
          a.tags?.some(t => t.toLowerCase().includes(search))
        );
      }
      if (filters.engine) {
        agents = agents.filter(a => 
          a.compatibleEngines?.includes(filters.engine) || 
          a.compatibleEngines?.includes('all')
        );
      }
      
      return agents.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
    } catch (err) {
      console.error('Error fetching agents:', err);
      return [];
    }
  }

  /**
   * Get user's local public agents
   */
  async getLocalPublicAgents() {
    try {
      const agentsDir = path.join(process.cwd(), '..', 'agents');
      const files = await fs.readdir(agentsDir);
      const agents = [];
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const content = await fs.readFile(path.join(agentsDir, file), 'utf8');
          const agent = JSON.parse(content);
          if (agent.shared !== false) {
            agents.push({
              ...agent,
              source: 'local',
              installed: true
            });
          }
        }
      }
      
      return agents;
    } catch {
      return [];
    }
  }

  /**
   * Get cached marketplace agents
   */
  async getCachedAgents() {
    try {
      const content = await fs.readFile(MARKETPLACE_CACHE, 'utf8');
      const data = JSON.parse(content);
      // Check if cache is fresh (< 1 hour)
      if (Date.now() - data.timestamp < 3600000) {
        return data.agents || [];
      }
      return [];
    } catch {
      return [];
    }
  }

  /**
   * Install an agent from marketplace
   */
  async installAgent(agentId, source = 'registry') {
    try {
      // Fetch agent definition
      const agent = await this.fetchAgentDefinition(agentId, source);
      
      // Save to installed agents
      const installPath = path.join(INSTALLED_AGENTS_DIR, `${agent.id}.json`);
      await fs.writeFile(installPath, JSON.stringify({
        ...agent,
        installedAt: new Date().toISOString(),
        installSource: source
      }, null, 2));

      return { success: true, agent };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Publish agent to marketplace
   */
  async publishAgent(agentData, userConfig) {
    // Sanitize - remove any API keys or sensitive data
    const safeAgent = {
      id: agentData.id,
      name: agentData.name,
      description: agentData.description,
      category: agentData.category || 'general',
      tags: agentData.tags || [],
      compatibleEngines: agentData.compatibleEngines || ['all'],
      author: userConfig.username || 'anonymous',
      version: agentData.version || '1.0.0',
      createdAt: agentData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: agentData.settings || {},
      // NEVER include API keys or tokens
      requiresApiKey: agentData.requiresApiKey || false,
      apiKeyProviders: agentData.apiKeyProviders || [],
      // Store agent behavior/instructions
      behavior: agentData.behavior || {},
      // Prompts and instructions
      systemPrompt: agentData.systemPrompt || '',
      instructions: agentData.instructions || [],
      // Metadata
      rating: 0,
      downloads: 0,
      reviews: []
    };

    // Save to user's public agents
    const publishPath = path.join(USER_AGENTS_DIR, `${safeAgent.id}.json`);
    await fs.writeFile(publishPath, JSON.stringify(safeAgent, null, 2));

    // TODO: Submit to public registry via PR or API
    return { success: true, agent: safeAgent };
  }

  /**
   * Get installed agents for current user
   */
  async getInstalledAgents() {
    try {
      const files = await fs.readdir(INSTALLED_AGENTS_DIR);
      const agents = [];
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const content = await fs.readFile(path.join(INSTALLED_AGENTS_DIR, file), 'utf8');
          agents.push(JSON.parse(content));
        }
      }
      
      return agents;
    } catch {
      return [];
    }
  }

  /**
   * Uninstall an agent
   */
  async uninstallAgent(agentId) {
    try {
      const installPath = path.join(INSTALLED_AGENTS_DIR, `${agentId}.json`);
      await fs.unlink(installPath);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Rate/review an agent
   */
  async rateAgent(agentId, rating, review, username) {
    // TODO: Submit to registry
    console.log(`Rating ${agentId}: ${rating} stars by ${username}`);
    return { success: true };
  }

  /**
   * Fetch agent definition
   */
  async fetchAgentDefinition(agentId, source) {
    if (source === 'local') {
      const localPath = path.join(process.cwd(), '..', 'agents', `${agentId}.json`);
      const content = await fs.readFile(localPath, 'utf8');
      return JSON.parse(content);
    }
    
    // Fetch from registry
    const response = await fetch(`${POPPY_REGISTRY_URL}/${agentId}.json`);
    if (!response.ok) throw new Error('Agent not found in registry');
    return await response.json();
  }

  /**
   * Get agent categories
   */
  getCategories() {
    return [
      { id: 'development', name: 'Development', icon: '💻' },
      { id: 'debugging', name: 'Debugging', icon: '🐛' },
      { id: 'documentation', name: 'Documentation', icon: '📚' },
      { id: 'testing', name: 'Testing', icon: '🧪' },
      { id: 'architecture', name: 'Architecture', icon: '🏗️' },
      { id: 'git', name: 'Git & DevOps', icon: '🔀' },
      { id: 'review', name: 'Code Review', icon: '👀' },
      { id: 'product', name: 'Product Management', icon: '📋' },
      { id: 'ui-ux', name: 'UI/UX Design', icon: '🎨' },
      { id: 'database', name: 'Database', icon: '🗄️' },
      { id: 'security', name: 'Security', icon: '🔒' },
      { id: 'performance', name: 'Performance', icon: '⚡' },
      { id: 'general', name: 'General Purpose', icon: '🔧' }
    ];
  }

  /**
   * Get compatible AI engines
   */
  getCompatibleEngines() {
    return [
      { id: 'code-puppy', name: 'Code-Puppy' },
      { id: 'code-ex', name: 'Code-Ex' },
      { id: 'claude-code', name: 'Claude Code' },
      { id: 'cursor', name: 'Cursor' },
      { id: 'copilot', name: 'GitHub Copilot' },
      { id: 'all', name: 'Universal (All Engines)' }
    ];
  }
}

export default AgentRegistry;
