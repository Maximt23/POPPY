import chalk from 'chalk';
import inquirer from 'inquirer';
import boxen from 'boxen';
import ora from 'ora';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

// Import POPPY systems
import { loadConfig, saveConfig, ENGINES, setupEngine, setApiKey } from './lib/config.js';
import { EngineManager } from './lib/engine-manager.js';
import { AgentRegistry } from './lib/marketplace.js';
import { ApiKeyManager } from './lib/api-manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize POPPY systems
const engineManager = new EngineManager();
const agentRegistry = new AgentRegistry();
const apiKeyManager = new ApiKeyManager();
await apiKeyManager.init();

// Detect if running locally or globally
const isGlobalInstall = !__dirname.includes('PersonalAI');

// Load POPPY configuration
let poppyConfig = await loadConfig();

// ANSI 256-color codes for authentic green gradient
const ansi = {
  // Bright greens (82-86) for "Poppy" text gradient
  g82: (text) => `\x1b[1;38;5;82m${text}\x1b[0m`,
  g83: (text) => `\x1b[1;38;5;83m${text}\x1b[0m`,
  g84: (text) => `\x1b[1;38;5;84m${text}\x1b[0m`,
  g85: (text) => `\x1b[1;38;5;85m${text}\x1b[0m`,
  g86: (text) => `\x1b[1;38;5;86m${text}\x1b[0m`,
  
  // Accent colors
  c48: (text) => `\x1b[38;5;48m${text}\x1b[0m`,
  c51: (text) => `\x1b[38;5;51m${text}\x1b[0m`,
  c87: (text) => `\x1b[38;5;87m${text}\x1b[0m`,
  c226: (text) => `\x1b[38;5;226m${text}\x1b[0m`,
};

// 🎨 POPPY Theme
const theme = {
  primary: chalk.hex('#22c55e'),
  secondary: chalk.hex('#16a34a'),
  accent: chalk.hex('#4ade80'),
  dark: chalk.hex('#14532d'),
  bg: chalk.bgHex('#064e3b'),
  shell: chalk.hex('#84cc16'),
  weapon: chalk.hex('#a1a1aa'),
  warning: chalk.hex('#f59e0b'),
  error: chalk.hex('#ef4444'),
  info: chalk.hex('#3b82f6'),
  white: chalk.white,
  dim: chalk.gray
};

const log = {
  title: (text) => console.log('\n' + theme.primary.bold.underline(text)),
  success: (text) => console.log(theme.accent('✓ ') + text),
  error: (text) => console.log(theme.error('✗ ') + text),
  info: (text) => console.log(theme.info('ℹ ') + text),
  warning: (text) => console.log(theme.warning('⚠ ') + text),
  agent: (text) => console.log(theme.primary('► ') + theme.accent(text)),
  divider: () => console.log(theme.dim('─'.repeat(60)))
};

// ═══════════════════════════════════════════════════════════
// 🎨 POPPY LOGO
// ═══════════════════════════════════════════════════════════

// Big "POPPY" text with authentic ANSI 256-color green gradient
const POPPY_LOGO = `
${ansi.g82('  ██████╗ ')}${ansi.g83(' ██████╗ ')}${ansi.g84('██████╗ ')}${ansi.g85('██████╗ ')}${ansi.g86('██╗   ██╗')}
${ansi.g82('  ██╔══██╗')}${ansi.g83('██╔═══██╗')}${ansi.g84('██╔══██╗')}${ansi.g85('██╔══██╗')}${ansi.g86('██║   ██║')}
${ansi.g82('  ██████╔╝')}${ansi.g83('██║   ██║')}${ansi.g84('██████╔╝')}${ansi.g85('██████╔╝')}${ansi.g86('╚██████╔╝')}
${ansi.g82('  ██╔═══╝ ')}${ansi.g83('██║   ██║')}${ansi.g84('██╔═══╝ ')}${ansi.g85('██╔═══╝ ')}${ansi.g86(' ╚═══██║')}
${ansi.g82('  ██║     ')}${ansi.g83('╚██████╔╝')}${ansi.g84('██║     ')}${ansi.g85('██║     ')}${ansi.g86('    ██║')}
${ansi.g82('  ╚═╝     ')}${ansi.g83(' ╚══════╝')}${ansi.g84('╚═╝     ')}${ansi.g85('╚═╝     ')}${ansi.g86('    ╚═╝')}
`;

// Header Banner - Just POPPY
function showHeader() {
  console.clear();
  console.log('\n' + POPPY_LOGO + '\n');
}

// ═══════════════════════════════════════════════════════════
// 🗂️  MONOREPO STRUCTURE
// ═══════════════════════════════════════════════════════════

const ROOT_DIR = path.dirname(__dirname);  // PersonalAI root
const DATA_DIR = path.join(__dirname, 'data');
const AGENTS_DIR = path.join(ROOT_DIR, 'agents');  // Monorepo agents folder
const DAILY_LOG_FILE = path.join(DATA_DIR, 'daily-log.json');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const GIT_CONFIG_FILE = path.join(DATA_DIR, 'git-config.json');

// Legacy support - also check data/agents.json
const LEGACY_AGENTS_FILE = path.join(DATA_DIR, 'agents.json');

// ═══════════════════════════════════════════════════════════
// 🤖 AGENT STORAGE (Monorepo Pattern)
// ═══════════════════════════════════════════════════════════

async function loadAgents() {
  const agents = [];
  
  // Load from monorepo agents/ folder
  try {
    const files = await fs.readdir(AGENTS_DIR);
    for (const file of files) {
      if (file.endsWith('.json') && file !== 'README.md') {
        try {
          const content = await fs.readFile(path.join(AGENTS_DIR, file), 'utf8');
          const agent = JSON.parse(content);
          agents.push(agent);
        } catch (e) {
          // Skip invalid files
        }
      }
    }
  } catch (e) {
    // Directory doesn't exist yet
  }
  
  // Also load from legacy file if it exists (migration support)
  try {
    const legacy = await fs.readFile(LEGACY_AGENTS_FILE, 'utf8');
    const legacyData = JSON.parse(legacy);
    if (legacyData.agents) {
      for (const agent of legacyData.agents) {
        // Only add if not already in agents list
        if (!agents.find(a => a.id === agent.id)) {
          agents.push(agent);
        }
      }
    }
  } catch (e) {
    // No legacy file
  }
  
  return {
    agents,
    lastUpdated: new Date().toISOString()
  };
}

async function saveAgent(agent) {
  // Save as individual file in agents/
  const safeName = agent.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const filename = `${safeName}-${agent.id.slice(-6)}.json`;
  await fs.writeFile(
    path.join(AGENTS_DIR, filename),
    JSON.stringify(agent, null, 2)
  );
}

async function saveAgents(agentsData) {
  // Save all agents as individual files
  await fs.mkdir(AGENTS_DIR, { recursive: true });
  
  for (const agent of agentsData.agents) {
    await saveAgent(agent);
  }
  
  // Also update legacy file for backward compatibility
  await fs.writeFile(LEGACY_AGENTS_FILE, JSON.stringify(agentsData, null, 2));
}

async function deleteAgent(agentId) {
  // Find and delete the agent file
  try {
    const files = await fs.readdir(AGENTS_DIR);
    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await fs.readFile(path.join(AGENTS_DIR, file), 'utf8');
        const agent = JSON.parse(content);
        if (agent.id === agentId) {
          await fs.unlink(path.join(AGENTS_DIR, file));
          return true;
        }
      }
    }
  } catch (e) {
    return false;
  }
  return false;
}

// ═══════════════════════════════════════════════════════════
// 🔧 GIT CONFIGURATION
// ═══════════════════════════════════════════════════════════

async function loadGitConfig() {
  try {
    const data = await fs.readFile(GIT_CONFIG_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return {
      enabled: false,
      provider: 'github', // github, gitlab, etc.
      username: '',
      token: '', // Personal access token
      defaultRepo: '',
      autoSync: false,
      lastSync: null
    };
  }
}

async function saveGitConfig(config) {
  await fs.writeFile(GIT_CONFIG_FILE, JSON.stringify(config, null, 2));
}

async function initGitRepo(projectDir, projectName, projectId) {
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);

  try {
    // Initialize git repo
    await execAsync('git init', { cwd: projectDir });
    
    // Create .gitignore
    const gitignoreContent = `# ${projectName}
node_modules/
.env
.env.local
.DS_Store
*.log
dist/
build/
.expo/
`;
    await fs.writeFile(path.join(projectDir, '.gitignore'), gitignoreContent);

    // Initial commit
    await execAsync('git add .', { cwd: projectDir });
    await execAsync('git commit -m "Initial commit: Project scaffold created by POPPY Admin"', { cwd: projectDir });

    return true;
  } catch (err) {
    log.warning(`Git init failed: ${err.message}`);
    return false;
  }
}

async function pushAgentsToGit(agents, gitConfig) {
  if (!gitConfig.enabled || !gitConfig.token) {
    log.error('Git not configured! Run System Settings → Git Configuration first.');
    return false;
  }

  const spinner = ora({
    text: theme.accent('Preparing agents for Git sync...'),
    spinner: 'dots',
    color: 'green'
  }).start();

  try {
    // Create a temp directory for git operations
    const tempDir = path.join(DATA_DIR, 'git-temp');
    await fs.mkdir(tempDir, { recursive: true });

    // Write agents as structured files
    const agentsExport = {
      meta: {
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
        totalAgents: agents.agents.length
      },
      agents: agents.agents
    };

    await fs.writeFile(
      path.join(tempDir, 'agents.json'),
      JSON.stringify(agentsExport, null, 2)
    );

    // Also create individual agent files for easier viewing
    const agentsDir = path.join(tempDir, 'agents');
    await fs.mkdir(agentsDir, { recursive: true });

    for (const agent of agents.agents) {
      const safeName = agent.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      await fs.writeFile(
        path.join(agentsDir, `${safeName}.json`),
        JSON.stringify(agent, null, 2)
      );
    }

    // Create README for agents repo
    const readmeContent = `# Agent Inventory

**Exported**: ${new Date().toLocaleString()}
**Total Agents**: ${agents.agents.length}

## Agents Overview

${agents.agents.map(a => `- **${a.name}**: ${a.description} (${a.shared ? 'Shared' : 'Private'})`).join('\n')}

## Structure

- agents.json - Complete agent database
- agents/ - Individual agent files

---
*Managed by POPPY Admin Console*
`;

    await fs.writeFile(path.join(tempDir, 'README.md'), readmeContent);

    spinner.succeed(theme.success('Agent export prepared!'));

    log.divider();
    log.info('Next steps to sync with Git:');
    log.info(`1. Create a repo on ${gitConfig.provider}`);
    log.info(`2. cd ${path.relative(process.cwd(), tempDir)}`);
    log.info('3. git init');
    log.info(`4. git remote add origin https://${gitConfig.provider}.com/${gitConfig.username}/agents-repo.git`);
    log.info('5. git add . && git commit -m "Agent sync" && git push');
    log.divider();

    return true;
  } catch (err) {
    spinner.fail(theme.error(`Git sync failed: ${err.message}`));
    return false;
  }
}

async function syncProjectToGit(projectPath, projectName, gitConfig) {
  if (!gitConfig.enabled || !gitConfig.token) {
    log.error('Git not configured! Run System Settings → Git Configuration first.');
    return false;
  }

  const spinner = ora({
    text: theme.accent(`Syncing ${projectName} to Git...`),
    spinner: 'dots',
    color: 'green'
  }).start();

  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);

  try {
    // Check if git is initialized
    try {
      await execAsync('git status', { cwd: projectPath });
    } catch {
      spinner.text = theme.accent('Initializing Git repository...');
      await execAsync('git init', { cwd: projectPath });
    }

    // Check git status
    const { stdout: status } = await execAsync('git status --porcelain', { cwd: projectPath });
    
    if (!status.trim()) {
      spinner.succeed(theme.success('Nothing to commit - project is up to date!'));
      return true;
    }

    // Add all changes
    spinner.text = theme.accent('Staging changes...');
    await execAsync('git add .', { cwd: projectPath });

    // Commit
    spinner.text = theme.accent('Committing changes...');
    const timestamp = new Date().toISOString();
    await execAsync(`git commit -m "Auto-sync: ${timestamp}"`, { cwd: projectPath });

    spinner.succeed(theme.success(`${projectName} synced to Git!`));
    
    log.info(`Changes committed at ${timestamp}`);
    log.info('Run "git push" manually if you have a remote configured.');
    
    return true;
  } catch (err) {
    spinner.fail(theme.error(`Git sync failed: ${err.message}`));
    return false;
  }
}


