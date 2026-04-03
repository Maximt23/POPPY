#!/usr/bin/env node

// ═══════════════════════════════════════════════════════════
// 🐶 POPPY ADMIN v2.0 - PROPER 3-LAYER NAVIGATION
// ═══════════════════════════════════════════════════════════

import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import inquirer from 'inquirer';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ═══════════════════════════════════════════════════════════
// 📁 PATHS & CONFIG
// ═══════════════════════════════════════════════════════════

const ROOT_DIR = process.cwd();
const DATA_DIR = path.join(ROOT_DIR, '.poppy');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const AGENTS_DIR = path.join(DATA_DIR, 'agents');
const SKILLS_DIR = path.join(DATA_DIR, 'skills');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

// ═══════════════════════════════════════════════════════════
// 🎨 THEME & UI
// ═══════════════════════════════════════════════════════════

const theme = {
  primary: (s) => `\x1b[36m${s}\x1b[0m`,    // Cyan
  secondary: (s) => `\x1b[35m${s}\x1b[0m`,  // Magenta
  accent: (s) => `\x1b[33m${s}\x1b[0m`,     // Yellow
  success: (s) => `\x1b[32m${s}\x1b[0m`,    // Green
  error: (s) => `\x1b[31m${s}\x1b[0m`,      // Red
  warning: (s) => `\x1b[33m${s}\x1b[0m`,   // Yellow
  info: (s) => `\x1b[34m${s}\x1b[0m`,      // Blue
  dim: (s) => `\x1b[90m${s}\x1b[0m`,       // Gray
};

const log = {
  title: (s) => console.log(`\n${theme.accent('═'.repeat(60))}\n  ${s}\n${theme.accent('═'.repeat(60))}`),
  success: (s) => console.log(`${theme.success('✓')} ${s}`),
  error: (s) => console.log(`${theme.error('✗')} ${s}`),
  warning: (s) => console.log(`${theme.warning('⚠')} ${s}`),
  info: (s) => console.log(`${theme.info('ℹ')} ${s}`),
  divider: () => console.log(theme.dim('─'.repeat(60))),
};

const POPPY_LOGO = `
  🐶 POPPY ADMIN v2.0
`;

function showHeader() {
  console.clear();
  console.log(POPPY_LOGO);
  log.divider();
}

async function pause() {
  await inquirer.prompt([{ type: 'input', name: 'continue', message: theme.dim('Press Enter to continue...') }]);
}

// ═══════════════════════════════════════════════════════════
// 💾 DATA OPERATIONS (The Black Box Layer)
// ═══════════════════════════════════════════════════════════

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(AGENTS_DIR, { recursive: true });
  await fs.mkdir(SKILLS_DIR, { recursive: true });
}

async function loadProjects() {
  try {
    const data = await fs.readFile(PROJECTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveProjects(projects) {
  await fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2));
}

async function loadAgents() {
  try {
    const files = await fs.readdir(AGENTS_DIR);
    const agents = [];
    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await fs.readFile(path.join(AGENTS_DIR, file), 'utf8');
        agents.push(JSON.parse(content));
      }
    }
    return agents;
  } catch {
    return [];
  }
}

async function saveAgent(agent) {
  const filePath = path.join(AGENTS_DIR, `${agent.id}.json`);
  await fs.writeFile(filePath, JSON.stringify(agent, null, 2));
}

async function loadSkills() {
  try {
    const files = await fs.readdir(SKILLS_DIR);
    const skills = [];
    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await fs.readFile(path.join(SKILLS_DIR, file), 'utf8');
        skills.push(JSON.parse(content));
      }
    }
    return skills;
  } catch {
    return [];
  }
}

async function saveSkill(skill) {
  const filePath = path.join(SKILLS_DIR, `${skill.id}.json`);
  await fs.writeFile(filePath, JSON.stringify(skill, null, 2));
}

// ═══════════════════════════════════════════════════════════
// 🎯 LAYER 1: MAIN CATEGORIES
// ═══════════════════════════════════════════════════════════

async function layer1MainMenu() {
  showHeader();
  
  const { category } = await inquirer.prompt([{
    type: 'list',
    name: 'category',
    message: theme.primary('🏠 MAIN MENU'),
    choices: [
      { name: theme.accent('▶  Launch AI Engine'), value: 'launch' },
      { name: theme.secondary('📁 Projects'), value: 'projects' },
      { name: theme.primary('🤖 Agents'), value: 'agents' },
      { name: theme.primary('🎯 Skills'), value: 'skills' },
      { name: theme.info('⚙️  System'), value: 'system' },
      new inquirer.Separator(),
      { name: theme.error('✕ Exit'), value: 'exit' }
    ],
    pageSize: 10
  }]);

  if (category === 'exit') {
    console.log('\n' + theme.success('Goodbye! 🐶'));
    process.exit(0);
  }

  return category;
}

