/**
 * POPPY Skills System
 * 
 * Reusable, composable skills that can be attached to agents.
 * Skills are like "abilities" that agents can learn.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const POPPY_DIR = path.join(os.homedir(), '.poppy');
const SKILLS_DIR = path.join(POPPY_DIR, 'skills');
const INSTALLED_SKILLS_DIR = path.join(POPPY_DIR, 'installed-skills');

/**
 * Skill Registry - Manage reusable skills
 */
export class SkillsRegistry {
  constructor() {
    this.ensureDirectories();
  }

  async ensureDirectories() {
    await fs.mkdir(SKILLS_DIR, { recursive: true });
    await fs.mkdir(INSTALLED_SKILLS_DIR, { recursive: true });
  }

  /**
   * Create a new skill
   */
  async createSkill(skillData) {
    const skill = {
      id: skillData.id || `skill-${Date.now()}`,
      name: skillData.name,
      description: skillData.description,
      version: skillData.version || '1.0.0',
      author: skillData.author || 'anonymous',
      category: skillData.category || 'general',
      tags: skillData.tags || [],
      
      // Skill content
      knowledge: skillData.knowledge || [], // Array of knowledge items
      patterns: skillData.patterns || [],     // Reusable code patterns
      rules: skillData.rules || [],           // Rules to follow
      examples: skillData.examples || [],     // Usage examples
      
      // Compatibility
      compatibleEngines: skillData.compatibleEngines || ['all'],
      requiredSkills: skillData.requiredSkills || [], // Dependencies
      
      // Metadata
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      downloads: 0,
      rating: 0
    };

    const skillPath = path.join(SKILLS_DIR, `${skill.id}.json`);
    await fs.writeFile(skillPath, JSON.stringify(skill, null, 2));
    
    return skill;
  }

  /**
   * Attach skills to an agent
   */
  async attachSkillsToAgent(agentId, skillIds) {
    const agentPath = path.join(POPPY_DIR, 'my-agents', `${agentId}.json`);
    
    try {
      const content = await fs.readFile(agentPath, 'utf8');
      const agent = JSON.parse(content);
      
      agent.skills = agent.skills || [];
      agent.skills = [...new Set([...agent.skills, ...skillIds])];
      
      await fs.writeFile(agentPath, JSON.stringify(agent, null, 2));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Get all skills with attached status for an agent
   */
  async getSkillsForAgent(agentId = null) {
    const skills = await this.listLocalSkills();
    
    if (!agentId) return skills;
    
    // Check which are attached to this agent
    const agentPath = path.join(POPPY_DIR, 'my-agents', `${agentId}.json`);
    try {
      const content = await fs.readFile(agentPath, 'utf8');
      const agent = JSON.parse(content);
      const attachedSkills = agent.skills || [];
      
      return skills.map(s => ({
        ...s,
        attached: attachedSkills.includes(s.id)
      }));
    } catch {
      return skills;
    }
  }

  /**
   * Compose skills into agent system prompt
   */
  async composeAgentWithSkills(agentId) {
    const agentPath = path.join(POPPY_DIR, 'my-agents', `${agentId}.json`);
    const content = await fs.readFile(agentPath, 'utf8');
    const agent = JSON.parse(content);
    
    if (!agent.skills || agent.skills.length === 0) {
      return agent.systemPrompt || '';
    }

    // Load all skills
    const skillPrompts = [];
    for (const skillId of agent.skills) {
      const skill = await this.getSkill(skillId);
      if (skill) {
        skillPrompts.push(this.skillToPrompt(skill));
      }
    }

    // Compose final prompt
    const composedPrompt = `
${agent.systemPrompt || ''}

## Specialized Skills
You have access to the following specialized skills:

${skillPrompts.join('\n\n---\n\n')}

When responding, apply relevant skills based on the context.
`;

    return composedPrompt;
  }

  /**
   * Convert skill to prompt text
   */
  skillToPrompt(skill) {
    let prompt = `### ${skill.name}\n${skill.description}\n\n`;
    
    if (skill.knowledge?.length > 0) {
      prompt += `**Knowledge:**\n${skill.knowledge.map(k => `- ${k}`).join('\n')}\n\n`;
    }
    
    if (skill.patterns?.length > 0) {
      prompt += `**Patterns:**\n${skill.patterns.map(p => `- ${p}`).join('\n')}\n\n`;
    }
    
    if (skill.rules?.length > 0) {
      prompt += `**Rules:**\n${skill.rules.map(r => `- ${r}`).join('\n')}\n\n`;
    }
    
    if (skill.examples?.length > 0) {
      prompt += `**Examples:**\n${skill.examples.map(e => `- ${e}`).join('\n')}\n\n`;
    }
    
    return prompt;
  }

  /**
   * Get skill by ID
   */
  async getSkill(skillId) {
    try {
      const skillPath = path.join(SKILLS_DIR, `${skillId}.json`);
      const content = await fs.readFile(skillPath, 'utf8');
      return JSON.parse(content);
    } catch {
      // Try installed skills
      try {
        const skillPath = path.join(INSTALLED_SKILLS_DIR, `${skillId}.json`);
        const content = await fs.readFile(skillPath, 'utf8');
        return JSON.parse(content);
      } catch {
        return null;
      }
    }
  }

  /**
   * List all local skills
   */
  async listLocalSkills() {
    try {
      const files = await fs.readdir(SKILLS_DIR);
      const skills = [];
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const content = await fs.readFile(path.join(SKILLS_DIR, file), 'utf8');
          skills.push(JSON.parse(content));
        }
      }
      
      return skills.sort((a, b) => b.downloads - a.downloads);
    } catch {
      return [];
    }
  }

  /**
   * Install skill from marketplace
   */
  async installSkill(skillId, source = 'registry') {
    // Fetch from registry
    const skill = await this.fetchSkillFromRegistry(skillId);
    
    const installPath = path.join(INSTALLED_SKILLS_DIR, `${skill.id}.json`);
    await fs.writeFile(installPath, JSON.stringify(skill, null, 2));
    
    return { success: true, skill };
  }

  /**
   * Publish skill to marketplace
   */
  async publishSkill(skillId) {
    const skill = await this.getSkill(skillId);
    if (!skill) throw new Error('Skill not found');
    
    // Sanitize - ensure no sensitive data
    const safeSkill = {
      ...skill,
      updatedAt: new Date().toISOString()
    };
    
    // TODO: Submit to registry
    return { success: true, skill: safeSkill };
  }

  /**
   * Fetch skill from registry
   */
  async fetchSkillFromRegistry(skillId) {
    // TODO: Implement registry fetch
    // For now, return local
    return this.getSkill(skillId);
  }

  /**
   * Get skill categories
   */
  getCategories() {
    return [
      { id: 'coding', name: 'Coding Patterns', icon: '💻' },
      { id: 'debugging', name: 'Debugging', icon: '🐛' },
      { id: 'testing', name: 'Testing', icon: '🧪' },
      { id: 'refactoring', name: 'Refactoring', icon: '♻️' },
      { id: 'architecture', name: 'Architecture', icon: '🏗️' },
      { id: 'security', name: 'Security', icon: '🔒' },
      { id: 'performance', name: 'Performance', icon: '⚡' },
      { id: 'documentation', name: 'Documentation', icon: '📝' },
      { id: 'communication', name: 'Communication', icon: '💬' },
      { id: 'general', name: 'General', icon: '🔧' }
    ];
  }
}

export default SkillsRegistry;