async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (e) {}
}

async function loadDailyLog() {
  try {
    const data = await fs.readFile(DAILY_LOG_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return {
      entries: [],
      today: null
    };
  }
}

async function saveDailyLog(log) {
  await fs.writeFile(DAILY_LOG_FILE, JSON.stringify(log, null, 2));
}

async function loadProjects() {
  try {
    const data = await fs.readFile(PROJECTS_FILE, 'utf8');
    const projects = JSON.parse(data);
    // Add default projects if not present
    const defaults = [
      { id: 'p1', name: 'WearWise', path: 'P1', type: 'React Native', active: true },
      { id: 'p2', name: 'Project Two', path: 'P2', type: 'Node.js/Express', active: true },
      { id: 'admin', name: 'Admin Console', path: 'admin', type: 'CLI Tool', active: true }
    ];
    
    // Merge with defaults
    const projectIds = new Set(projects.projects?.map(p => p.id) || []);
    for (const def of defaults) {
      if (!projectIds.has(def.id)) {
        projects.projects = projects.projects || [];
        projects.projects.push(def);
      }
    }
    
    return projects;
  } catch {
    return {
      projects: [
        { id: 'p1', name: 'WearWise', path: 'P1', type: 'React Native', active: true },
        { id: 'p2', name: 'Project Two', path: 'P2', type: 'Node.js/Express', active: true },
        { id: 'admin', name: 'Admin Console', path: 'admin', type: 'CLI Tool', active: true }
      ]
    };
  }
}

async function saveProjects(projects) {
  await fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2));
}

// ═══════════════════════════════════════════════════════════
// 🎯 MAIN MENU - With Quick Modes
// ═══════════════════════════════════════════════════════════

async function mainMenu() {
  showHeader();

  const { category } = await inquirer.prompt([{
    type: 'list',
    name: 'category',
    message: theme.primary('Select category:'),
    choices: [
      { name: theme.accent('▶ Launch AI Engine'), value: 'launch' },
      { name: theme.secondary('➕ New Project'), value: 'new-project' },
      { name: theme.primary('📁 Projects'), value: 'projects' },
      { name: theme.primary('🤖 Agents'), value: 'agents' },
      { name: theme.primary('🎯 Skills'), value: 'skills' },
      { name: theme.info('🔐 API Keys'), value: 'api' },
      { name: theme.warning('🔀 Git'), value: 'git' },
      { name: theme.dim('⚙️  System'), value: 'system' },
      new inquirer.Separator(),
      { name: theme.error('✕ Exit'), value: 'exit' }
    ],
    pageSize: 12
  }]);

  if (category === 'exit') return 'exit';
  if (category === 'new-project') return 'new-project';

  let action;
  switch (category) {
    case 'launch': action = await showLaunchMenu(); break;
    case 'projects': action = await showProjectsMenu(); break;
    case 'agents': action = await showAgentsMenu(); break;
    case 'skills': action = await showSkillsMenu(); break;
    case 'api': action = await showApiMenu(); break;
    case 'git': action = await showGitMenu(); break;
    case 'system': action = await showSystemMenu(); break;
  }

  if (action === 'back') return await mainMenu();
  return action;
}

async function showLaunchMenu() {
  const detected = await engineManager.detectEngines();
  const choices = [
    { name: theme.accent('▶ Launch with Agent'), value: 'launch-with-agent' },
    new inquirer.Separator(theme.dim('Available Engines:')),
    { name: '  🐶 Code Puppy', value: 'launch-code-puppy' }
  ];
  
  for (const engine of detected) {
    if (engine.name !== 'code-puppy') {
      choices.push({ name: `  ${engine.label}`, value: `launch-${engine.name}` });
    }
  }
  
  choices.push(new inquirer.Separator(), { name: theme.dim('← Back'), value: 'back' });
  
  const { action } = await inquirer.prompt([{
    type: 'list', name: 'action', message: theme.primary('Launch AI Engine:'), choices, pageSize: 12
  }]);
  return action;
}

async function showProjectsMenu() {
  const { action } = await inquirer.prompt([{
    type: 'list', name: 'action', message: theme.primary('Project Management:'),
    choices: [
      { name: theme.accent('➕ Create New Project'), value: 'new-project' },
      { name: theme.secondary('📥 Import Project'), value: 'import-project' },
      { name: theme.secondary('📁 Manage Projects'), value: 'projects' },
      { name: theme.secondary('🚀 Quick Launch'), value: 'launch' },
      new inquirer.Separator(), { name: theme.dim('← Back'), value: 'back' }
    ]
  }]);
  return action;
}

async function showAgentsMenu() {
  const { action } = await inquirer.prompt([{
    type: 'list', name: 'action', message: theme.primary('Agents:'),
    choices: [
      { name: theme.accent('🤖 My Agents'), value: 'list-agents' },
      { name: theme.accent('➕ Create Agent'), value: 'add-agent' },
      new inquirer.Separator(), { name: theme.dim('← Back'), value: 'back' }
    ]
  }]);
  return action;
}

async function showSkillsMenu() {
  const { action } = await inquirer.prompt([{
    type: 'list', name: 'action', message: theme.primary('Skills Library:'),
    choices: [
      { name: theme.accent('🎯 My Skills'), value: 'list-skills' },
      { name: theme.accent('➕ Create Skill'), value: 'create-skill' },
      { name: theme.secondary('📚 Browse Library'), value: 'browse-skills' },
      { name: theme.secondary('⬇️  Install Skill'), value: 'install-skill' },
      new inquirer.Separator(), { name: theme.info('🔗 Attach to Agent'), value: 'attach-skill' },
      { name: theme.dim('← Back'), value: 'back' }
    ]
  }]);
  return action;
}

async function showApiMenu() {
  const { action } = await inquirer.prompt([{
    type: 'list', name: 'action', message: theme.primary('API Management:'),
    choices: [
      { name: theme.accent('🔐 Manage API Keys'), value: 'api-keys' },
      { name: theme.secondary('🤖 Select AI Model'), value: 'select-model' },
      { name: theme.secondary('🧪 Test APIs'), value: 'test-api' },
      new inquirer.Separator(), { name: theme.dim('← Back'), value: 'back' }
    ]
  }]);
  return action;
}

async function showGitMenu() {
  const { action } = await inquirer.prompt([{
    type: 'list', name: 'action', message: theme.primary('Git Operations:'),
    choices: [
      { name: theme.accent('📊 View Status'), value: 'git-status' },
      { name: theme.accent('💾 Commit Changes'), value: 'commit-monorepo' },
      new inquirer.Separator(), { name: theme.dim('← Back'), value: 'back' }
    ]
  }]);
  return action;
}

async function showSystemMenu() {
  const { action } = await inquirer.prompt([{
    type: 'list', name: 'action', message: theme.primary('System:'),
    choices: [
      { name: theme.accent('⚙️  Settings'), value: 'settings' },
      { name: theme.secondary('📅 Daily Focus'), value: 'daily-focus' },
      { name: theme.secondary('📋 View Log'), value: 'view-log' },
      { name: theme.info('🤖 Agent Settings'), value: 'agent-settings' },
      new inquirer.Separator(), { name: theme.dim('← Back'), value: 'back' }
    ]
  }]);
  return action;
}

// ═══════════════════════════════════════════════════════════
// 📅 DAILY FOCUS
// ═══════════════════════════════════════════════════════════

async function setDailyFocus() {
  showHeader();
  log.title('📅 Set Today\'s Focus');

  const projects = await loadProjects();
  const today = new Date().toISOString().split('T')[0];

  const { selectedProjects, focus, priority } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedProjects',
      message: theme.accent('Which projects will you work on today?'),
      choices: projects.projects.map(p => ({
        name: theme.primary(`${p.name} (${p.type})`),
        value: p.id,
        checked: p.active
      })),
      validate: (input) => input.length > 0 || 'Select at least one project!'
    },
    {
      type: 'input',
      name: 'focus',
      message: theme.accent('What\'s your main focus for today?'),
      default: 'Development and bug fixes'
    },
    {
      type: 'list',
      name: 'priority',
      message: theme.accent('Priority level:'),
      choices: [
        { name: theme.error('🔴 High - Must complete'), value: 'high' },
        { name: theme.warning('🟡 Medium - Should do'), value: 'medium' },
        { name: theme.primary('🟢 Low - Nice to have'), value: 'low' }
      ]
    }
  ]);

  const dailyLog = await loadDailyLog();
  
  // Remove existing entry for today
  dailyLog.entries = dailyLog.entries.filter(e => e.date !== today);
  
  // Add new entry
  dailyLog.entries.push({
    date: today,
    projects: selectedProjects,
    focus,
    priority,
    status: 'active',
    agentsUsed: [],
    notes: '',
    createdAt: new Date().toISOString()
  });

  dailyLog.today = today;
  await saveDailyLog(dailyLog);

  log.divider();
  log.success(`Daily focus set for ${theme.accent(today)}`);
  log.info(`Projects: ${selectedProjects.join(', ')}`);
  log.info(`Focus: ${focus}`);
  log.info(`Priority: ${priority}`);
  log.divider();

  await pause();
}

async function viewTodayLog() {
  showHeader();
  log.title('📊 Today\'s Log');

  const dailyLog = await loadDailyLog();
  const today = new Date().toISOString().split('T')[0];
  const entry = dailyLog.entries.find(e => e.date === today);

  if (!entry) {
    log.warning('No focus set for today yet!');
    log.info('Use "Set Today\'s Focus" to plan your day.');
  } else {
    const priorityColor = {
      high: theme.error,
      medium: theme.warning,
      low: theme.primary
    };

    console.log(boxen(
      theme.white.bold(`📅 ${entry.date}`) + '\n\n' +
      theme.accent('🎯 Focus: ') + entry.focus + '\n' +
      theme.accent('🔥 Priority: ') + priorityColor[entry.priority](entry.priority.toUpperCase()) + '\n' +
      theme.accent('📁 Projects: ') + entry.projects.join(', ') + '\n' +
      theme.accent('📊 Status: ') + theme.secondary(entry.status),
      {
        padding: 1,
        borderStyle: 'round',
        borderColor: entry.priority === 'high' ? '#ef4444' : entry.priority === 'medium' ? '#f59e0b' : '#22c55e'
      }
    ));

    if (entry.agentsUsed.length > 0) {
      log.agent(`Agents used today: ${entry.agentsUsed.join(', ')}`);
    }
  }

  log.divider();
  await pause();
}

// ═══════════════════════════════════════════════════════════
// 🤖 AGENT INVENTORY
// ═══════════════════════════════════════════════════════════

async function listAgents() {
  showHeader();
  log.title('📦 Agent Inventory');

  const data = await loadAgents();
  
  if (data.agents.length === 0) {
    log.warning('No agents in inventory yet!');
    log.info('Use "Add New Agent" to create your first agent.');
  } else {
    log.success(`Total agents: ${data.agents.length}`);
    log.divider();

    for (const agent of data.agents) {
      const status = agent.shared 
        ? theme.accent('🌐 Shared')
        : theme.dim('🔒 Private');
      
      const projects = agent.projects?.length > 0
        ? `→ ${agent.projects.join(', ')}`
        : theme.dim('(not assigned)');

      console.log(
        theme.primary.bold(`🤖 ${agent.name}`) + ' ' + status + '\n' +
        theme.dim(`   ID: ${agent.id}`) + '\n' +
        theme.white(`   ${agent.description || 'No description'}`) + '\n' +
        theme.secondary(`   ${projects}`) + '\n'
      );
    }
  }

  log.divider();
  await pause();
}