// ═══════════════════════════════════════════════════════════
// 🎯 LAYER 2: CATEGORY ACTIONS
// ═══════════════════════════════════════════════════════════

async function layer2LaunchMenu() {
  showHeader();
  
  const { action } = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: theme.accent('▶ LAUNCH AI ENGINE'),
    choices: [
      { name: theme.accent('🐶 Launch Code Puppy'), value: 'launch-code-puppy' },
      { name: theme.secondary('🤖 Launch with Agent'), value: 'launch-with-agent' },
      new inquirer.Separator(),
      { name: theme.dim('← Back to Main'), value: 'back' }
    ],
    pageSize: 10
  }]);

  return action;
}

async function layer2ProjectsMenu() {
  showHeader();
  
  const { action } = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: theme.accent('📁 PROJECTS'),
    choices: [
      { name: theme.accent('📋 List All Projects'), value: 'list-projects' },
      { name: theme.success('➕ Create New Project'), value: 'create-project' },
      { name: theme.secondary('📥 Import Project'), value: 'import-project' },
      { name: theme.warning('🗑️  Delete Project'), value: 'delete-project' },
      new inquirer.Separator(),
      { name: theme.dim('← Back to Main'), value: 'back' }
    ],
    pageSize: 10
  }]);

  return action;
}

async function layer2AgentsMenu() {
  showHeader();
  
  const { action } = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: theme.accent('🤖 AGENTS'),
    choices: [
      { name: theme.accent('📋 List My Agents'), value: 'list-agents' },
      { name: theme.success('➕ Create New Agent'), value: 'create-agent' },
      { name: theme.secondary('🎯 Attach Skills'), value: 'attach-skills' },
      { name: theme.warning('🗑️  Delete Agent'), value: 'delete-agent' },
      new inquirer.Separator(),
      { name: theme.dim('← Back to Main'), value: 'back' }
    ],
    pageSize: 10
  }]);

  return action;
}

async function layer2SkillsMenu() {
  showHeader();
  
  const { action } = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: theme.accent('🎯 SKILLS'),
    choices: [
      { name: theme.accent('📋 List My Skills'), value: 'list-skills' },
      { name: theme.success('➕ Create New Skill'), value: 'create-skill' },
      { name: theme.secondary('🔗 Attach to Agent'), value: 'attach-skill' },
      { name: theme.warning('🗑️  Delete Skill'), value: 'delete-skill' },
      new inquirer.Separator(),
      { name: theme.dim('← Back to Main'), value: 'back' }
    ],
    pageSize: 10
  }]);

  return action;
}

async function layer2SystemMenu() {
  showHeader();
  
  const { action } = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: theme.accent('⚙️  SYSTEM'),
    choices: [
      { name: theme.accent('🔐 API Keys'), value: 'api-keys' },
      { name: theme.secondary('🔀 Git Settings'), value: 'git-settings' },
      { name: theme.info('📊 System Info'), value: 'system-info' },
      new inquirer.Separator(),
      { name: theme.dim('← Back to Main'), value: 'back' }
    ],
    pageSize: 10
  }]);

  return action;
}

// ═══════════════════════════════════════════════════════════
// 🎯 LAYER 3: ACTUAL EXECUTION WITH INTERACTIVE LISTS
// ═══════════════════════════════════════════════════════════

// PROJECTS - Layer 3

async function layer3ListProjects() {
  showHeader();
  log.title('📋 YOUR PROJECTS');
  
  const projects = await loadProjects();
  
  if (projects.length === 0) {
    log.warning('No projects found.');
    log.info('Create a project first!');
    await pause();
    return;
  }
  
  const choices = projects.map(p => ({
    name: `  ${p.name} ${theme.dim(`(${p.type})`)}`,
    value: p.id,
    short: p.name
  }));
  
  choices.push(new inquirer.Separator());
  choices.push({ name: theme.dim('← Back'), value: 'back' });
  
  const { projectId } = await inquirer.prompt([{
    type: 'list',
    name: 'projectId',
    message: theme.accent('Select a project to manage:'),
    choices,
    pageSize: 15
  }]);
  
  if (projectId === 'back') return;
  
  // Go to Layer 4 - Project Details
  await layer4ProjectDetails(projectId);
}

async function layer3DeleteProject() {
  showHeader();
  log.title('🗑️  DELETE PROJECT');
  
  const projects = await loadProjects();
  
  if (projects.length === 0) {
    log.warning('No projects to delete.');
    await pause();
    return;
  }
  
  const { projectId } = await inquirer.prompt([{
    type: 'list',
    name: 'projectId',
    message: theme.warning('Select project to DELETE:'),
    choices: projects.map(p => ({ name: p.name, value: p.id })),
    pageSize: 15
  }]);
  
  const project = projects.find(p => p.id === projectId);
  
  const { confirm } = await inquirer.prompt([{
    type: 'confirm',
    name: 'confirm',
    message: theme.error(`Are you sure you want to delete "${project.name}"?`),
    default: false
  }]);
  
  if (confirm) {
    const updatedProjects = projects.filter(p => p.id !== projectId);
    await saveProjects(updatedProjects);
    log.success(`Project "${project.name}" deleted.`);
  } else {
    log.info('Deletion cancelled.');
  }
  
  await pause();
}

