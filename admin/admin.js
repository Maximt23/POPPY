#!/usr/bin/env node

import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.dirname(__dirname);

// ═══════════════════════════════════════════════════════════
// 🛡️ SECURITY MODULE
// ═══════════════════════════════════════════════════════════

// Rate limiter - prevent rapid-fire operations
class RateLimiter {
  constructor() {
    this.cooldowns = new Map();
    this.COOLDOWN_MS = 1000; // 1 second between operations
  }

  check(operation) {
    const now = Date.now();
    const last = this.cooldowns.get(operation);
    if (last && (now - last) < this.COOLDOWN_MS) {
      const wait = Math.ceil((this.COOLDOWN_MS - (now - last)) / 1000);
      return { allowed: false, wait };
    }
    this.cooldowns.set(operation, now);
    return { allowed: true };
  }
}
const rateLimiter = new RateLimiter();

// Input sanitization - prevent injection attacks
function sanitize(input, type = 'string') {
  if (!input || typeof input !== 'string') return '';
  
  // Remove null bytes and control chars
  let clean = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  switch (type) {
    case 'name':
      clean = clean.replace(/[^a-zA-Z0-9_\-\s]/g, '').slice(0, 50);
      break;
    case 'filename':
      // Prevent path traversal
      clean = clean.replace(/[\\/:*?"<>|]/g, '')
                   .replace(/\.\./g, '')
                   .slice(0, 50);
      break;
    case 'description':
      clean = clean.replace(/[<>\"']/g, '').slice(0, 500);
      break;
  }
  return clean.trim();
}

// Validate file path doesn't escape allowed directory
function validatePath(basePath, userPath) {
  const resolved = path.resolve(baseDir, userPath);
  const relative = path.relative(baseDir, resolved);
  if (relative.startsWith('..') || relative.startsWith('.')) {
    throw new Error('Invalid path: Directory traversal detected');
  }
  return resolved;
}

// ═══════════════════════════════════════════════════════════
// DATA LAYER
// ═══════════════════════════════════════════════════════════

const DATA_DIR = path.join(__dirname, 'data');
const AGENTS_DIR = path.join(ROOT_DIR, 'agents');
const SKILLS_DIR = path.join(DATA_DIR, 'skills');
const PROMPTS_DIR = path.join(DATA_DIR, 'prompts');

// Load/save agents
async function loadAgents() {
  const agents = [];
  try {
    const files = await fs.readdir(AGENTS_DIR);
    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await fs.readFile(path.join(AGENTS_DIR, file), 'utf8');
        const agent = JSON.parse(content);
        if (!agent.skills) agent.skills = [];
        if (!agent.prompts) agent.prompts = [];
        agents.push(agent);
      }
    }
  } catch (e) {}
  return agents;
}

async function saveAgent(agent) {
  const safeName = sanitize(agent.name, 'filename');
  const filename = `${safeName}-${agent.id.slice(-6)}.json`;
  await fs.writeFile(path.join(AGENTS_DIR, filename), JSON.stringify(agent, null, 2));
}

// Load/save skills
async function loadSkills() {
  const skills = [];
  try {
    await fs.mkdir(SKILLS_DIR, { recursive: true });
    const files = await fs.readdir(SKILLS_DIR);
    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await fs.readFile(path.join(SKILLS_DIR, file), 'utf8');
        skills.push(JSON.parse(content));
      }
    }
  } catch (e) {}
  return skills;
}

async function saveSkill(skill) {
  const safeName = sanitize(skill.name, 'filename');
  const filename = `${safeName}-${skill.id.slice(-6)}.json`;
  await fs.writeFile(path.join(SKILLS_DIR, filename), JSON.stringify(skill, null, 2));
}

// Load/save prompts
async function loadPrompts() {
  const prompts = [];
  try {
    await fs.mkdir(PROMPTS_DIR, { recursive: true });
    const files = await fs.readdir(PROMPTS_DIR);
    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await fs.readFile(path.join(PROMPTS_DIR, file), 'utf8');
        prompts.push(JSON.parse(content));
      }
    }
  } catch (e) {}
  return prompts;
}

async function savePrompt(prompt) {
  const safeName = sanitize(prompt.name, 'filename');
  const filename = `${safeName}-${prompt.id.slice(-6)}.json`;
  await fs.writeFile(path.join(PROMPTS_DIR, filename), JSON.stringify(prompt, null, 2));
}

// ═══════════════════════════════════════════════════════════
// UI THEME
// ═══════════════════════════════════════════════════════════

const theme = {
  primary: chalk.hex('#22c55e').bold,
  accent: chalk.hex('#4ade80'),
  error: chalk.hex('#ef4444'),
  warning: chalk.hex('#f59e0b'),
  info: chalk.hex('#3b82f6'),
  dim: chalk.gray
};