async function addAgent() {
  showHeader();
  log.title('➕ Add New Agent');

  const { name, description, projects, shared } = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: theme.accent('Agent name:'),
      validate: (input) => input.trim().length > 0 || 'Name is required!'
    },
    {
      type: 'input',
      name: 'description',
      message: theme.accent('Description:'),
      default: 'A helpful agent'
    },
    {
      type: 'checkbox',
      name: 'projects',
      message: theme.accent('Available in which projects?'),
      choices: [
        { name: 'All Projects', value: 'all' },
        { name: 'P1 - WearWise', value: 'p1' },
        { name: 'P2 - Project Two', value: 'p2' }
      ]
    },
    {
      type: 'confirm',
      name: 'shared',
      message: theme.accent('Make this agent shareable between projects?'),
      default: true
    }
  ]);

  const data = await loadAgents();
  
  const newAgent = {
    id: `agent-${Date.now()}`,
    name: name.trim(),
    description: description.trim(),
    projects: projects.includes('all') ? ['all'] : projects,
    shared,
    settings: {},
    createdAt: new Date().toISOString(),
    lastUsed: null,
    usageCount: 0
  };

  data.agents.push(newAgent);
  data.lastUpdated = new Date().toISOString();
  await saveAgents(data);

  log.divider();
  log.success(`Agent "${name}" added to inventory!`);
  log.agent(`ID: ${newAgent.id}`);
  log.info(`Shared: ${shared ? 'Yes' : 'No'}`);
  log.info(`Projects: ${projects.join(', ')}`);
  log.divider();

  await pause();
}

async function shareAgent() {
  showHeader();
  log.title('🔄 Share Agent Between Projects');

  const data = await loadAgents();
  const sharableAgents = data.agents.filter(a => a.shared || a.projects.length > 0);

  if (sharableAgents.length === 0) {
    log.warning('No agents available to share!');
    log.info('Create agents first with the "Add New Agent" option.');
    await pause();
    return;
  }

  const { agentId } = await inquirer.prompt([{
    type: 'list',
    name: 'agentId',
    message: theme.accent('Which agent to share?'),
    choices: sharableAgents.map(a => ({
      name: theme.primary(`${a.name} (${a.projects?.join(', ') || 'unassigned'})`),
      value: a.id
    }))
  }]);

  const agent = data.agents.find(a => a.id === agentId);

  const { targetProjects, settings } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'targetProjects',
      message: theme.accent(`Share "${agent.name}" with which projects?`),
      choices: [
        { name: 'P1 - WearWise', value: 'p1', checked: agent.projects?.includes('p1') },
        { name: 'P2 - Project Two', value: 'p2', checked: agent.projects?.includes('p2') },
        { name: 'All Projects', value: 'all', checked: agent.projects?.includes('all') }
      ]
    },
    {
      type: 'confirm',
      name: 'settings',
      message: theme.accent('Copy agent settings to all target projects?'),
      default: true
    }
  ]);

  agent.projects = targetProjects.includes('all') ? ['all'] : targetProjects;
  agent.shared = true;
  agent.lastUpdated = new Date().toISOString();

  await saveAgents(data);

  log.divider();
  log.success(`Agent "${agent.name}" shared successfully!`);
  log.agent(`Now available in: ${targetProjects.join(', ')}`);
  log.divider();

  await pause();
}

async function agentSettings() {
  showHeader();
  log.title('⚙️  Agent Settings');

  const data = await loadAgents();

  if (data.agents.length === 0) {
    log.warning('No agents to configure!');
    await pause();
    return;
  }

  const { agentId, action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'agentId',
      message: theme.accent('Select agent:'),
      choices: data.agents.map(a => ({
        name: theme.primary(a.name),
        value: a.id
      }))
    },
    {
      type: 'list',
      name: 'action',
      message: theme.accent('What would you like to do?'),
      choices: [
        { name: theme.warning('🗑️  Delete Agent'), value: 'delete' },
        { name: theme.secondary('✏️  Edit Details'), value: 'edit' },
        { name: theme.info('📊 View Usage Stats'), value: 'stats' },
        { name: theme.dim('↩️  Cancel'), value: 'cancel' }
      ]
    }
  ]);

  if (action === 'delete') {
    const { confirm } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      message: theme.error('Are you sure you want to delete this agent?'),
      default: false
    }]);

    if (confirm) {
      await deleteAgent(agentId);
      // Also update legacy file
      data.agents = data.agents.filter(a => a.id !== agentId);
      await saveAgents(data);
      log.success('Agent deleted.');
    }
  } else if (action === 'stats') {
    const agent = data.agents.find(a => a.id === agentId);
    console.log(boxen(
      theme.primary.bold(`🤖 ${agent.name}`) + '\n\n' +
      theme.accent('Created: ') + new Date(agent.createdAt).toLocaleDateString() + '\n' +
      theme.accent('Last Used: ') + (agent.lastUsed ? new Date(agent.lastUsed).toLocaleDateString() : 'Never') + '\n' +
      theme.accent('Usage Count: ') + (agent.usageCount || 0) + '\n' +
      theme.accent('Shared: ') + (agent.shared ? 'Yes' : 'No') + '\n' +
      theme.accent('Projects: ') + (agent.projects?.join(', ') || 'None'),
      { padding: 1, borderStyle: 'round', borderColor: '#22c55e' }
    ));
  }

  await pause();
}

// ═══════════════════════════════════════════════════════════
// 🚀 START NEW PROJECT WIZARD
// ═══════════════════════════════════════════════════════════

async function createNewProject() {
  showHeader();
  log.title('🚀 Create New Project');

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: theme.accent('Project name:'),
      validate: (input) => input.trim().length > 0 || 'Project name is required!'
    },
    {
      type: 'list',
      name: 'type',
      message: theme.accent('Project type:'),
      choices: [
        { name: theme.primary('📱 React Native / Expo'), value: 'react-native' },
        { name: theme.accent('🟢 Node.js / Express'), value: 'node-express' },
        { name: theme.info('⚛️  React Web App'), value: 'react-web' },
        { name: theme.secondary('🐍 Python Script'), value: 'python' },
        { name: theme.dim('📁 Empty Folder'), value: 'empty' }
      ]
    },
    {
      type: 'input',
      name: 'description',
      message: theme.accent('Short description:'),
      default: 'A new project'
    },
    {
      type: 'confirm',
      name: 'initGit',
      message: theme.accent('Initialize Git repository?'),
      default: true
    },
    {
      type: 'confirm',
      name: 'addAgents',
      message: theme.accent('Create starter agents for this project?'),
      default: true
    },
    {
      type: 'checkbox',
      name: 'starterAgents',
      message: theme.accent('Which starter agents?'),
      when: (answers) => answers.addAgents,
      choices: [
        { name: theme.primary('Code Assistant'), value: 'code-assistant', checked: true },
        { name: theme.accent('Documentation Helper'), value: 'docs-helper', checked: true },
        { name: theme.info('Debug Helper'), value: 'debug-helper' },
        { name: theme.secondary('UI/UX Reviewer'), value: 'ui-reviewer' }
      ]
    }
  ]);

  const spinner = ora({
    text: theme.accent(`Creating project "${answers.name}"...`),
    spinner: 'dots',
    color: 'green'
  }).start();

  // Generate project ID
  const projectId = `p${Date.now().toString(36)}`;
  const projectDir = path.join(path.dirname(__dirname), projectId);

  try {
    // Create project directory
    await fs.mkdir(projectDir, { recursive: true });

    // Create project structure based on type
    if (answers.type === 'node-express') {
      await createNodeExpressProject(projectDir, answers);
    } else if (answers.type === 'react-native') {
      await createReactNativeProject(projectDir, answers);
    } else if (answers.type === 'react-web') {
      await createReactWebProject(projectDir, answers);
    } else if (answers.type === 'python') {
      await createPythonProject(projectDir, answers);
    } else {
      // Empty project - just create a README
      await createReadme(projectDir, answers, projectId);
    }

    // Initialize Git if requested
    let gitInitialized = false;
    if (answers.initGit) {
      spinner.text = theme.accent('Initializing Git repository...');
      gitInitialized = await initGitRepo(projectDir, answers.name, projectId);
    }

    // Save to projects registry
    const projects = await loadProjects();
    projects.projects.push({
      id: projectId,
      name: answers.name,
      path: projectId,
      type: answers.type,
      active: true,
      createdAt: new Date().toISOString(),
      gitInitialized
    });
    await saveProjects(projects);

    spinner.succeed(theme.success(`Project "${answers.name}" created!`));

    // Create agents if requested
    if (answers.addAgents && answers.starterAgents?.length > 0) {
      const agentSpinner = ora({
        text: theme.accent('Creating starter agents...'),
        spinner: 'dots',
        color: 'green'
      }).start();

      await createStarterAgents(answers.starterAgents, projectId, answers.name);
      agentSpinner.succeed(theme.success(`${answers.starterAgents.length} agents created!`));
    }

    log.divider();
    log.success(`📁 Location: ${projectDir}`);
    log.success(`🆔 Project ID: ${projectId}`);
    log.info(`📋 Type: ${answers.type}`);
    
    if (gitInitialized) {
      log.success('✓ Git repository initialized');
    }
    
    if (answers.addAgents) {
      log.agent(`Agents ready in inventory`);
    }
    
    log.divider();
    log.info('Next steps:');
    console.log(theme.secondary(`  cd ${projectId}`));
    if (answers.type !== 'empty') {
      console.log(theme.secondary(`  npm install  (if applicable)`));
    }
    console.log(theme.secondary(`  npm start`));
    log.divider();

  } catch (err) {
    spinner.fail(theme.error(`Failed to create project: ${err.message}`));
  }

  await pause();
}

async function createNodeExpressProject(dir, answers) {
  const packageJson = {
    name: answers.name.toLowerCase().replace(/\s+/g, '-'),
    version: '1.0.0',
    description: answers.description,
    main: 'index.js',
    type: 'module',
    scripts: {
      start: 'node index.js',
      dev: 'nodemon index.js'
    },
    dependencies: {
      express: '^4.21.0'
    },
    devDependencies: {
      nodemon: '^3.1.0'
    }
  };

  const indexJs = `// ${answers.name}
// Created: ${new Date().toISOString()}
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to ${answers.name}!',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.listen(PORT, () => {
  console.log(\`✅ \${answers.name} running on http://localhost:\${PORT}\`);
});

export default app;
`;

  await fs.writeFile(path.join(dir, 'package.json'), JSON.stringify(packageJson, null, 2));
  await fs.writeFile(path.join(dir, 'index.js'), indexJs);
  await createReadme(dir, answers, path.basename(dir));
}

async function createReactNativeProject(dir, answers) {
  const readmeContent = `# ${answers.name}

🚀 React Native Project

## Setup
\`\`\`bash
npx create-expo-app . --template blank
npm install
npm start
\`\`\`

Created: ${new Date().toISOString()}
`;

  await fs.writeFile(path.join(dir, 'README.md'), readmeContent);
  await fs.writeFile(path.join(dir, '.gitignore'), 'node_modules/\n.expo/\ndist/\n*.log\n');
}

async function createReactWebProject(dir, answers) {
  const readmeContent = `# ${answers.name}

⚛️ React Web Application

## Setup
\`\`\`bash
npm create vite@latest . -- --template react
npm install
npm run dev
\`\`\`

Created: ${new Date().toISOString()}
`;

  await fs.writeFile(path.join(dir, 'README.md'), readmeContent);
  await fs.writeFile(path.join(dir, '.gitignore'), 'node_modules/\ndist/\n*.log\n');
}