async function layer3ImportProject() {
  showHeader();
  log.title('📥 IMPORT PROJECT');
  
  const { source } = await inquirer.prompt([{
    type: 'list',
    name: 'source',
    message: theme.accent('Import from:'),
    choices: [
      { name: '📁 Local Directory', value: 'local' },
      { name: '🔗 Git Repository', value: 'git' },
      { name: theme.dim('← Back'), value: 'back' }
    ]
  }]);
  
  if (source === 'back') return;
  
  if (source === 'local') {
    const { dirPath } = await inquirer.prompt([{
      type: 'input',
      name: 'dirPath',
      message: theme.accent('Enter full directory path:'),
      validate: (input) => input.trim().length > 0 || 'Path is required'
    }]);
    
    try {
      const stats = await fs.stat(dirPath);
      if (!stats.isDirectory()) {
        log.error('Path is not a directory!');
        await pause();
        return;
      }
      
      // Read directory contents
      const files = await fs.readdir(dirPath);
      
      const { projectName } = await inquirer.prompt([{
        type: 'input',
        name: 'projectName',
        message: theme.accent('Project name:'),
        default: path.basename(dirPath)
      }]);
      
      // Detect project type
      let projectType = 'unknown';
      if (files.includes('package.json')) projectType = 'node';
      else if (files.includes('requirements.txt')) projectType = 'python';
      else if (files.includes('Cargo.toml')) projectType = 'rust';
      
      // Save to POPPY
      const projects = await loadProjects();
      const newProject = {
        id: `proj-${Date.now()}`,
        name: projectName,
        type: projectType,
        path: dirPath,
        imported: true,
        created: new Date().toISOString()
      };
      
      projects.push(newProject);
      await saveProjects(projects);
      
      log.success(`✓ Imported "${projectName}" from ${dirPath}`);
      log.info(`Detected type: ${projectType}`);
      log.info(`Files found: ${files.length}`);
      
    } catch (error) {
      log.error(`Import failed: ${error.message}`);
    }
  }
  
  if (source === 'git') {
    const { repoUrl } = await inquirer.prompt([{
      type: 'input',
      name: 'repoUrl',
      message: theme.accent('Git repository URL:'),
      validate: (input) => input.trim().length > 0 || 'URL is required'
    }]);
    
    const { projectName } = await inquirer.prompt([{
      type: 'input',
      name: 'projectName',
      message: theme.accent('Project name:'),
      default: path.basename(repoUrl, '.git')
    }]);
    
    try {
      // Clone the repo
      const targetDir = path.join(ROOT_DIR, 'projects', projectName);
      await fs.mkdir(path.dirname(targetDir), { recursive: true });
      
      log.info(`Cloning ${repoUrl}...`);
      await execAsync(`git clone "${repoUrl}" "${targetDir}"`);
      
      // Save to POPPY
      const projects = await loadProjects();
      const newProject = {
        id: `proj-${Date.now()}`,
        name: projectName,
        type: 'git-imported',
        path: targetDir,
        repo: repoUrl,
        created: new Date().toISOString()
      };
      
      projects.push(newProject);
      await saveProjects(projects);
      
      log.success(`✓ Cloned "${projectName}" from Git`);
      
    } catch (error) {
      log.error(`Git clone failed: ${error.message}`);
    }
  }
  
  await pause();
}

// AGENTS - Layer 3

async function layer3ListAgents() {
  showHeader();
  log.title('🤖 YOUR AGENTS');
  
  const agents = await loadAgents();
  
  if (agents.length === 0) {
    log.warning('No agents found.');
    log.info('Create an agent first!');
    await pause();
    return;
  }
  
  const choices = agents.map(a => ({
    name: `  ${a.name} ${theme.dim(`(${a.role})`)}`,
    value: a.id,
    short: a.name
  }));
  
  choices.push(new inquirer.Separator());
  choices.push({ name: theme.dim('← Back'), value: 'back' });
  
  const { agentId } = await inquirer.prompt([{
    type: 'list',
    name: 'agentId',
    message: theme.accent('Select an agent to view/edit:'),
    choices,
    pageSize: 15
  }]);
  
  if (agentId === 'back') return;
  
  // Go to Layer 4 - Agent Details
  await layer4AgentDetails(agentId);
}