const log = {
  success: (t) => console.log(theme.accent('✓ ') + t),
  error: (t) => console.log(theme.error('✗ ') + t),
  warning: (t) => console.log(theme.warning('⚠ ') + t),
  info: (t) => console.log(theme.info('ℹ ') + t)
};

function header() {
  console.clear();
  console.log('\n' + theme.primary('🐶 POPPY\n'));
}

async function pause() {
  await inquirer.prompt([{ type: 'input', name: 'c', message: theme.dim('Press Enter...') }]);
}

// ═══════════════════════════════════════════════════════════
// CORE FUNCTIONS
// ═══════════════════════════════════════════════════════════

async function createAgent() {
  header();
  
  // Rate limiting
  const rate = rateLimiter.check('createAgent');
  if (!rate.allowed) {
    log.warning(`Rate limited: Wait ${rate.wait}s`);
    await pause();
    return;
  }
  
  const ans = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: theme.accent('Agent name:'),
      validate: (i) => sanitize(i, 'name').length > 0 || 'Name required (alphanumeric only)'
    },
    { type: 'input', name: 'desc', message: theme.accent('Description:'), default: 'A helpful agent' },
    {
      type: 'list',
      name: 'role',
      message: theme.accent('Role:'),
      choices: ['Frontend Dev', 'Backend Dev', 'DevOps', 'QA', 'Product Manager', 'Other']
    }
  ]);
  
  const agent = {
    id: `agent-${Date.now()}`,
    name: sanitize(ans.name, 'name'),
    description: sanitize(ans.desc, 'description'),
    role: ans.role,
    skills: [],
    prompts: [],
    createdAt: new Date().toISOString()
  };
  
  await saveAgent(agent);
  log.success(`Created: ${agent.name}`);
  await pause();
}

async function listAgents() {
  header();
  const agents = await loadAgents();
  
  if (agents.length === 0) {
    log.warning('No agents. Create one first!');
  } else {
    agents.forEach((a, i) => {
      console.log(`${i + 1}. ${theme.accent(a.name)} [${a.skills.length} skills, ${a.prompts.length} prompts]`);
      console.log(`   ${theme.dim(a.description)}\n`);
    });
  }
  await pause();
}

async function createSkill() {
  header();
  
  const rate = rateLimiter.check('createSkill');
  if (!rate.allowed) {
    log.warning(`Rate limited: Wait ${rate.wait}s`);
    await pause();
    return;
  }
  
  const ans = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: theme.accent('Skill name:'),
      validate: (i) => sanitize(i, 'name').length > 0 || 'Name required'
    },
    {
      type: 'list',
      name: 'category',
      message: theme.accent('Category:'),
      choices: ['Frontend', 'Backend', 'Mobile', 'DevOps', 'Testing', 'Security', 'Other']
    },
    { type: 'input', name: 'desc', message: theme.accent('Description:') }
  ]);
  
  const skill = {
    id: `skill-${Date.now()}`,
    name: sanitize(ans.name, 'name'),
    category: ans.category.toLowerCase(),
    description: sanitize(ans.desc, 'description'),
    createdAt: new Date().toISOString()
  };
  
  await saveSkill(skill);
  log.success(`Created: ${skill.name}`);
  await pause();
}

async function listSkills() {
  header();
  const skills = await loadSkills();
  
  if (skills.length === 0) {
    log.warning('No skills. Create one first!');
  } else {
    skills.forEach((s, i) => {
      console.log(`${i + 1}. ${theme.accent(s.name)} (${s.category})`);
      console.log(`   ${theme.dim(s.description)}\n`);
    });
  }
  await pause();
}

async function createPrompt() {
  header();
  
  const rate = rateLimiter.check('createPrompt');
  if (!rate.allowed) {
    log.warning(`Rate limited: Wait ${rate.wait}s`);
    await pause();
    return;
  }
  
  const ans = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: theme.accent('Prompt name:'),
      validate: (i) => sanitize(i, 'name').length > 0 || 'Name required'
    },
    {
      type: 'list',
      name: 'category',
      message: theme.accent('Category:'),
      choices: ['System', 'User', 'Template', 'Other']
    },
    { type: 'input', name: 'desc', message: theme.accent('Description:') }
  ]);
  
  const prompt = {
    id: `prompt-${Date.now()}`,
    name: sanitize(ans.name, 'name'),
    category: ans.category.toLowerCase(),
    description: sanitize(ans.desc, 'description'),
    createdAt: new Date().toISOString()
  };
  
  await savePrompt(prompt);
  log.success(`Created: ${prompt.name}`);
  await pause();
}

async function listPrompts() {
  header();
  const prompts = await loadPrompts();
  
  if (prompts.length === 0) {
    log.warning('No prompts. Create one first!');
  } else {
    prompts.forEach((p, i) => {
      console.log(`${i + 1}. ${theme.accent(p.name)} (${p.category})`);
      console.log(`   ${theme.dim(p.description)}\n`);
    });
  }
  await pause();
}

