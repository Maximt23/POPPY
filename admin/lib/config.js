/**
 * POPPY Configuration System
 * 
 * Supports multiple AI engines:
 * - code-puppy
 * - code-ex
 * - claude-code
 * - cursor
 * - copilot
 * - custom
 */

import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const CONFIG_DIR = path.join(os.homedir(), '.poppy');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

// Default configuration
const defaultConfig = {
  engine: 'code-puppy',  // Default engine
  apiKeys: {
    openai: '',
    anthropic: '',
    gemini: '',
    custom: ''
  },
  paths: {
    projects: path.join(os.homedir(), 'Projects'),
    agents: path.join(CONFIG_DIR, 'agents')
  },
  git: {
    enabled: true,
    provider: 'github',
    username: '',
    token: '',
    autoSync: false
  },
  features: {
    dailyLog: true,
    agentInventory: true,
    gitIntegration: true,
    projectTemplates: true
  }
};

// Engine definitions
export const ENGINES = {
  'code-puppy': {
    name: 'Code-Puppy',
    description: 'Personal AI assistant with project isolation',
    configPath: '.code-puppy'
  },
  'code-ex': {
    name: 'Code-Ex',
    description: 'Extended code assistant engine',
    configPath: '.code-ex'
  },
  'claude-code': {
    name: 'Claude Code',
    description: 'Anthropic Claude Code assistant',
    configPath: '.claude-code'
  },
  'cursor': {
    name: 'Cursor',
    description: 'AI-first code editor',
    configPath: '.cursor'
  },
  'copilot': {
    name: 'GitHub Copilot',
    description: 'GitHub AI pair programmer',
    configPath: '.copilot'
  },
  'custom': {
    name: 'Custom Engine',
    description: 'Your own AI configuration',
    configPath: '.poppy'
  }
};

export async function loadConfig() {
  try {
    await fs.mkdir(CONFIG_DIR, { recursive: true });
    const content = await fs.readFile(CONFIG_FILE, 'utf8');
    return { ...defaultConfig, ...JSON.parse(content) };
  } catch {
    await saveConfig(defaultConfig);
    return defaultConfig;
  }
}

export async function saveConfig(config) {
  await fs.mkdir(CONFIG_DIR, { recursive: true });
  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export async function setupEngine(engine) {
  const config = await loadConfig();
  config.engine = engine;
  await saveConfig(config);
  return config;
}

export async function setApiKey(provider, token) {
  const config = await loadConfig();
  config.apiKeys[provider] = token;
  await saveConfig(config);
}