async function layer3DeleteAgent() {
  showHeader();
  log.title('🗑️  DELETE AGENT');
  
  const agents = await loadAgents();
  
  if (agents.length === 0) {
    log.warning('No agents to delete.');
    await pause();
    return;
  }
  
  const { agentId } = await inquirer.prompt([{
    type: 'list',
    name: 'agentId',
    message: theme.warning('Select agent to DELETE:'),
    choices: agents.map(a => ({ name: a.name, value: a.id })),
    pageSize: 15
  }]);
  
  const agent = agents.find(a => a.id === agentId);
  
  const { confirm } = await inquirer.prompt([{
    type: 'confirm',
    name: 'confirm',
    message: theme.error(`Delete agent "${agent.name}"?`),
    default: false
  }]);
  
  if (confirm) {
    await fs.unlink(path.join(AGENTS_DIR, `${agentId}.json`));
    log.success(`Agent "${agent.name}" deleted.`);
  } else {
    log.info('Deletion cancelled.');
  }
  
  await pause();
}

async function layer3AttachSkillsToAgent() {
  showHeader();
  log.title('🔗 ATTACH SKILLS TO AGENT');
  
  const agents = await loadAgents();
  const skills = await loadSkills();
  
  if (agents.length === 0) {
    log.warning('No agents available.');
    await pause();
    return;
  }
  
  if (skills.length === 0) {
    log.warning('No skills available. Create skills first!');
    await pause();
    return;
  }
  
  // Layer 3a: Select Agent
  const { agentId } = await inquirer.prompt([{
    type: 'list',
    name: 'agentId',
    message: theme.accent('Select agent:'),
    choices: agents.map(a => ({ name: a.name, value: a.id })),
    pageSize: 10
  }]);
  
  const agent = agents.find(a => a.id === agentId);
  
  // Layer 3b: Select Skills to Attach
  const { selectedSkills } = await inquirer.prompt([{
    type: 'checkbox',
    name: 'selectedSkills',
    message: theme.accent(`Attach skills to "${agent.name}":`),
    choices: skills.map(s => ({
      name: s.name,
      value: s.id,
      checked: agent.skills?.includes(s.id)
    })),
    pageSize: 15
  }]);
  
  // Update agent
  agent.skills = selectedSkills;
  await saveAgent(agent);
  
  log.success(`✓ Attached ${selectedSkills.length} skill(s) to "${agent.name}"`);
  await pause();
}

// SKILLS - Layer 3

async function layer3ListSkills() {
  showHeader();
  log.title('🎯 YOUR SKILLS');
  
  const skills = await loadSkills();
  
  if (skills.length === 0) {
    log.warning('No skills found.');
    log.info('Create a skill first!');
    await pause();
    return;
  }
  
  const choices = skills.map(s => ({
    name: `  ${s.name} ${theme.dim(`(${s.category})`)}`,
    value: s.id,
    short: s.name
  }));
  
  choices.push(new inquirer.Separator());
  choices.push({ name: theme.dim('← Back'), value: 'back' });
  
  const { skillId } = await inquirer.prompt([{
    type: 'list',
    name: 'skillId',
    message: theme.accent('Select a skill to view:'),
    choices,
    pageSize: 15
  }]);
  
  if (skillId === 'back') return;
  
  // Go to Layer 4 - Skill Details
  await layer4SkillDetails(skillId);
}

async function layer3DeleteSkill() {
  showHeader();
  log.title('🗑️  DELETE SKILL');
  
  const skills = await loadSkills();
  
  if (skills.length === 0) {
    log.warning('No skills to delete.');
    await pause();
    return;
  }
  
  const { skillId } = await inquirer.prompt([{
    type: 'list',
    name: 'skillId',
    message: theme.warning('Select skill to DELETE:'),
    choices: skills.map(s => ({ name: s.name, value: s.id })),
    pageSize: 15
  }]);
  
  const skill = skills.find(s => s.id === skillId);
  
  const { confirm } = await inquirer.prompt([{
    type: 'confirm',
    name: 'confirm',
    message: theme.error(`Delete skill "${skill.name}"?`),
    default: false
  }]);
  
  if (confirm) {
    await fs.unlink(path.join(SKILLS_DIR, `${skillId}.json`));
    log.success(`Skill "${skill.name}" deleted.`);
  } else {
    log.info('Deletion cancelled.');
  }
  
  await pause();
}

// ═══════════════════════════════════════════════════════════
// 🎯 LAYER 4: DETAILS & CONFIGURATION
// ═══════════════════════════════════════════════════════════