async function attachSkill() {
  header();
  const agents = await loadAgents();
  const skills = await loadSkills();
  
  if (agents.length === 0 || skills.length === 0) {
    log.warning('Need both agents and skills!');
    await pause();
    return;
  }
  
  const { agentId } = await inquirer.prompt([{
    type: 'list',
    name: 'agentId',
    message: theme.accent('Select agent:'),
    choices: agents.map(a => ({ name: a.name, value: a.id }))
  }]);
  
  const { skillIds } = await inquirer.prompt([{
    type: 'checkbox',
    name: 'skillIds',
    message: theme.accent('Select skills:'),
    choices: skills.map(s => ({ name: `${s.name} (${s.category})`, value: s.id }))
  }]);
  
  if (skillIds.length === 0) return;
  
  const agent = agents.find(a => a.id === agentId);
  for (const sid of skillIds) {
    if (!agent.skills.includes(sid)) agent.skills.push(sid);
  }
  
  await saveAgent(agent);
  log.success(`Attached ${skillIds.length} skill(s) to ${agent.name}`);
  await pause();
}

async function attachPrompt() {
  header();
  const agents = await loadAgents();
  const prompts = await loadPrompts();
  
  if (agents.length === 0 || prompts.length === 0) {
    log.warning('Need both agents and prompts!');
    await pause();
    return;
  }
  
  const { agentId } = await inquirer.prompt([{
    type: 'list',
    name: 'agentId',
    message: theme.accent('Select agent:'),
    choices: agents.map(a => ({ name: a.name, value: a.id }))
  }]);
  
  const { promptIds } = await inquirer.prompt([{
    type: 'checkbox',
    name: 'promptIds',
    message: theme.accent('Select prompts:'),
    choices: prompts.map(p => ({ name: `${p.name} (${p.category})`, value: p.id }))
  }]);
  
  if (promptIds.length === 0) return;
  
  const agent = agents.find(a => a.id === agentId);
  for (const pid of promptIds) {
    if (!agent.prompts.includes(pid)) agent.prompts.push(pid);
  }
  
  await saveAgent(agent);
  log.success(`Attached ${promptIds.length} prompt(s) to ${agent.name}`);
  await pause();
}

// ═══════════════════════════════════════════════════════════
// MENUS
// ═══════════════════════════════════════════════════════════

async function agentMenu() {
  header();
  const { action } = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: theme.primary('🤖 Agents:'),
    choices: [
      { name: '➕ Create', value: 'create' },
      { name: '📁 List', value: 'list' },
      { name: '← Back', value: 'back' }
    ]
  }]);
  
  if (action === 'create') await createAgent();
  else if (action === 'list') await listAgents();
  
  return action === 'back' ? 'back' : await agentMenu();
}

async function skillMenu() {
  header();
  const { action } = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: theme.primary('🎯 Skills:'),
    choices: [
      { name: '➕ Create', value: 'create' },
      { name: '📁 List', value: 'list' },
      { name: '🔗 Attach to Agent', value: 'attach' },
      { name: '← Back', value: 'back' }
    ]
  }]);
  
  if (action === 'create') await createSkill();
  else if (action === 'list') await listSkills();
  else if (action === 'attach') await attachSkill();
  
  return action === 'back' ? 'back' : await skillMenu();
}

async function promptMenu() {
  header();
  const { action } = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: theme.primary('💬 Prompts:'),
    choices: [
      { name: '➕ Create', value: 'create' },
      { name: '📁 List', value: 'list' },
      { name: '🔗 Attach to Agent', value: 'attach' },
      { name: '← Back', value: 'back' }
    ]
  }]);
  
  if (action === 'create') await createPrompt();
  else if (action === 'list') await listPrompts();
  else if (action === 'attach') await attachPrompt();
  
  return action === 'back' ? 'back' : await promptMenu();
}

async function mainMenu() {
  header();
  
  const { choice } = await inquirer.prompt([{
    type: 'list',
    name: 'choice',
    message: theme.primary('Main Menu:'),
    choices: [
      { name: '🤖 Agents', value: 'agents' },
      { name: '🎯 Skills', value: 'skills' },
      { name: '💬 Prompts', value: 'prompts' },
      { name: chalk.red('✕ Exit'), value: 'exit' }
    ]
  }]);
  
  if (choice === 'exit') return 'exit';
  
  const result = await {
    agents: agentMenu,
    skills: skillMenu,
    prompts: promptMenu
  }[choice]();
  
  return result === 'back' ? mainMenu() : result;
}

// ═══════════════════════════════════════════════════════════
// ENTRY
// ═══════════════════════════════════════════════════════════

async function main() {
  while (true) {
    const result = await mainMenu();
    if (result === 'exit') {
      console.log('\n' + theme.primary('🐶 Goodbye!\n'));
      break;
    }
  }
}

main().catch(console.error);