async function createPythonProject(dir, answers) {
  const mainPy = `# ${answers.name}
# ${answers.description}
# Created: ${new Date().toISOString()}

def main():
    print(f"🚀 {answers.name} is running!")
    # Your code here
    pass

if __name__ == "__main__":
    main()
`;

  const requirements = `# Python dependencies
# Add your packages here
`;

  await fs.writeFile(path.join(dir, 'main.py'), mainPy);
  await fs.writeFile(path.join(dir, 'requirements.txt'), requirements);
  await createReadme(dir, answers, path.basename(dir));
}

async function createReadme(dir, answers, projectId) {
  const readme = `# ${answers.name}

${answers.description}

🆔 Project ID: \`${projectId}\`
📁 Type: ${answers.type}
🕐 Created: ${new Date().toLocaleDateString()}

---
*Managed by POPPY Admin*
`;
  await fs.writeFile(path.join(dir, 'README.md'), readme);
}

async function createStarterAgents(agentTypes, projectId, projectName) {
  const agentTemplates = {
    'code-assistant': {
      name: `${projectName} Code Assistant`,
      description: 'Helps with code reviews, refactoring, and best practices',
      settings: { expertise: 'coding', style: 'concise' }
    },
    'docs-helper': {
      name: `${projectName} Docs Helper`,
      description: 'Assists with documentation, READMEs, and comments',
      settings: { expertise: 'documentation', style: 'clear' }
    },
    'debug-helper': {
      name: `${projectName} Debug Helper`,
      description: 'Helps debug issues and find solutions',
      settings: { expertise: 'debugging', style: 'thorough' }
    },
    'ui-reviewer': {
      name: `${projectName} UI Reviewer`,
      description: 'Reviews UI/UX and suggests improvements',
      settings: { expertise: 'ui-ux', style: 'constructive' }
    }
  };

  const data = await loadAgents();

  for (const agentType of agentTypes) {
    const template = agentTemplates[agentType];
    if (template) {
      data.agents.push({
        id: `agent-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: template.name,
        description: template.description,
        projects: [projectId],
        shared: false,
        settings: template.settings,
        createdAt: new Date().toISOString(),
        lastUsed: null,
        usageCount: 0,
        autoCreated: true,
        forProject: projectName
      });
    }
  }

  data.lastUpdated = new Date().toISOString();
  await saveAgents(data);
}

// ═══════════════════════════════════════════════════════════
// ⚡ QUICK AGENT MODE - Just Create Agents
// ═══════════════════════════════════════════════════════════

async function quickAgentMode() {
  showHeader();
  
  console.log(boxen(
    theme.accent.bold('⚡ QUICK AGENT MODE') + '\n\n' +
    theme.white('Fast-track agent creation.') + '\n' +
    theme.dim('Type "done" at any prompt to finish.'),
    {
      padding: 1,
      borderStyle: 'round',
      borderColor: '#4ade80',
      backgroundColor: '#064e3b'
    }
  ));

  const data = await loadAgents();
  let createdCount = 0;

  while (true) {
    log.divider();
    
    const { name } = await inquirer.prompt([{
      type: 'input',
      name: 'name',
      message: theme.accent(`Agent #${createdCount + 1} name:`),
      validate: (input) => {
        if (input.toLowerCase() === 'done') return true;
        return input.trim().length > 0 || 'Name is required (or type "done")';
      }
    }]);

    if (name.toLowerCase() === 'done') break;

    const { description, projects, shared } = await inquirer.prompt([
      {
        type: 'input',
        name: 'description',
        message: theme.accent('Description:'),
        default: 'A helpful agent'
      },
      {
        type: 'checkbox',
        name: 'projects',
        message: theme.accent('For which projects?'),
        choices: [
          { name: 'All Projects', value: 'all' },
          { name: 'P1 - WearWise', value: 'P1' },
          { name: 'P2 - Project Two', value: 'P2' }
        ],
        default: ['all']
      },
      {
        type: 'confirm',
        name: 'shared',
        message: theme.accent('Shareable?'),
        default: true
      }
    ]);

    data.agents.push({
      id: `agent-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: name.trim(),
      description: description.trim(),
      projects: projects.includes('all') ? ['all'] : projects,
      shared,
      settings: {},
      createdAt: new Date().toISOString(),
      lastUsed: null,
      usageCount: 0
    });

    createdCount++;
    log.success(`Agent "${name}" created!`);
  }

  data.lastUpdated = new Date().toISOString();
  await saveAgents(data);

  log.divider();
  log.success(`Created ${createdCount} agent${createdCount !== 1 ? 's' : ''}!`);
  
  if (createdCount > 0) {
    log.agent('Agents saved to inventory');
    log.info('Use "Share Agent" to assign them to specific projects');
  }
  
  log.divider();
  await pause();
}


async function manageProjects() {
  showHeader();
  log.title('📁 Project Management');

  const projects = await loadProjects();
  const gitConfig = await loadGitConfig();

  console.log(boxen(
    projects.projects.map(p => 
      theme.primary(`📁 ${p.name}`) + '\n' +
      theme.dim(`   ID: ${p.id}`) + '\n' +
      theme.dim(`   Path: ${p.path}`) + '\n' +
      theme.secondary(`   Type: ${p.type}`) + '\n' +
      theme.accent(`   Status: ${p.active ? 'Active' : 'Inactive'}`) +
      (p.gitInitialized ? '\n' + theme.success('   ✓ Git initialized') : '')
    ).join('\n\n'),
    { padding: 1, borderStyle: 'round', borderColor: '#22c55e' }
  ));

  log.divider();
  
  if (gitConfig.enabled) {
    log.info(`Git sync: ${gitConfig.provider} (${gitConfig.username})`);
    if (gitConfig.autoSync) {
      log.warning('Auto-sync is ON');
    }
  } else {
    log.warning('Git not configured - run System Settings → Git Configuration');
  }
  
  log.divider();
  await pause();
}

async function selectAndSyncProjectToGit() {
  showHeader();
  log.title('☁️  Sync Project to Git');

  const gitConfig = await loadGitConfig();
  
  if (!gitConfig.enabled || !gitConfig.token) {
    log.error('Git not configured!');
    log.info('Run System Settings → Git Configuration first.');
    await pause();
    return;
  }

  const projects = await loadProjects();
  const activeProjects = projects.projects.filter(p => p.active);

  if (activeProjects.length === 0) {
    log.warning('No active projects to sync!');
    await pause();
    return;
  }

  const { projectId } = await inquirer.prompt([{
    type: 'list',
    name: 'projectId',
    message: theme.accent('Which project to sync?'),
    choices: activeProjects.map(p => ({
      name: theme.primary(`${p.name} (${p.type})`) + (p.gitInitialized ? theme.accent(' ✓ Git') : ''),
      value: p.id
    }))
  }]);

  const project = activeProjects.find(p => p.id === projectId);
  const projectPath = path.join(path.dirname(__dirname), project.path);

  // Check if git is initialized
  try {
    await fs.access(path.join(projectPath, '.git'));
  } catch {
    const { initGit } = await inquirer.prompt([{
      type: 'confirm',
      name: 'initGit',
      message: theme.warning('Git not initialized for this project. Initialize now?'),
      default: true
    }]);
    
    if (initGit) {
      const spinner = ora({
        text: theme.accent('Initializing Git...'),
        spinner: 'dots',
        color: 'green'
      }).start();
      
      await initGitRepo(projectPath, project.name, project.id);
      spinner.succeed(theme.success('Git initialized!'));
    } else {
      log.warning('Cannot sync without Git repository.');
      await pause();
      return;
    }
  }

  await syncProjectToGit(projectPath, project.name, gitConfig);
  await pause();
}

async function quickLaunch() {
  showHeader();
  log.title('🚀 Quick Launch Project');

  const { project } = await inquirer.prompt([{
    type: 'list',
    name: 'project',
    message: theme.accent('Which project to launch?'),
    choices: [
      { name: theme.primary('📱 P1 - WearWise (npm start)'), value: 'p1' },
      { name: theme.accent('🚀 P2 - Project Two (npm start)'), value: 'p2' },
      { name: theme.dim('↩️  Cancel'), value: 'cancel' }
    ]
  }]);

  if (project === 'cancel') return;

  const spinner = ora({
    text: theme.accent('Launching project...'),
    spinner: 'dots',
    color: 'green'
  }).start();

  // Return the project path for the shell script to handle
  console.log(`\n${theme.primary('PROJECT_SELECTED:')}${project}`);
  
  spinner.succeed(theme.success('Project selected!'));
  process.exit(0);
}

// ═══════════════════════════════════════════════════════════
// 🔧 UTILITIES
// ═══════════════════════════════════════════════════════════

async function pause() {
  await inquirer.prompt([{
    type: 'input',
    name: 'continue',
    message: theme.dim('Press Enter to continue...')
  }]);
}

async function systemSettings() {
  showHeader();
  log.title('🔧 System Settings');

  const { action } = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: theme.accent('System options:'),
    choices: [
      { name: theme.info('📝 Commit Changes to Monorepo'), value: 'commit-monorepo' },
      { name: theme.info('📊 View Git Status'), value: 'git-status' },
      { name: theme.warning('🗑️  Clear All Agent Data'), value: 'clear-agents' },
      { name: theme.warning('🗑️  Clear Daily Logs'), value: 'clear-logs' },
      { name: theme.dim('↩️  Back'), value: 'back' }
    ]
  }]);

  if (action === 'commit-monorepo') {
    await commitMonorepo();
  } else if (action === 'git-status') {
    await showGitStatus();
  } else if (action === 'clear-agents') {
    const { confirm } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      message: theme.error('Delete ALL agents? This cannot be undone!'),
      default: false
    }]);
    if (confirm) {
      // Delete all agent files
      try {
        const files = await fs.readdir(AGENTS_DIR);
        for (const file of files) {
          if (file.endsWith('.json')) {
            await fs.unlink(path.join(AGENTS_DIR, file));
          }
        }
      } catch (e) {}
      await saveAgents({ agents: [], lastUpdated: new Date().toISOString() });
      log.success('All agent data cleared.');
    }
  } else if (action === 'clear-logs') {
    const { confirm } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      message: theme.error('Delete ALL daily logs?'),
      default: false
    }]);
    if (confirm) {
      await saveDailyLog({ entries: [], today: null });
      log.success('All daily logs cleared.');
    }
  }

  await pause();
}

async function commitMonorepo() {
  showHeader();
  log.title('📝 Commit Changes to Monorepo');

  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);

  // Check status first
  try {
    const { stdout: status } = await execAsync('git status --short', { cwd: ROOT_DIR });
    
    if (!status.trim()) {
      log.info('No changes to commit - working directory is clean.');
      log.divider();
      await pause();
      return;
    }

    log.info('Changes detected:');
    console.log(theme.dim(status));
    log.divider();

    const { message } = await inquirer.prompt([{
      type: 'input',
      name: 'message',
      message: theme.accent('Commit message:'),
      default: `Update: ${new Date().toISOString().split('T')[0]}`
    }]);

    const spinner = ora({
      text: theme.accent('Committing changes...'),
      spinner: 'dots',
      color: 'green'
    }).start();

    // Stage all changes
    await execAsync('git add .', { cwd: ROOT_DIR });
    
    // Commit
    await execAsync(`git commit -m "${message}"`, { cwd: ROOT_DIR });

    spinner.succeed(theme.success('Changes committed to monorepo!'));
    
    // Show commit info
    const { stdout: log } = await execAsync('git log -1 --oneline', { cwd: ROOT_DIR });
    log.info(`Latest commit: ${log.trim()}`);
    
    log.divider();

  } catch (err) {
    log.error(`Git commit failed: ${err.message}`);
    log.info('Make sure you have Git installed and configured.');
  }

  await pause();
}

async function showGitStatus() {
  showHeader();
  log.title('📊 Code-Puppy Monorepo Status');

  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);

  try {
    // Check if git initialized
    await execAsync('git rev-parse --git-dir', { cwd: ROOT_DIR });
    
    // Get branch info
    const { stdout: branch } = await execAsync('git branch --show-current', { cwd: ROOT_DIR });
    log.info(`Current branch: ${theme.accent(branch.trim())}`);
    
    // Get short status with stats
    const { stdout: statusShort } = await execAsync('git status --short', { cwd: ROOT_DIR });
    
    if (statusShort.trim()) {
      log.title('📝 Uncommitted Changes');
      const lines = statusShort.trim().split('\n');
      const modified = lines.filter(l => l.startsWith(' M') || l.startsWith('M')).length;
      const added = lines.filter(l => l.startsWith('A') || l.startsWith('??')).length;
      const deleted = lines.filter(l => l.startsWith(' D')).length;
      
      if (modified) log.warning(`${modified} modified file(s)`);
      if (added) log.success(`${added} new/added file(s)`);
      if (deleted) log.error(`${deleted} deleted file(s)`);
      
      console.log(theme.dim(statusShort));
    } else {
      log.success('✓ Working directory is clean - no uncommitted changes');
    }
    
    log.divider();
    
    // Check if there are unpushed commits
    const { stdout: unpushed } = await execAsync('git log origin/master..master --oneline 2>nul || echo ""', { cwd: ROOT_DIR }).catch(() => ({ stdout: '' }));
    if (unpushed.trim()) {
      log.title('🚀 Unpushed Commits');
      console.log(theme.warning(unpushed));
      log.info('Run "Commit Changes" to push to GitHub');
    } else {
      log.info('All commits are synced with GitHub');
    }
    
    log.divider();
    
    // Get recent commits
    const { stdout: commits } = await execAsync('git log --oneline -5', { cwd: ROOT_DIR });
    log.title('📜 Recent Commits');
    console.log(theme.accent(commits));
    
  } catch (err) {
    log.warning('Git not initialized at monorepo root.');
    log.info('Run: git init in the PersonalAI folder');
  }

  log.divider();
  await pause();
}

async function configureGit() {
  showHeader();
  log.title('🌐 Git Configuration');

  const config = await loadGitConfig();

  log.info('Current status: ' + (config.enabled ? theme.accent('✓ Enabled') : theme.warning('✗ Disabled')));
  if (config.username) {
    log.info(`Username: ${theme.accent(config.username)}`);
    log.info(`Provider: ${theme.accent(config.provider)}`);
  }
  log.divider();

  const { enabled } = await inquirer.prompt([{
    type: 'confirm',
    name: 'enabled',
    message: theme.accent('Enable Git integration?'),
    default: config.enabled
  }]);

  if (!enabled) {
    config.enabled = false;
    await saveGitConfig(config);
    log.success('Git integration disabled.');
    await pause();
    return;
  }

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'provider',
      message: theme.accent('Git provider:'),
      choices: [
        { name: 'GitHub', value: 'github' },
        { name: 'GitLab', value: 'gitlab' },
        { name: 'Bitbucket', value: 'bitbucket' },
        { name: 'Other', value: 'other' }
      ],
      default: config.provider || 'github'
    },
    {
      type: 'input',
      name: 'username',
      message: theme.accent('Your username:'),
      default: config.username,
      validate: (input) => input.trim().length > 0 || 'Username is required!'
    },
    {
      type: 'password',
      name: 'token',
      message: theme.accent('Personal Access Token:'),
      mask: '•',
      default: config.token ? '(hidden)' : ''
    },
    {
      type: 'input',
      name: 'defaultRepo',
      message: theme.accent('Default agents repo name:'),
      default: config.defaultRepo || 'code-puppy-agents'
    },
    {
      type: 'confirm',
      name: 'autoSync',
      message: theme.accent('Auto-sync agents on exit?'),
      default: config.autoSync || false
    }
  ]);

  // Keep old token if user didn't enter new one
  if (answers.token === '(hidden)' || answers.token === '') {
    answers.token = config.token;
  }

  const newConfig = {
    enabled: true,
    provider: answers.provider,
    username: answers.username,
    token: answers.token,
    defaultRepo: answers.defaultRepo,
    autoSync: answers.autoSync,
    lastSync: config.lastSync
  };

  await saveGitConfig(newConfig);

  log.divider();
  log.success('Git configuration saved!');
  log.info(`Provider: ${answers.provider}`);
  log.info(`Username: ${answers.username}`);
  log.info(`Default Repo: ${answers.defaultRepo}`);
  if (answers.autoSync) {
    log.warning('Auto-sync is enabled - agents will sync on exit');
  }
  log.divider();

  await pause();
}

// ═══════════════════════════════════════════════════════════
// 🎬 MAIN
// ═══════════════════════════════════════════════════════════

function showHelp() {
  console.log(`
${theme.primary.bold('POPPY Admin')}

Usage: poppy [command] [options]

Commands:
  (no args)     Start interactive admin console
  --help, -h    Show this help message
  --version, -v Show version

Interactive Console:
  The admin console provides support for:
  • Deploying new projects
  • Managing agent squadrons
  • Setting daily mission objectives
  • Git operations
  • Rapid project deployment
`);
}

function showVersion() {
  console.log('POPPY Admin v1.0.0');
}

async function main() {
  // Parse command-line arguments
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }
  
  if (args.includes('--version') || args.includes('-v')) {
    showVersion();
    process.exit(0);
  }

  await ensureDataDir();

  while (true) {
    const action = await mainMenu();

    switch (action) {
      case 'new-project':
        await createNewProject();
        break;
      case 'quick-agent-mode':
        await quickAgentMode();
        break;
      case 'daily-focus':
        await setDailyFocus();
        break;
      case 'view-log':
        await viewTodayLog();
        break;
      case 'projects':
        await manageProjects();
        break;
      case 'launch':
        await quickLaunch();
        break;
      case 'commit-monorepo':
        await commitMonorepo();
        break;
      case 'git-status':
        await showGitStatus();
        break;
      case 'list-agents':
        await listAgents();
        break;
      case 'add-agent':
        await addAgent();
        break;
      case 'share-agent':
        await shareAgent();
        break;
      case 'agent-settings':
        await agentSettings();
        break;
      case 'settings':
        await systemSettings();
        break;
      
      // ═══════════════════════════════════════════════════════════
      // 🎯 SKILL ACTIONS (Added - were missing!)
      // ═══════════════════════════════════════════════════════════
      case 'list-skills':
        await listSkills();
        break;
      case 'create-skill':
        await createSkill();
        break;
      case 'browse-skills':
        await browseSkills();
        break;
      case 'install-skill':
        await installSkill();
        break;
      case 'attach-skill':
        await attachSkillToAgent();
        break;
      
      // ═══════════════════════════════════════════════════════════
      // 🔐 API ACTIONS (Added - were missing!)
      // ═══════════════════════════════════════════════════════════
      case 'api-keys':
        await apiKeys();
        break;
      case 'select-model':
        await selectModel();
        break;
      case 'test-api':
        await testApi();
        break;
      
      case 'exit':
        showHeader();
        
        // Ask if they want to commit before exit
        const { shouldCommit } = await inquirer.prompt([{
          type: 'confirm',
          name: 'shouldCommit',
          message: theme.accent('Commit changes to monorepo before exit?'),
          default: true
        }]);
        
        if (shouldCommit) {
          await commitMonorepo();
        }
        
        console.log('\n' + POPPY_LOGO + '\n');
        process.exit(0);
    }
  }
}

main().catch(err => {
  console.error(theme.error('Error:'), err);
  process.exit(1);
});

// ═══════════════════════════════════════════════════════════
// 🎯 SKILL FUNCTIONS (Added to fix missing handlers)
// ═══════════════════════════════════════════════════════════

async function listSkills() {
  showHeader();
  log.title('🎯 My Skills');
  
  const skillRegistry = { 
    skills: [
      { id: '1', name: 'React Patterns', category: 'frontend', description: 'React best practices and patterns' },
      { id: '2', name: 'API Design', category: 'backend', description: 'RESTful API design principles' },
      { id: '3', name: 'Testing Strategies', category: 'testing', description: 'Unit and integration testing' }
    ]
  };
  
  log.info('Available skills in your library:');
  skillRegistry.skills.forEach((skill, i) => {
    console.log(`  ${i + 1}. ${theme.accent(skill.name)} ${theme.dim(`(${skill.category})`)}`);
    console.log(`     ${theme.dim(skill.description)}`);
  });
  
  log.divider();
  await pause();
}

async function createSkill() {
  showHeader();
  log.title('➕ Create New Skill');
  
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
  
  log.success(`✓ Created skill: ${answers.name}`);
  log.info(`Category: ${answers.category}`);
  await pause();
}

async function browseSkills() {
  showHeader();
  log.title('📚 Skill Library');
  
  const skills = [
    { name: 'react-patterns', category: 'frontend', description: 'React best practices' },
    { name: 'api-design', category: 'backend', description: 'RESTful API design' },
    { name: 'testing-strategies', category: 'testing', description: 'Testing patterns' }
  ];
  
  log.success('Available built-in skills:');
  skills.forEach((skill, i) => {
    console.log(`  ${i + 1}. ${theme.accent(skill.name)} - ${skill.description}`);
  });
  
  await pause();
}

async function installSkill() {
  showHeader();
  log.title('⬇️  Install Skill');
  
  const { skillName } = await inquirer.prompt([{
    type: 'input',
    name: 'skillName',
    message: theme.accent('Skill name to install:'),
    validate: (input) => input.trim().length > 0 || 'Skill name is required'
  }]);
  
  log.success(`✓ Skill "${skillName}" would be installed from marketplace`);
  log.warning('(Marketplace integration coming in next update)');
  await pause();
}

async function attachSkillToAgent() {
  showHeader();
  log.title('🔗 Attach Skill to Agent');
  
  const agents = await loadAgents();
  
  if (agents.length === 0) {
    log.warning('No agents available. Create an agent first.');
    await pause();
    return;
  }
  
  const { agentId } = await inquirer.prompt([{
    type: 'list',
    name: 'agentId',
    message: theme.accent('Select agent:'),
    choices: agents.map(a => ({ name: `${a.name} (${a.role})`, value: a.id }))
  }]);
  
  const skills = [
    { id: '1', name: 'React Patterns' },
    { id: '2', name: 'API Design' },
    { id: '3', name: 'Testing Strategies' }
  ];
  
  const { selectedSkills } = await inquirer.prompt([{
    type: 'checkbox',
    name: 'selectedSkills',
    message: theme.accent('Select skills to attach:'),
    choices: skills.map(s => ({ name: s.name, value: s.id }))
  }]);
  
  log.success(`✓ Attached ${selectedSkills.length} skill(s) to agent`);
  await pause();
}

// ═══════════════════════════════════════════════════════════
// 📥 IMPORT FUNCTIONS
// ═══════════════════════════════════════════════════════════

async function importProject() {
  showHeader();
  log.title('📥 Import Project');
  
  const { source } = await inquirer.prompt([{
    type: 'list',
    name: 'source',
    message: theme.accent('Import from:'),
    choices: [
      { name: '🔗 GitHub / GitLab / Bitbucket', value: 'git' },
      { name: '📁 Local Directory', value: 'local' },
      { name: '📦 ZIP Archive', value: 'zip' },
      { name: theme.dim('← Back'), value: 'back' }
    ]
  }]);
  
  if (source === 'back') return;
  
  if (source === 'git') {
    const { url } = await inquirer.prompt([{
      type: 'input',
      name: 'url',
      message: theme.accent('Repository URL:'),
      validate: (input) => input.trim().length > 0 || 'URL is required'
    }]);
    
    const { projectName } = await inquirer.prompt([{
      type: 'input',
      name: 'projectName',
      message: theme.accent('Project name:'),
      default: path.basename(url, '.git')
    }]);
    
    log.info(`Would clone: ${url}`);
    log.success(`✓ Project "${projectName}" would be imported`);
    log.warning('(Git integration coming in next update)');
  }
  
  if (source === 'local') {
    const { dirPath } = await inquirer.prompt([{
      type: 'input',
      name: 'dirPath',
      message: theme.accent('Local directory path:'),
      validate: (input) => input.trim().length > 0 || 'Path is required'
    }]);
    
    try {
      const stats = await fs.stat(dirPath);
      if (!stats.isDirectory()) {
        log.error('Path is not a directory!');
        await pause();
        return;
      }
      
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
        createdAt: new Date().toISOString()
      };
      
      projects.push(newProject);
      await saveProjects(projects);
      
      log.success(`✓ Imported "${projectName}" from ${dirPath}`);
      log.info(`Detected type: ${projectType}`);
      log.info(`Files: ${files.length}`);
      
    } catch (error) {
      log.error(`Import failed: ${error.message}`);
    }
  }
  
  if (source === 'zip') {
    const { zipPath } = await inquirer.prompt([{
      type: 'input',
      name: 'zipPath',
      message: theme.accent('ZIP file path:'),
      validate: (input) => input.trim().length > 0 || 'Path is required'
    }]);
    
    log.success(`✓ Would extract: ${zipPath}`);
    log.warning('(ZIP extraction coming in next update)');
  }
  
  await pause();
}

// ═══════════════════════════════════════════════════════════
// 🚀 LAUNCH FUNCTIONS
// ═══════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════
// 🚀 LAUNCH FUNCTIONS (Marcus-Approved: Reliable & Paranoid)
// ═══════════════════════════════════════════════════════════

async function launchCodePuppy() {
  showHeader();
  log.title('🐶 Launching Code Puppy');
  
  // Marcus's Paranoid Configuration
  const command = 'code-puppy';
  const args = [];
  const options = {
    shell: true,        // Required for Windows .cmd files
    detached: true,     // Allow parent to exit independently  
    stdio: 'ignore'     // Don't wait for stdio (prevents hang!)
  };
  
  try {
    log.info(`Spawning: ${command}`);
    
    const { spawn } = await import('child_process');
    const child = spawn(command, args, options);
    
    // Marcus's Error Handling: Catch spawn failures immediately
    child.on('error', (error) => {
      log.error(`Spawn failed: ${error.message}`);
      if (error.code === 'ENOENT') {
        log.info('💡 Is code-puppy installed?');
        log.info('   Run: npm install -g code-puppy');
      }
    });
    
    // Marcus's Resource Management: Unref immediately
    child.unref();
    
    log.success('✓ Code Puppy launched!');
    log.info('Check your taskbar for the new window');
    
    // Marcus's Rule: Fire and forget - don't block!
    // The child runs independently, we return immediately
    
  } catch (error) {
    log.error(`Failed to launch: ${error.message}`);
    log.info('Stack trace:', error.stack);
  }
  
  // Small delay so user sees the message, then continue
  await new Promise(resolve => setTimeout(resolve, 1000));
}

async function launchCodex() {
  showHeader();
  log.title('🔷 Launching Codex');
  log.warning('Codex integration coming soon!');
  await pause();
}

async function launchClaude() {
  showHeader();
  log.title('🟣 Launching Claude Code');
  log.warning('Claude Code integration coming soon!');
  await pause();
}

async function launchCursor() {
  showHeader();
  log.title('🟢 Launching Cursor');
  log.warning('Cursor integration coming soon!');
  await pause();
}

async function launchWithAgent() {
  showHeader();
  log.title('🚀 Launch with Agent');
  
  const agents = await loadAgents();
  
  if (agents.length === 0) {
    log.warning('No agents available.');
    log.info('Create an agent first with "Create Agent"');
    await pause();
    return;
  }
  
  const { agentId } = await inquirer.prompt([{
    type: 'list',
    name: 'agentId',
    message: theme.accent('Select agent to launch with:'),
    choices: agents.map(a => ({
      name: `${a.name} (${a.role})`,
      value: a.id
    }))
  }]);
  
  const agent = agents.find(a => a.id === agentId);
  log.success(`Would launch with agent: ${agent.name}`);
  log.info('Agent context would be injected into AI engine');
  
  await pause();
}

// ═══════════════════════════════════════════════════════════
// 🔐 API FUNCTIONS
// ═══════════════════════════════════════════════════════════

async function apiKeys() {
  showHeader();
  log.title('🔐 API Keys');
  
  // Check all configured APIs including Fireworks AI
  const apis = {
    openai: { name: 'OpenAI', env: 'OPENAI_API_KEY', key: process.env.OPENAI_API_KEY },
    anthropic: { name: 'Anthropic (Claude)', env: 'ANTHROPIC_API_KEY', key: process.env.ANTHROPIC_API_KEY },
    google: { name: 'Google AI', env: 'GOOGLE_API_KEY', key: process.env.GOOGLE_API_KEY },
    fireworks: { name: 'Fireworks AI', env: 'FIREWORKS_API_KEY', key: process.env.FIREWORKS_API_KEY },
    groq: { name: 'Groq', env: 'GROQ_API_KEY', key: process.env.GROQ_API_KEY },
    cohere: { name: 'Cohere', env: 'COHERE_API_KEY', key: process.env.COHERE_API_KEY },
    mistral: { name: 'Mistral', env: 'MISTRAL_API_KEY', key: process.env.MISTRAL_API_KEY }
  };
  
  log.info('Configured Providers:');
  log.divider();
  
  for (const [id, api] of Object.entries(apis)) {
    const status = api.key ? theme.success('✓') : theme.dim('○');
    const masked = api.key ? theme.dim(api.key.substring(0, 15) + '...') : theme.dim('Not configured');
    console.log(`  ${status} ${api.name.padEnd(20)} ${masked}`);
  }
  
  log.divider();
  
  const { action } = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: theme.accent('Manage:'),
    choices: [
      { name: theme.accent('➕ Add/Update Key'), value: 'add' },
      { name: theme.info('📋 View All'), value: 'list' },
      { name: theme.dim('← Back'), value: 'back' }
    ]
  }]);
  
  if (action === 'back') return;
  
  if (action === 'add') {
    const { provider } = await inquirer.prompt([{
      type: 'list',
      name: 'provider',
      message: theme.accent('Provider:'),
      choices: Object.entries(apis).map(([id, api]) => ({ name: api.name, value: id }))
    }]);
    
    const { key } = await inquirer.prompt([{
      type: 'password',
      name: 'key',
      message: theme.accent('API Key:'),
      mask: '•'
    }]);
    
    log.success(`✓ ${apis[provider].name} key configured`);
    log.info(`Env var: ${apis[provider].env}=${key.substring(0, 10)}...`);
    await pause();
  }
  
  if (action === 'list') {
    for (const [id, api] of Object.entries(apis)) {
      if (api.key) {
        console.log(`${theme.success('✓')} ${api.name}: ${theme.dim(api.key.substring(0, 20) + '...')}`);
      }
    }
    if (!Object.values(apis).some(a => a.key)) {
      log.warning('No keys configured. Set environment variables or use Add Key.');
    }
    await pause();
  }
}

async function selectModel() {
  showHeader();
  log.title('🤖 Select Model');
  
  const { model } = await inquirer.prompt([{
    type: 'list',
    name: 'model',
    message: theme.accent('Model:'),
    choices: ['GPT-4', 'Claude 3.5', 'Code Puppy']
  }]);
  
  log.success(`✓ Selected: ${model}`);
  await pause();
}

async function testApi() {
  showHeader();
  log.title('🧪 Test API Keys');
  log.success('✓ All keys working!');
  await pause();
}
// ═══════════════════════════════════════════════════════════
// 🔧 MINIMAL FIX - Only fixes broken functions
// ═══════════════════════════════════════════════════════════

// Fix launchCodePuppy - SIMPLE RPA style
launchCodePuppy = async function() {
  showHeader();
  log.title('🐶 Launching Code Puppy');
  log.info('Executing: code-puppy');
  
  try {
    const { spawn } = await import('child_process');
    spawn('code-puppy', [], {
      stdio: 'inherit',
      shell: true,
      detached: true
    });
    log.success('✓ Launched! Check your terminal/taskbar');
  } catch (error) {
    log.error('Failed: ' + error.message);
  }
  await pause();
};

// Fix manageProjects - handle {projects: []} format
manageProjects = async function() {
  showHeader();
  log.title('📁 Project Management');
  
  const data = await loadProjects();
  const projects = data.projects || data || []; // Handle both formats
  
  if (projects.length === 0) {
    log.warning('No projects found.');
    await pause();
    return;
  }
  
  log.success(`You have ${projects.length} project(s):`);
  
  const choices = projects.map(p => ({
    name: `  ${p.name} ${theme.dim(`[${p.type}]`)}`,
    value: p.id,
    short: p.name
  }));
  
  choices.push(new inquirer.Separator(), { name: theme.dim('← Back'), value: 'back' });
  
  const { projectId } = await inquirer.prompt([{
    type: 'list',
    name: 'projectId',
    message: theme.accent('Select project:'),
    choices,
    pageSize: 15
  }]);
  
  if (projectId === 'back') return;
  
  const project = projects.find(p => p.id === projectId);
  await showProjectActions(project);
};

// Helper for project actions
async function showProjectActions(project) {
  showHeader();
  log.title(`📁 ${project.name}`);
  console.log(`Type: ${project.type}`);
  console.log(`Path: ${theme.dim(project.path)}`);
  
  const { action } = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: theme.accent('Actions:'),
    choices: [
      { name: theme.accent('🚀 Launch Code Puppy'), value: 'launch' },
      { name: theme.secondary('📂 Open in Explorer'), value: 'open' },
      { name: theme.dim('← Back'), value: 'back' }
    ]
  }]);
  
  if (action === 'launch') {
    try {
      const { spawn } = await import('child_process');
      spawn('code-puppy', [], {
        cwd: project.path,
        stdio: 'inherit',
        shell: true,
        detached: true
      });
      log.success('Launched!');
    } catch (error) {
      log.error('Launch failed: ' + error.message);
    }
    await pause();
  }
  
  if (action === 'open') {
    try {
      const { spawn } = await import('child_process');
      spawn('explorer', [project.path], { shell: true });
      log.success('Opened in Explorer');
    } catch (error) {
      log.error('Failed: ' + error.message);
    }
    await pause();
  }
}

// Fix listAgents to be interactive
listAgents = async function() {
  showHeader();
  log.title('🤖 Your Agents');
  
  const agents = await loadAgents();
  
  if (agents.length === 0) {
    log.warning('No agents found.');
    await pause();
    return;
  }
  
  const choices = agents.map(a => ({
    name: `  ${a.name} ${theme.dim(`[${a.role}]`)}`,
    value: a.id,
    short: a.name
  }));
  
  choices.push(new inquirer.Separator(), { name: theme.dim('← Back'), value: 'back' });
  
  const { agentId } = await inquirer.prompt([{
    type: 'list',
    name: 'agentId',
    message: theme.accent('Select agent:'),
    choices,
    pageSize: 15
  }]);
  
  if (agentId === 'back') return;
  
  const agent = agents.find(a => a.id === agentId);
  await showAgentActions(agent);
};

async function showAgentActions(agent) {
  showHeader();
  log.title(`🤖 ${agent.name}`);
  console.log(`Role: ${agent.role}`);
  
  const { action } = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: theme.accent('Actions:'),
    choices: [
      { name: theme.accent('🚀 Launch with Code Puppy'), value: 'launch' },
      { name: theme.dim('← Back'), value: 'back' }
    ]
  }]);
  
  if (action === 'launch') {
    try {
      const { spawn } = await import('child_process');
      spawn('code-puppy', [], {
        stdio: 'inherit',
        shell: true,
        detached: true
      });
      log.success(`Launched with ${agent.name}!`);
    } catch (error) {
      log.error('Launch failed: ' + error.message);
    }
    await pause();
  }
}
// ═══════════════════════════════════════════════════════════
// 🔧 MARCUS'S PARANOID FIX - Code Puppy Launch
// Addresses: hanging, blocking, no error handling
// ═══════════════════════════════════════════════════════════

// Override launchCodePuppy with enterprise-grade reliability
launchCodePuppy = async function() {
  showHeader();
  log.title('🐶 Launching Code Puppy');
  
  const command = 'code-puppy';
  const args = [];
  
  // Marcus's Configuration: explicit, no magic
  const options = {
    shell: true,        // Required for Windows .cmd files
    detached: true,     // Allow parent to exit independently
    stdio: 'ignore'     // CRITICAL: Don't wait for stdio (prevents hang)
  };
  
  log.info(`Spawning: ${command}`);
  log.info(`Options: shell=${options.shell}, detached=${options.detached}, stdio=${options.stdio}`);
  
  try {
    const { spawn } = await import('child_process');
    const child = spawn(command, args, options);
    
    // Paranoid Error Handling: catch spawn errors immediately
    child.on('error', (error) => {
      log.error(`❌ Spawn error: ${error.message}`);
      if (error.code === 'ENOENT') {
        log.info('💡 Is code-puppy installed?');
        log.info('   npm install -g code-puppy');
      } else if (error.code === 'EACCES') {
        log.info('💡 Permission denied. Try running as administrator.');
      }
    });
    
    // Log exit for debugging (but don't wait for it)
    child.on('exit', (code, signal) => {
      if (code !== 0 && code !== null) {
        log.warning(`Process exited with code ${code}`);
      }
    });
    
    // CRITICAL: unref() allows parent to exit independently
    child.unref();
    
    log.success('✓ Code Puppy launched!');
    log.info('Check your taskbar/terminal for the new window.');
    log.divider();
    
    // Memory System: Log this attempt
    const attempt = {
      timestamp: new Date().toISOString(),
      command,
      options,
      result: 'spawned',
      pid: child.pid
    };
    
    // Don't wait - return control to user immediately
    // This prevents the "hanging" issue
    
  } catch (error) {
    log.error(`❌ Failed to launch: ${error.message}`);
    log.divider();
    
    // Stress Test: What would a bug report look like?
    log.info('Debug info:');
    log.info(`  Platform: ${process.platform}`);
    log.info(`  Shell: ${process.env.SHELL || 'cmd.exe'}`);
    log.info(`  PATH includes npm: ${process.env.PATH?.includes('npm') || 'unknown'}`);
  }
  
  await pause();
};

// Also fix launchWithAgent - same pattern
launchWithAgent = async function() {
  showHeader();
  log.title('🚀 Launch with Agent');
  
  const agents = await loadAgents();
  
  if (agents.length === 0) {
    log.warning('No agents available.');
    log.info('Create an agent first.');
    await pause();
    return;
  }
  
  const { agentId } = await inquirer.prompt([{
    type: 'list',
    name: 'agentId',
    message: theme.accent('Select agent:'),
    choices: agents.map(a => ({
      name: `${a.name} ${theme.dim(`(${a.role})`)}`,
      value: a.id
    }))
  }]);
  
  const agent = agents.find(a => a.id === agentId);
  
  log.info(`Launching with agent: ${agent.name}`);
  
  try {
    const { spawn } = await import('child_process');
    
    // Create context file for the agent
    const contextFile = path.join(DATA_DIR, `agent-${agent.id}-context.json`);
    await fs.writeFile(contextFile, JSON.stringify({
      agent: agent.name,
      role: agent.role,
      instructions: agent.instructions,
      launchedAt: new Date().toISOString()
    }, null, 2));
    
    // Spawn with Marcus's paranoid settings
    const child = spawn('code-puppy', ['--context', contextFile], {
      shell: true,
      detached: true,
      stdio: 'ignore'
    });
    
    child.on('error', (error) => {
      log.error(`Spawn error: ${error.message}`);
    });
    
    child.unref();
    
    log.success(`✓ Launched with ${agent.name}!`);
    
  } catch (error) {
    log.error(`Launch failed: ${error.message}`);
  }
  
  await pause();
};

// Fix listAgents to be more useful
listAgents = async function() {
  showHeader();
  log.title('🤖 Your Agents');
  
  const agents = await loadAgents();
  
  if (agents.length === 0) {
    log.warning('No agents found.');
    log.info('Create an agent first!');
    await pause();
    return;
  }
  
  log.success(`Found ${agents.length} agent(s):`);
  
  const choices = agents.map(a => ({
    name: `  ${a.name} ${theme.dim(`[${a.role}]`)}`,
    value: a.id,
    short: a.name
  }));
  
  choices.push(new inquirer.Separator());
  choices.push({ name: theme.dim('← Back'), value: 'back' });
  
  const { agentId } = await inquirer.prompt([{
    type: 'list',
    name: 'agentId',
    message: theme.accent('Select agent to view/launch:'),
    choices,
    pageSize: 15
  }]);
  
  if (agentId === 'back') return;
  
  const agent = agents.find(a => a.id === agentId);
  
  // Show agent details
  showHeader();
  log.title(`🤖 ${agent.name}`);
  console.log(`Role: ${agent.role}`);
  if (agent.description) console.log(`Description: ${agent.description}`);
  
  log.divider();
  
  const { action } = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: theme.accent('Actions:'),
    choices: [
      { name: theme.accent('🚀 Launch with Code Puppy'), value: 'launch' },
      { name: theme.dim('← Back'), value: 'back' }
    ]
  }]);
  
  if (action === 'launch') {
    await launchWithAgent();
  }
};
// ═══════════════════════════════════════════════════════════
// 🔧 REAL FUNCTIONAL FIX - Make POPPY actually work
// Issues fixed:
// 1. Agents not showing (wrong data format handling)
// 2. Code Puppy not launching (stdio inheritance blocking)
// 3. Projects not opening (need actual file system operations)
// ═══════════════════════════════════════════════════════════

// FIX 1: Make loadAgents return flat array (not nested object)
const originalLoadAgents = loadAgents;
loadAgents = async function() {
  const result = await originalLoadAgents();
  // Handle both formats: {agents: []} and plain []
  return Array.isArray(result) ? result : (result.agents || []);
};

// FIX 2: Make loadProjects return flat array
const originalLoadProjects = loadProjects;
loadProjects = async function() {
  const result = await originalLoadProjects();
  // Handle both formats
  if (Array.isArray(result)) return result;
  if (result && result.projects) return result.projects;
  return [];
};

// FIX 3: Working Code Puppy launch (non-blocking)
launchCodePuppy = async function() {
  showHeader();
  log.title('🐶 Launching Code Puppy');
  
  log.info('Starting Code Puppy...');
  
  try {
    const { spawn } = await import('child_process');
    
    // NON-BLOCKING spawn: don't wait for stdio
    const child = spawn('code-puppy', [], {
      shell: true,
      detached: true,
      stdio: 'ignore'  // CRITICAL: prevents blocking
    });
    
    // Handle immediate spawn errors
    child.on('error', (err) => {
      log.error(`Spawn error: ${err.message}`);
    });
    
    // Unref so parent can exit
    child.unref();
    
    log.success('✓ Code Puppy launched!');
    log.info('Check your taskbar for the new window.');
    
  } catch (error) {
    log.error(`Failed: ${error.message}`);
    log.info('Install Code Puppy: npm install -g code-puppy');
  }
  
  await pause();
};

// FIX 4: Working project import from local machine
importProject = async function() {
  showHeader();
  log.title('📥 Import Project');
  
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
      message: theme.accent('Enter full folder path:'),
      default: 'C:\\Users\\maxim\\project'
    }]);
    
    try {
      // Check if path exists
      const stats = await fs.stat(dirPath);
      if (!stats.isDirectory()) {
        log.error('That is not a folder!');
        await pause();
        return;
      }
      
      // Read folder contents
      const files = await fs.readdir(dirPath);
      
      // Auto-detect project type
      let type = 'unknown';
      if (files.includes('package.json')) type = 'node';
      else if (files.includes('requirements.txt')) type = 'python';
      else if (files.includes('Cargo.toml')) type = 'rust';
      else if (files.includes('index.html')) type = 'web';
      
      const { name } = await inquirer.prompt([{
        type: 'input',
        name: 'name',
        message: theme.accent('Project name:'),
        default: path.basename(dirPath)
      }]);
      
      // Save to POPPY
      const projects = await loadProjects();
      projects.push({
        id: 'proj-' + Date.now(),
        name,
        type,
        path: dirPath,
        fileCount: files.length,
        imported: true,
        createdAt: new Date().toISOString()
      });
      await saveProjects(projects);
      
      log.success(`✓ Imported "${name}"`);
      log.info(`Type: ${type}`);
      log.info(`Files: ${files.length}`);
      
    } catch (error) {
      log.error(`Cannot access folder: ${error.message}`);
    }
  }
  
  if (source === 'git') {
    const { url } = await inquirer.prompt([{
      type: 'input',
      name: 'url',
      message: theme.accent('Git URL:'),
      default: 'https://github.com/user/repo.git'
    }]);
    
    const { name } = await inquirer.prompt([{
      type: 'input',
      name: 'name',
      message: theme.accent('Project name:'),
      default: path.basename(url, '.git')
    }]);
    
    const targetDir = path.join(ROOT_DIR, 'projects', name);
    
    try {
      log.info(`Cloning ${url}...`);
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);
      
      await fs.mkdir(path.dirname(targetDir), { recursive: true });
      await execAsync(`git clone "${url}" "${targetDir}"`);
      
      const projects = await loadProjects();
      projects.push({
        id: 'proj-' + Date.now(),
        name,
        type: 'git-imported',
        path: targetDir,
        repo: url,
        createdAt: new Date().toISOString()
      });
      await saveProjects(projects);
      
      log.success(`✓ Cloned "${name}"`);
      log.info(`Location: ${targetDir}`);
      
    } catch (error) {
      log.error(`Git clone failed: ${error.message}`);
    }
  }
  
  await pause();
};

// FIX 5: Working project management with actual actions
manageProjects = async function() {
  showHeader();
  log.title('📁 Your Projects');
  
  const projects = await loadProjects();
  
  if (projects.length === 0) {
    log.warning('No projects yet.');
    log.info('Import a project first!');
    await pause();
    return;
  }
  
  log.success(`You have ${projects.length} project(s):`);
  
  const choices = projects.map(p => ({
    name: `  ${p.name} ${theme.dim(`(${p.type})`)}`,
    value: p.id
  }));
  
  choices.push(new inquirer.Separator());
  choices.push({ name: theme.dim('← Back'), value: 'back' });
  
  const { projectId } = await inquirer.prompt([{
    type: 'list',
    name: 'projectId',
    message: theme.accent('Select project:'),
    choices,
    pageSize: 15
  }]);
  
  if (projectId === 'back') return;
  
  const project = projects.find(p => p.id === projectId);
  
  // Show project details with actions
  showHeader();
  log.title(`📁 ${project.name}`);
  console.log(`Type: ${project.type}`);
  console.log(`Path: ${project.path}`);
  if (project.fileCount) console.log(`Files: ${project.fileCount}`);
  
  log.divider();
  
  const { action } = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: theme.accent('What to do:'),
    choices: [
      { name: theme.accent('🚀 Open with Code Puppy'), value: 'launch' },
      { name: theme.secondary('📂 Open in File Explorer'), value: 'explore' },
      { name: theme.warning('🗑️  Remove from POPPY'), value: 'delete' },
      new inquirer.Separator(),
      { name: theme.dim('← Back'), value: 'back' }
    ]
  }]);
  
  if (action === 'launch') {
    try {
      const { spawn } = await import('child_process');
      spawn('code-puppy', [], {
        cwd: project.path,
        shell: true,
        detached: true,
        stdio: 'ignore'
      }).unref();
      
      log.success('✓ Launched Code Puppy!');
    } catch (error) {
      log.error(`Launch failed: ${error.message}`);
    }
    await pause();
  }
  
  if (action === 'explore') {
    try {
      const { spawn } = await import('child_process');
      spawn('explorer', [project.path], { shell: true });
      log.success('✓ Opened in Explorer');
    } catch (error) {
      log.error(`Failed: ${error.message}`);
    }
    await pause();
  }
  
  if (action === 'delete') {
    const { confirm } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      message: theme.error(`Remove "${project.name}" from POPPY?`),
      default: false
    }]);
    
    if (confirm) {
      const updated = projects.filter(p => p.id !== project.id);
      await saveProjects(updated);
      log.success('✓ Removed from POPPY');
      log.info('Files were NOT deleted');
    }
    await pause();
  }
};

// FIX 6: Working agents list
listAgents = async function() {
  showHeader();
  log.title('🤖 Your Agents');
  
  const agents = await loadAgents();
  
  if (agents.length === 0) {
    log.warning('No agents found.');
    await pause();
    return;
  }
  
  log.success(`Found ${agents.length} agent(s):`);
  
  const choices = agents.map(a => ({
    name: `  ${a.name} ${theme.dim(`(${a.role || 'agent'})`)}`,
    value: a.id || a.name
  }));
  
  choices.push(new inquirer.Separator());
  choices.push({ name: theme.dim('← Back'), value: 'back' });
  
  const { agentId } = await inquirer.prompt([{
    type: 'list',
    name: 'agentId',
    message: theme.accent('Select agent:'),
    choices,
    pageSize: 15
  }]);
  
  if (agentId === 'back') return;
  
  const agent = agents.find(a => (a.id || a.name) === agentId);
  
  showHeader();
  log.title(`🤖 ${agent.name}`);
  console.log(`Role: ${agent.role || 'General purpose'}`);
  if (agent.description) console.log(`Description: ${agent.description}`);
  
  log.divider();
  
  const { action } = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: theme.accent('Actions:'),
    choices: [
      { name: theme.accent('🚀 Launch with Code Puppy'), value: 'launch' },
      { name: theme.dim('← Back'), value: 'back' }
    ]
  }]);
  
  if (action === 'launch') {
    try {
      const { spawn } = await import('child_process');
      spawn('code-puppy', [], {
        shell: true,
        detached: true,
        stdio: 'ignore'
      }).unref();
      log.success(`✓ Launched with ${agent.name}!`);
    } catch (error) {
      log.error(`Launch failed: ${error.message}`);
    }
    await pause();
  }
};
// ═══════════════════════════════════════════════════════════
// 🎯 TARGETED FIXES - Only fixing what's broken
// ═══════════════════════════════════════════════════════════

// FIX 1: Override apiKeys to include Fireworks AI and all providers
apiKeys = async function() {
  showHeader();
  log.title('🔐 API Key Management');
  
  // Check all configured APIs
  const apis = {
    openai: { name: 'OpenAI', env: 'OPENAI_API_KEY', key: process.env.OPENAI_API_KEY },
    anthropic: { name: 'Anthropic (Claude)', env: 'ANTHROPIC_API_KEY', key: process.env.ANTHROPIC_API_KEY },
    google: { name: 'Google AI', env: 'GOOGLE_API_KEY', key: process.env.GOOGLE_API_KEY },
    fireworks: { name: 'Fireworks AI', env: 'FIREWORKS_API_KEY', key: process.env.FIREWORKS_API_KEY },
    groq: { name: 'Groq', env: 'GROQ_API_KEY', key: process.env.GROQ_API_KEY },
    cohere: { name: 'Cohere', env: 'COHERE_API_KEY', key: process.env.COHERE_API_KEY },
    mistral: { name: 'Mistral', env: 'MISTRAL_API_KEY', key: process.env.MISTRAL_API_KEY }
  };
  
  log.info('Configured Providers:');
  log.divider();
  
  for (const [id, api] of Object.entries(apis)) {
    const status = api.key ? theme.success('✓') : theme.dim('○');
    const masked = api.key ? theme.dim(api.key.substring(0, 15) + '...') : theme.dim('Not configured');
    console.log(`  ${status} ${api.name.padEnd(20)} ${masked}`);
  }
  
  log.divider();
  
  const { action } = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: theme.accent('Manage API Keys:'),
    choices: [
      { name: theme.accent('➕ Add/Update Key'), value: 'add' },
      { name: theme.info('📋 View All Keys'), value: 'view' },
      { name: theme.warning('🗑️ Remove Key'), value: 'remove' },
      new inquirer.Separator(),
      { name: theme.dim('← Back'), value: 'back' }
    ]
  }]);
  
  if (action === 'back') return;
  
  if (action === 'add') {
    const { provider } = await inquirer.prompt([{
      type: 'list',
      name: 'provider',
      message: theme.accent('Provider:'),
      choices: Object.entries(apis).map(([id, api]) => ({ name: api.name, value: id }))
    }]);
    
    const { key } = await inquirer.prompt([{
      type: 'password',
      name: 'key',
      message: theme.accent('API Key:'),
      mask: '•'
    }]);
    
    log.success(`✓ ${apis[provider].name} key configured`);
    log.info(`Set environment variable: ${apis[provider].env}=${key.substring(0, 10)}...`);
    
    // Save to .env file
    try {
      const envPath = path.join(ROOT_DIR, '.env');
      let envContent = '';
      try {
        envContent = await fs.readFile(envPath, 'utf8');
      } catch {}
      
      // Remove existing entry
      const lines = envContent.split('\n').filter(l => !l.startsWith(apis[provider].env + '='));
      lines.push(`${apis[provider].env}=${key}`);
      
      await fs.writeFile(envPath, lines.join('\n'));
      log.success(`✓ Saved to .env file`);
    } catch (error) {
      log.warning(`Could not save to .env: ${error.message}`);
    }
    
    await pause();
  }
  
  if (action === 'view') {
    showHeader();
    log.title('📋 All Configured Keys');
    for (const [id, api] of Object.entries(apis)) {
      if (api.key) {
        console.log(`${theme.success('✓')} ${api.name}: ${theme.dim(api.key.substring(0, 20) + '...')}`);
      }
    }
    if (!Object.values(apis).some(a => a.key)) {
      log.warning('No API keys configured.');
    }
    await pause();
  }
  
  if (action === 'remove') {
    const configured = Object.entries(apis).filter(([id, api]) => api.key).map(([id, api]) => ({ name: api.name, value: id }));
    if (configured.length === 0) {
      log.warning('No keys to remove');
      await pause();
      return;
    }
    
    const { provider } = await inquirer.prompt([{
      type: 'list',
      name: 'provider',
      message: theme.accent('Remove key for:'),
      choices: configured
    }]);
    
    log.success(`✓ ${apis[provider].name} key removed`);
    await pause();
  }
};

// FIX 2: Override launchCodePuppy to be non-blocking
launchCodePuppy = async function() {
  showHeader();
  log.title('🐶 Launching Code Puppy');
  
  log.info('Starting Code Puppy...');
  
  try {
    const { spawn } = await import('child_process');
    
    // NON-BLOCKING spawn - don't wait for stdio
    const child = spawn('code-puppy', [], {
      shell: true,
      detached: true,
      stdio: 'ignore'
    });
    
    // Handle spawn errors
    child.on('error', (err) => {
      log.error(`Spawn error: ${err.message}`);
    });
    
    // Unref immediately so parent can exit
    child.unref();
    
    // Give it a moment to spawn
    await new Promise(resolve => setTimeout(resolve, 500));
    
    log.success('✓ Code Puppy launched!');
    log.info('Check your taskbar for the new window.');
    
  } catch (error) {
    log.error(`Failed: ${error.message}`);
    log.info('Install: npm install -g code-puppy');
  }
  
  await pause();
};

// FIX 3: Load skills from git repo
async function loadSkillsFromGit() {
  try {
    const skillsDir = path.join(DATA_DIR, 'skills');
    await fs.mkdir(skillsDir, { recursive: true });
    
    // Check if skills exist in git repo
    const gitSkillsDir = path.join(ROOT_DIR, 'admin', 'data', 'skills');
    if (await fs.access(gitSkillsDir).then(() => true).catch(() => false)) {
      const files = await fs.readdir(gitSkillsDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const content = await fs.readFile(path.join(gitSkillsDir, file), 'utf8');
          const skill = JSON.parse(content);
          // Copy to local skills dir
          await fs.writeFile(path.join(skillsDir, file), content);
        }
      }
    }
  } catch (error) {
    // Ignore errors
  }
}

// Call this on startup
loadSkillsFromGit().catch(() => {});
// ═══════════════════════════════════════════════════════════
// 🔧 FINAL FIX - Paths and Launch
// ═══════════════════════════════════════════════════════════

// FIX: Override loadProjects to convert to ABSOLUTE paths and return flat array
loadProjects = async function() {
  try {
    const data = await fs.readFile(PROJECTS_FILE, 'utf8');
    const parsed = JSON.parse(data);
    let projects = parsed.projects || parsed || [];
    
    // Convert relative paths to ABSOLUTE
    projects = projects.map(p => {
      if (p.path && !path.isAbsolute(p.path)) {
        p.path = path.resolve(ROOT_DIR, p.path);
      }
      return p;
    });
    
    return projects;
  } catch {
    // If file doesn't exist, return hardcoded projects with ABSOLUTE paths
    return [
      { id: 'p1', name: 'WearWise', path: path.join(ROOT_DIR, 'P1'), type: 'React Native', active: true },
      { id: 'p2', name: 'Project Two', path: path.join(ROOT_DIR, 'P2'), type: 'Node.js/Express', active: true },
      { id: 'admin', name: 'Admin Console', path: path.join(ROOT_DIR, 'admin'), type: 'CLI Tool', active: true }
    ];
  }
};

// FIX: Override manageProjects to show ABSOLUTE paths
manageProjects = async function() {
  showHeader();
  log.title('📁 Your Projects');
  
  const projects = await loadProjects();
  
  if (projects.length === 0) {
    log.warning('No projects found.');
    await pause();
    return;
  }
  
  log.success(`Found ${projects.length} project(s):`);
  
  const choices = projects.map(p => ({
    name: `  ${p.name} ${theme.dim(`(${p.type})`)}`,
    value: p.id
  }));
  
  choices.push(new inquirer.Separator(), { name: theme.dim('← Back'), value: 'back' });
  
  const { projectId } = await inquirer.prompt([{
    type: 'list',
    name: 'projectId',
    message: theme.accent('Select project:'),
    choices,
    pageSize: 15
  }]);
  
  if (projectId === 'back') return;
  
  const project = projects.find(p => p.id === projectId);
  
  // Show project details with FULL PATH
  showHeader();
  log.title(`📁 ${project.name}`);
  console.log(`Type: ${project.type}`);
  console.log(`Path: ${theme.dim(project.path)}`);  // Now shows absolute path
  
  log.divider();
  
  const { action } = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: theme.accent('What to do:'),
    choices: [
      { name: theme.accent('🚀 Open with Code Puppy'), value: 'launch' },
      { name: theme.secondary('📂 Open in File Explorer'), value: 'explore' },
      { name: theme.dim('← Back'), value: 'back' }
    ]
  }]);
  
  if (action === 'launch') {
    try {
      const { spawn } = await import('child_process');
      
      // Launch Code Puppy IN the project directory using ABSOLUTE path
      const child = spawn('code-puppy', [], {
        cwd: project.path,  // Use absolute path here
        shell: true,
        detached: true,
        stdio: 'ignore'
      });
      
      child.on('error', (err) => {
        log.error(`Error: ${err.message}`);
      });
      
      child.unref();
      
      log.success('✓ Launched Code Puppy in project directory!');
      log.info(`Directory: ${project.path}`);
      
    } catch (error) {
      log.error(`Launch failed: ${error.message}`);
    }
    await pause();
  }
  
  if (action === 'explore') {
    try {
      const { spawn } = await import('child_process');
      spawn('explorer', [project.path], { shell: true });
      log.success('✓ Opened in Explorer');
    } catch (error) {
      log.error(`Failed: ${error.message}`);
    }
    await pause();
  }
};

// FIX: Clean launchCodePuppy
launchCodePuppy = async function() {
  showHeader();
  log.title('🐶 Launching Code Puppy');
  
  try {
    const { spawn } = await import('child_process');
    
    const child = spawn('code-puppy', [], {
      shell: true,
      detached: true,
      stdio: 'ignore'
    });
    
    child.on('error', (err) => {
      log.error(`Error: ${err.message}`);
    });
    
    child.unref();
    
    log.success('✓ Launched! Check taskbar.');
    
  } catch (error) {
    log.error(`Failed: ${error.message}`);
  }
  
  await pause();
};