async function layer4ProjectDetails(projectId) {
  const projects = await loadProjects();
  const project = projects.find(p => p.id === projectId);
  
  if (!project) {
    log.error('Project not found!');
    await pause();
    return;
  }
  
  showHeader();
  log.title(`📁 PROJECT: ${project.name}`);
  
  console.log(`  Name: ${theme.accent(project.name)}`);
  console.log(`  Type: ${project.type}`);
  console.log(`  Path: ${project.path}`);
  console.log(`  Created: ${project.created}`);
  if (project.imported) console.log(`  Source: ${theme.info('Imported')}`);
  if (project.repo) console.log(`  Repository: ${project.repo}`);
  
  log.divider();
  
  const { action } = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: theme.accent('Project Actions:'),
    choices: [
      { name: '🚀 Launch with Code Puppy', value: 'launch' },
      { name: '📂 Open in File Explorer', value: 'open-folder' },
      { name: '🤖 Assign Agent', value: 'assign-agent' },
      { name: '✏️  Rename', value: 'rename' },
      { name: theme.dim('← Back to Projects'), value: 'back' }
    ]
  }]);
  
  switch (action) {
    case 'launch':
      await launchProjectWithCodePuppy(project);
      break;
    case 'open-folder':
      await openFolder(project.path);
      break;
    case 'assign-agent':
      await assignAgentToProject(project);
      break;
    case 'rename':
      await renameProject(project);
      break;
  }
}

async function layer4AgentDetails(agentId) {
  const agents = await loadAgents();
  const agent = agents.find(a => a.id === agentId);
  
  if (!agent) {
    log.error('Agent not found!');
    await pause();
    return;
  }
  
  showHeader();
  log.title(`🤖 AGENT: ${agent.name}`);
  
  console.log(`  Name: ${theme.accent(agent.name)}`);
  console.log(`  Role: ${agent.role}`);
  console.log(`  Skills: ${agent.skills?.length || 0} attached`);
  console.log(`  Created: ${agent.created}`);
  
  log.divider();
  
  const { action } = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: theme.accent('Agent Actions:'),
    choices: [
      { name: '🚀 Launch with Code Puppy', value: 'launch' },
      { name: '🎯 Manage Skills', value: 'skills' },
      { name: '✏️  Edit Agent', value: 'edit' },
      { name: theme.dim('← Back to Agents'), value: 'back' }
    ]
  }]);
  
  switch (action) {
    case 'launch':
      await launchAgentWithCodePuppy(agent);
      break;
    case 'skills':
      await layer3AttachSkillsToAgent();
      break;
    case 'edit':
      await editAgent(agent);
      break;
  }
}

async function layer4SkillDetails(skillId) {
  const skills = await loadSkills();
  const skill = skills.find(s => s.id === skillId);
  
  if (!skill) {
    log.error('Skill not found!');
    await pause();
    return;
  }
  
  showHeader();
  log.title(`🎯 SKILL: ${skill.name}`);
  
  console.log(`  Name: ${theme.accent(skill.name)}`);
  console.log(`  Category: ${skill.category}`);
  console.log(`  Description: ${skill.description || 'No description'}`);
  console.log(`  Created: ${skill.created}`);
  
  log.divider();
  
  // Read skill content
  const skillPath = path.join(SKILLS_DIR, `${skillId}.json`);
  const content = await fs.readFile(skillPath, 'utf8');
  const skillData = JSON.parse(content);
  
  if (skillData.instructions) {
    console.log(theme.dim('Instructions preview:'));
    console.log(theme.dim(skillData.instructions.substring(0, 200) + '...'));
  }
  
  await pause();
}

// ═══════════════════════════════════════════════════════════
// 🎯 LAYER 5: CREATION & DEEP CONFIG
// ═══════════════════════════════════════════════════════════

async function layer5CreateProject() {
  showHeader();
  log.title('➕ CREATE NEW PROJECT');
  
  // Layer 5a: Basic Info
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: theme.accent('Project name:'),
      validate: (input) => input.trim().length > 0 || 'Name is required'
    },
    {
      type: 'list',
      name: 'type',
      message: theme.accent('Project type:'),
      choices: [
        { name: '🔷 Node.js / Express', value: 'node-express' },
        { name: '⚛️ React Web App', value: 'react-web' },
        { name: '📱 React Native', value: 'react-native' },
        { name: '🐍 Python', value: 'python' },
        { name: '📄 Static Site', value: 'static' },
        { name: '🔧 Other', value: 'other' }
      ]
    },
    {
      type: 'input',
      name: 'description',
      message: theme.accent('Description:'),
      default: 'A new project'
    }
  ]);
  
  // Layer 5b: Location
  const { location } = await inquirer.prompt([{
    type: 'input',
    name: 'location',
    message: theme.accent('Project location:'),
    default: path.join(ROOT_DIR, 'projects', answers.name)
  }]);
  
  // Create directory
  try {
    await fs.mkdir(location, { recursive: true });
    
    // Create based on type
    switch (answers.type) {
      case 'node-express':
        await createNodeProject(location, answers);
        break;
      case 'react-web':
        await createReactProject(location, answers);
        break;
      case 'python':
        await createPythonProject(location, answers);
        break;
      default:
        await createGenericProject(location, answers);
    }
    
    // Save to POPPY
    const projects = await loadProjects();
    const newProject = {
      id: `proj-${Date.now()}`,
      name: answers.name,
      type: answers.type,
      description: answers.description,
      path: location,
      created: new Date().toISOString()
    };
    
    projects.push(newProject);
    await saveProjects(projects);
    
    log.success(`✓ Created project "${answers.name}" at ${location}`);
    
    // Ask to open
    const { openNow } = await inquirer.prompt([{
      type: 'confirm',
      name: 'openNow',
      message: theme.accent('Open project in Code Puppy now?'),
      default: true
    }]);
    
    if (openNow) {
      await launchProjectWithCodePuppy(newProject);
    }
    
  } catch (error) {
    log.error(`Failed to create project: ${error.message}`);
  }
  
  await pause();
}

