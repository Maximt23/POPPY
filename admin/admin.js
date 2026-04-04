#!/usr/bin/env node

import chalk from 'chalk';
import inquirer from 'inquirer';
import boxen from 'boxen';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const ROOT_DIR = path.dirname(__dirname);
const DATA_DIR = path.join(__dirname, 'data');
const AGENTS_DIR = path.join(ROOT_DIR, 'agents');
const SKILLS_DIR = path.join(DATA_DIR, 'skills');
const PROMPTS_DIR = path.join(DATA_DIR, 'prompts');

// Theme
const theme = {
  primary: chalk.hex('#22c55e'),
  secondary: chalk.hex('#16a34a'),
  accent: chalk.hex('#4ade80'),
  error: chalk.hex('#ef4444'),
  warning: chalk.hex('#f59e0b'),
  info: chalk.hex('#3b82f6'),
  dim: chalk.gray
};

const log = {
  success: (text) => console.log(theme.accent('✓ ') + text),
  error: (text) => console.log(theme.error('✗ ') + text),
  warning: (text) => console.log(theme.warning('⚠ ') + text),
  info: (text) => console.log(theme.info('ℹ ') + text),
  divider: () => console.log(theme.dim('─'.repeat(60)))
};

function showHeader() {
  console.clear();
  console.log('\n' + theme.primary.bold('🐶 POPPY\n'));
}

async function pause() {
  await inquirer.prompt([{ type: 'input', name: 'continue', message: theme.dim('Press Enter...') }]);
}

// ═══════════════════════════════════════════════════════════
// DATA LOADING & SAVING
// ═══════════════════════════════════════════════════════════

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
  const safeName = agent.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const filename = `${safeName}-${agent.id.slice(-6)}.json`;
  await fs.writeFile(path.join(AGENTS_DIR, filename), JSON.stringify(agent, null, 2));
}

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
  const safeName = skill.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const filename = `${safeName}-${skill.id.slice(-6)}.json`;
  await fs.writeFile(path.join(SKILLS_DIR, filename), JSON.stringify(skill, null, 2));
}

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
  const safeName = prompt.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const filename = `${safeName}-${prompt.id.slice(-6)}.json`;
  await fs.writeFile(path.join(PROMPTS_DIR, filename), JSON.stringify(prompt, null, 2));
}

// ═══════════════════════════════════════════════════════════
// AGENTS
// ═══════════════════════════════════════════════════════════

async function listAgents() {
  showHeader();
  console.log(theme.primary.bold('🤖 My Agents\n'));
  
  const agents = await loadAgents();
  
  if (agents.length === 0) {
    log.warning('No agents yet. Create one first!');
  } else {
    agents.forEach((agent, i) => {
      const skills = agent.skills?.length || 0;
      const prompts = agent.prompts?.length || 0;
      console.log(`${i + 1}. ${theme.accent(agent.name)} ${theme.dim(`[${skills} skills, ${prompts} prompts]`)}`);
      console.log(`   ${theme.dim(agent.description || 'No description')}`);
      console.log(`   ${theme.dim(`ID: ${agent.id}`)}\n`);
    });
  }
  
  log.divider();
  await pause();
}

async function createAgent() {
  showHeader();
  console.log(theme.primary.bold('➕ Create New Agent\n'));
  
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: theme.accent('Agent name:'),
      validate: (input) => input.trim().length > 0 || 'Name required'
    },
    {
      type: 'input',
      name: 'description',
      message: theme.accent('Description:'),
      default: 'A helpful agent'
    },
    {
      type: 'list',
      name: 'role',
      message: theme.accent('Role:'),
      choices: ['Frontend Developer', 'Backend Developer', 'DevOps Engineer', 'QA Engineer', 'Product Manager', 'Other']
    }
  ]);
  
  const agent = {
    id: `agent-${Date.now()}`,
    name: answers.name.trim(),
    description: answers.description.trim(),
    role: answers.role,
    skills: [],
    prompts: [],
    createdAt: new Date().toISOString()
  };
  
  await saveAgent(agent);
  
  log.success(`Created agent: ${agent.name}`);
  log.info(`ID: ${agent.id}`);
  await pause();
}