async function layer5CreateAgent() {
  showHeader();
  log.title('➕ CREATE NEW AGENT');
  
  // Layer 5a: Basic Info
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: theme.accent('Agent name:'),
      validate: (input) => input.trim().length > 0 || 'Name is required'
    },
    {
      type: 'list',
      name: 'role',
      message: theme.accent('Agent role:'),
      choices: [
        { name: '👨‍💻 Full-Stack Developer', value: 'fullstack' },
        { name: '🎨 Frontend Specialist', value: 'frontend' },
        { name: '⚙️ Backend Developer', value: 'backend' },
        { name: '📱 Mobile Developer', value: 'mobile' },
        { name: '🔍 Code Reviewer', value: 'reviewer' },
        { name: '📊 DevOps Engineer', value: 'devops' },
        { name: '✏️ Technical Writer', value: 'writer' }
      ]
    },
    {
      type: 'input',
      name: 'description',
      message: theme.accent('Specialization:'),
      default: 'General purpose coding assistant'
    }
  ]);
  
  // Layer 5b: Attach Skills
  const skills = await loadSkills();
  let selectedSkills = [];
  
  if (skills.length > 0) {
    const { attachSkills } = await inquirer.prompt([{
      type: 'confirm',
      name: 'attachSkills',
      message: theme.accent('Attach skills to this agent?'),
      default: true
    }]);
    
    if (attachSkills) {
      const { skillsToAttach } = await inquirer.prompt([{
        type: 'checkbox',
        name: 'skillsToAttach',
        message: theme.accent('Select skills:'),
        choices: skills.map(s => ({ name: s.name, value: s.id })),
        pageSize: 10
      }]);
      selectedSkills = skillsToAttach;
    }
  }
  
  // Layer 5c: Custom Instructions
  const { customInstructions } = await inquirer.prompt([{
    type: 'editor',
    name: 'customInstructions',
    message: theme.accent('Custom instructions (opens editor):'),
    default: `You are ${answers.name}, a ${answers.role} specialist.\n\nYour responsibilities:\n- Write clean, maintainable code\n- Follow best practices\n- Explain your reasoning\n\nTone: Professional but friendly`
  }]);
  
  // Create agent
  const agent = {
    id: `agent-${Date.now()}`,
    name: answers.name,
    role: answers.role,
    description: answers.description,
    instructions: customInstructions,
    skills: selectedSkills,
    created: new Date().toISOString()
  };
  
  await saveAgent(agent);
  
  log.success(`✓ Created agent "${answers.name}"`);
  log.info(`Role: ${answers.role}`);
  log.info(`Skills attached: ${selectedSkills.length}`);
  
  // Ask to launch
  const { launchNow } = await inquirer.prompt([{
    type: 'confirm',
    name: 'launchNow',
    message: theme.accent('Launch with this agent now?'),
    default: false
  }]);
  
  if (launchNow) {
    await launchAgentWithCodePuppy(agent);
  }
  
  await pause();
}

async function layer5CreateSkill() {
  showHeader();
  log.title('➕ CREATE NEW SKILL');
  
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: theme.accent('Skill name:'),
      validate: (input) => input.trim().length > 0 || 'Name is required'
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
  
  // Layer 5b: Skill Content
  const { instructions } = await inquirer.prompt([{
    type: 'editor',
    name: 'instructions',
    message: theme.accent('Skill instructions (opens editor):'),
    default: `# ${answers.name}\n\n## Overview\n${answers.description}\n\n## Best Practices\n- Practice 1\n- Practice 2\n\n## Code Patterns\n\`\`\`\n// Example code here\n\`\`\``
  }]);
  
  // Create skill
  const skill = {
    id: `skill-${Date.now()}`,
    name: answers.name,
    category: answers.category.toLowerCase(),
    description: answers.description,
    instructions,
    created: new Date().toISOString()
  };
  
  await saveSkill(skill);
  
  log.success(`✓ Created skill "${answers.name}"`);
  log.info(`Category: ${answers.category}`);
  
  await pause();
}

// ═══════════════════════════════════════════════════════════
// 🔧 ACTION FUNCTIONS (The Black Box)
// ═══════════════════════════════════════════════════════════

async function launchProjectWithCodePuppy(project) {
  log.info(`Launching Code Puppy with project: ${project.name}`);
  
  try {
    const { spawn } = require('child_process');
    
    // Check if code-puppy exists
    try {
      await execAsync('where code-puppy');
    } catch {
      log.error('Code Puppy not found!');
      log.info('Install with: npm install -g code-puppy');
      await pause();
      return;
    }
    
    // Launch in project directory
    const child = spawn('code-puppy', [], {
      cwd: project.path,
      stdio: 'inherit',
      shell: true
    });
    
    log.success('Code Puppy launched!');
    log.info(`Working directory: ${project.path}`);
    
  } catch (error) {
    log.error(`Launch failed: ${error.message}`);
    await pause();
  }
}

async function launchAgentWithCodePuppy(agent) {
  log.info(`Launching Code Puppy with agent: ${agent.name}`);
  
  try {
    const { spawn } = require('child_process');
    
    // Create temporary context file
    const contextFile = path.join(DATA_DIR, `context-${agent.id}.json`);
    await fs.writeFile(contextFile, JSON.stringify({
      agent: agent.name,
      role: agent.role,
      instructions: agent.instructions,
      skills: agent.skills || [],
      launched: new Date().toISOString()
    }, null, 2));
    
    log.info(`Agent context saved to: ${contextFile}`);
    
    // Launch code-puppy
    const child = spawn('code-puppy', ['--context', contextFile], {
      stdio: 'inherit',
      shell: true
    });
    
    log.success('Code Puppy launched with agent context!');
    
  } catch (error) {
    log.error(`Launch failed: ${error.message}`);
    await pause();
  }
}

async function openFolder(folderPath) {
  try {
    await execAsync(`explorer "${folderPath}"`);
    log.success('Opened in File Explorer');
  } catch (error) {
    log.error(`Could not open folder: ${error.message}`);
  }
  await pause();
}

async function assignAgentToProject(project) {
  const agents = await loadAgents();
  
  if (agents.length === 0) {
    log.warning('No agents available.');
    await pause();
    return;
  }
  
  const { agentId } = await inquirer.prompt([{
    type: 'list',
    name: 'agentId',
    message: theme.accent(`Assign agent to "${project.name}":`),
    choices: agents.map(a => ({ name: a.name, value: a.id }))
  }]);
  
  const agent = agents.find(a => a.id === agentId);
  
  // Save assignment
  project.agentId = agentId;
  const projects = await loadProjects();
  const idx = projects.findIndex(p => p.id === project.id);
  if (idx !== -1) {
    projects[idx] = project;
    await saveProjects(projects);
  }
  
  log.success(`✓ Assigned "${agent.name}" to project "${project.name}"`);
  await pause();
}

async function renameProject(project) {
  const { newName } = await inquirer.prompt([{
    type: 'input',
    name: 'newName',
    message: theme.accent('New project name:'),
    default: project.name
  }]);
  
  if (newName !== project.name) {
    project.name = newName;
    const projects = await loadProjects();
    const idx = projects.findIndex(p => p.id === project.id);
    if (idx !== -1) {
      projects[idx] = project;
      await saveProjects(projects);
    }
    log.success(`✓ Renamed to "${newName}"`);
  }
  
  await pause();
}

async function editAgent(agent) {
  const { instructions } = await inquirer.prompt([{
    type: 'editor',
    name: 'instructions',
    message: theme.accent('Edit agent instructions:'),
    default: agent.instructions || ''
  }]);
  
  agent.instructions = instructions;
  await saveAgent(agent);
  
  log.success('✓ Agent updated');
  await pause();
}

// ═══════════════════════════════════════════════════════════
// 🏗️ PROJECT TEMPLATES
// ═══════════════════════════════════════════════════════════