// ═══════════════════════════════════════════════════════════
// SKILLS
// ═══════════════════════════════════════════════════════════

async function listSkills() {
  showHeader();
  console.log(theme.primary.bold('🎯 My Skills\n'));
  
  const skills = await loadSkills();
  
  if (skills.length === 0) {
    log.warning('No skills yet. Create one first!');
  } else {
    skills.forEach((skill, i) => {
      console.log(`${i + 1}. ${theme.accent(skill.name)} ${theme.dim(`(${skill.category})`)}`);
      console.log(`   ${theme.dim(skill.description || 'No description')}`);
      console.log(`   ${theme.dim(`ID: ${skill.id}`)}\n`);
    });
  }
  
  log.divider();
  await pause();
}

async function createSkill() {
  showHeader();
  console.log(theme.primary.bold('➕ Create New Skill\n'));
  
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: theme.accent('Skill name:'),
      validate: (input) => input.trim().length > 0 || 'Name required'
    },
    {
      type: 'list',
      name: 'category',
      message: theme.accent('Category:'),
      choices: ['Frontend', 'Backend', 'Mobile', 'DevOps', 'Testing', 'Security', 'Other']
    },
    {
      type: 'input',
      name: 'description',
      message: theme.accent('Description:')
    }
  ]);
  
  const skill = {
    id: `skill-${Date.now()}`,
    name: answers.name.trim(),
    category: answers.category.toLowerCase(),
    description: answers.description.trim(),
    createdAt: new Date().toISOString()
  };
  
  await saveSkill(skill);
  
  log.success(`Created skill: ${skill.name}`);
  log.info(`ID: ${skill.id}`);
  await pause();
}

// ═══════════════════════════════════════════════════════════
// PROMPTS
// ═══════════════════════════════════════════════════════════

async function listPrompts() {
  showHeader();
  console.log(theme.primary.bold('💬 My Prompts\n'));
  
  const prompts = await loadPrompts();
  
  if (prompts.length === 0) {
    log.warning('No prompts yet. Create one first!');
  } else {
    prompts.forEach((prompt, i) => {
      console.log(`${i + 1}. ${theme.accent(prompt.name)} ${theme.dim(`(${prompt.category})`)}`);
      console.log(`   ${theme.dim(prompt.description || 'No description')}`);
      console.log(`   ${theme.dim(`ID: ${prompt.id}`)}\n`);
    });
  }
  
  log.divider();
  await pause();
}

async function createPrompt() {
  showHeader();
  console.log(theme.primary.bold('➕ Create New Prompt\n'));
  
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: theme.accent('Prompt name:'),
      validate: (input) => input.trim().length > 0 || 'Name required'
    },
    {
      type: 'list',
      name: 'category',
      message: theme.accent('Category:'),
      choices: ['System Prompt', 'User Prompt', 'Template', 'Other']
    },
    {
      type: 'input',
      name: 'description',
      message: theme.accent('Description:')
    }
  ]);
  
  const prompt = {
    id: `prompt-${Date.now()}`,
    name: answers.name.trim(),
    category: answers.category.toLowerCase(),
    description: answers.description.trim(),
    createdAt: new Date().toISOString()
  };
  
  await savePrompt(prompt);
  
  log.success(`Created prompt: ${prompt.name}`);
  log.info(`ID: ${prompt.id}`);
  await pause();
}

// ═══════════════════════════════════════════════════════════
// ATTACHMENTS
// ═══════════════════════════════════════════════════════════

async function attachSkillToAgent() {
  showHeader();
  console.log(theme.primary.bold('🔗 Attach Skill to Agent\n'));
  
  const agents = await loadAgents();
  const skills = await loadSkills();
  
  if (agents.length === 0) {
    log.warning('No agents. Create one first!');
    await pause();
    return;
  }
  
  if (skills.length === 0) {
    log.warning('No skills. Create one first!');
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
    message: theme.accent('Select skills to attach:'),
    choices: skills.map(s => ({ name: `${s.name} (${s.category})`, value: s.id }))
  }]);
  
  if (skillIds.length === 0) {
    log.warning('No skills selected');
    await pause();
    return;
  }
  
  const agent = agents.find(a => a.id === agentId);
  for (const skillId of skillIds) {
    if (!agent.skills.includes(skillId)) {
      agent.skills.push(skillId);
    }
  }
  
  await saveAgent(agent);
  
  log.success(`Attached ${skillIds.length} skill(s) to ${agent.name}`);
  await pause();
}