async function createNodeProject(dir, answers) {
  const packageJson = {
    name: answers.name,
    version: '1.0.0',
    description: answers.description,
    main: 'index.js',
    scripts: {
      start: 'node index.js',
      dev: 'nodemon index.js'
    },
    dependencies: {
      express: '^4.18.0'
    }
  };
  
  await fs.writeFile(
    path.join(dir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
  
  const indexJs = `const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to ${answers.name}!' });
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
`;
  
  await fs.writeFile(path.join(dir, 'index.js'), indexJs);
  
  const readme = `# ${answers.name}\n\n${answers.description}\n\n## Getting Started\n\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\``;
  
  await fs.writeFile(path.join(dir, 'README.md'), readme);
}

async function createReactProject(dir, answers) {
  const packageJson = {
    name: answers.name,
    version: '1.0.0',
    private: true,
    dependencies: {
      react: '^18.0.0',
      'react-dom': '^18.0.0',
      'react-scripts': '5.0.1'
    },
    scripts: {
      start: 'react-scripts start',
      build: 'react-scripts build'
    }
  };
  
  await fs.writeFile(
    path.join(dir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
  
  await fs.mkdir(path.join(dir, 'src'), { recursive: true });
  await fs.mkdir(path.join(dir, 'public'), { recursive: true });
  
  const appJs = `import React from 'react';

function App() {
  return (
    <div className="App">
      <h1>${answers.name}</h1>
      <p>${answers.description}</p>
    </div>
  );
}

export default App;
`;
  
  await fs.writeFile(path.join(dir, 'src', 'App.js'), appJs);
  
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${answers.name}</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>`;
  
  await fs.writeFile(path.join(dir, 'public', 'index.html'), indexHtml);
}

async function createPythonProject(dir, answers) {
  const mainPy = `# ${answers.name}
# ${answers.description}

def main():
    print(f"Welcome to {answers.name}!")

if __name__ == "__main__":
    main()
`;
  
  await fs.writeFile(path.join(dir, 'main.py'), mainPy);
  
  const requirements = `# ${answers.name} requirements
# Add your dependencies here
`;
  
  await fs.writeFile(path.join(dir, 'requirements.txt'), requirements);
  
  const readme = `# ${answers.name}\n\n${answers.description}\n\n## Getting Started\n\n\`\`\`bash\npip install -r requirements.txt\npython main.py\n\`\`\``;
  
  await fs.writeFile(path.join(dir, 'README.md'), readme);
}

async function createGenericProject(dir, answers) {
  const readme = `# ${answers.name}\n\n${answers.description}\n\nCreated with POPPY Admin\n`;
  
  await fs.writeFile(path.join(dir, 'README.md'), readme);
}

// ═══════════════════════════════════════════════════════════
// 🎬 MAIN NAVIGATION LOOP
// ═══════════════════════════════════════════════════════════

async function main() {
  await ensureDataDir();
  
  while (true) {
    // Layer 1: Main Categories
    const category = await layer1MainMenu();
    
    if (category === 'exit') break;
    
    let layer2Action;
    
    // Layer 2: Category Actions
    switch (category) {
      case 'launch':
        layer2Action = await layer2LaunchMenu();
        break;
      case 'projects':
        layer2Action = await layer2ProjectsMenu();
        break;
      case 'agents':
        layer2Action = await layer2AgentsMenu();
        break;
      case 'skills':
        layer2Action = await layer2SkillsMenu();
        break;
      case 'system':
        layer2Action = await layer2SystemMenu();
        break;
    }
    
    if (layer2Action === 'back') continue;
    
    // Layer 3+: Execute Actions
    switch (layer2Action) {
      // Launch
      case 'launch-code-puppy':
        await launchAgentWithCodePuppy({ 
          name: 'Default', 
          role: 'assistant',
          instructions: 'You are a helpful coding assistant.' 
        });
        break;
      case 'launch-with-agent':
        await layer3ListAgents();
        break;
        
      // Projects
      case 'list-projects':
        await layer3ListProjects();
        break;
      case 'create-project':
        await layer5CreateProject();
        break;
      case 'import-project':
        await layer3ImportProject();
        break;
      case 'delete-project':
        await layer3DeleteProject();
        break;
        
      // Agents
      case 'list-agents':
        await layer3ListAgents();
        break;
      case 'create-agent':
        await layer5CreateAgent();
        break;
      case 'attach-skills':
        await layer3AttachSkillsToAgent();
        break;
      case 'delete-agent':
        await layer3DeleteAgent();
        break;
        
      // Skills
      case 'list-skills':
        await layer3ListSkills();
        break;
      case 'create-skill':
        await layer5CreateSkill();
        break;
      case 'attach-skill':
        await layer3AttachSkillsToAgent();
        break;
      case 'delete-skill':
        await layer3DeleteSkill();
        break;
        
      // System (placeholder)
      case 'api-keys':
        log.info('API Keys management - coming soon');
        await pause();
        break;
      case 'git-settings':
        log.info('Git settings - coming soon');
        await pause();
        break;
      case 'system-info':
        showHeader();
        log.title('📊 SYSTEM INFO');
        console.log(`  POPPY Admin v2.0`);
        console.log(`  Node: ${process.version}`);
        console.log(`  Platform: ${process.platform}`);
        console.log(`  Data Directory: ${DATA_DIR}`);
        const projects = await loadProjects();
        const agents = await loadAgents();
        const skills = await loadSkills();
        console.log(`  Projects: ${projects.length}`);
        console.log(`  Agents: ${agents.length}`);
        console.log(`  Skills: ${skills.length}`);
        await pause();
        break;
    }
  }
}

// Start
main().catch(err => {
  console.error(theme.error('Fatal Error:'), err);
  process.exit(1);
});