async function attachPromptToAgent() {
  showHeader();
  console.log(theme.primary.bold('🔗 Attach Prompt to Agent\n'));
  
  const agents = await loadAgents();
  const prompts = await loadPrompts();
  
  if (agents.length === 0) {
    log.warning('No agents. Create one first!');
    await pause();
    return;
  }
  
  if (prompts.length === 0) {
    log.warning('No prompts. Create one first!');
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
    message: theme.accent('Select prompts to attach:'),
    choices: prompts.map(p => ({ name: `${p.name} (${p.category})`, value: p.id }))
  }]);
  
  if (promptIds.length === 0) {
    log.warning('No prompts selected');
    await pause();
    return;
  }
  
  const agent = agents.find(a => a.id === agentId);
  for (const promptId of promptIds) {
    if (!agent.prompts.includes(promptId)) {
      agent.prompts.push(promptId);
    }
  }
  
  await saveAgent(agent);
  
  log.success(`Attached ${promptIds.length} prompt(s) to ${agent.name}`);
  await pause();
}

// ═══════════════════════════════════════════════════════════
// MENUS
// ═══════════════════════════════════════════════════════════

async function showAgentsMenu() {
  showHeader();
  
  const { action } = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: theme.primary('🤖 Agents:'),
    choices: [
      { name: '➕ Create Agent', value: 'create' },
      { name: '📁 My Agents', value: 'list' },
      { name: '← Back', value: 'back' }
    ]
  }]);
  
  if (action === 'create') await createAgent();
  else if (action === 'list') await listAgents();
  
  if (action !== 'back') return await showAgentsMenu();
  return 'back';
}

async function showSkillsMenu() {
  showHeader();
  
  const { action } = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: theme.primary('🎯 Skills:'),
    choices: [
      { name: '➕ Create Skill', value: 'create' },
      { name: '📁 My Skills', value: 'list' },
      { name: '🔗 Attach to Agent', value: 'attach' },
      { name: '← Back', value: 'back' }
    ]
  }]);
  
  if (action === 'create') await createSkill();
  else if (action === 'list') await listSkills();
  else if (action === 'attach') await attachSkillToAgent();
  
  if (action !== 'back') return await showSkillsMenu();
  return 'back';
}

async function showPromptsMenu() {
  showHeader();
  
  const { action } = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: theme.primary('💬 Prompts:'),
    choices: [
      { name: '➕ Create Prompt', value: 'create' },
      { name: '📁 My Prompts', value: 'list' },
      { name: '🔗 Attach to Agent', value: 'attach' },
      { name: '← Back', value: 'back' }
    ]
  }]);
  
  if (action === 'create') await createPrompt();
  else if (action === 'list') await listPrompts();
  else if (action === 'attach') await attachPromptToAgent();
  
  if (action !== 'back') return await showPromptsMenu();
  return 'back';
}

async function mainMenu() {
  showHeader();
  
  const { category } = await inquirer.prompt([{
    type: 'list',
    name: 'category',
    message: theme.primary('Main Menu:'),
    choices: [
      { name: '🤖 Agents', value: 'agents' },
      { name: '🎯 Skills', value: 'skills' },
      { name: '💬 Prompts', value: 'prompts' },
      { name: theme.error('✕ Exit'), value: 'exit' }
    ]
  }]);
  
  if (category === 'exit') return 'exit';
  
  let action;
  switch (category) {
    case 'agents': action = await showAgentsMenu(); break;
    case 'skills': action = await showSkillsMenu(); break;
    case 'prompts': action = await showPromptsMenu(); break;
  }
  
  if (action === 'back') return await mainMenu();
  return action;
}

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════

async function main() {
  while (true) {
    const action = await mainMenu();
    if (action === 'exit') {
      console.log('\n' + theme.primary('🐶 Goodbye!\n'));
      break;
    }
  }
}

main().catch(console.error);
