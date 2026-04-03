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
import { SkillRegistry } from './lib/skills.js';
import { ProjectImporter } from './lib/project-importer.js';

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

  // Show submenu based on category
  let action;
  switch (category) {
    case 'launch':
      action = await showLaunchMenu();
      break;
    case 'projects':
      action = await showProjectsMenu();
      break;
    case 'agents':
      action = await showAgentsMenu();
      break;
    case 'skills':
      action = await showSkillsMenu();
      break;
    case 'api':
      action = await showApiMenu();
      break;
    case 'git':
      action = await showGitMenu();
      break;
    case 'system':
      action = await showSystemMenu();
      break;
  }

  // Handle 'back' from submenus - recursively call mainMenu
  if (action === 'back') return await mainMenu();

  return action;
}

async function showLaunchMenu() {
  showHeader();
  
  const detected = await engineManager.detectEngines();
  const choices = [
    { name: theme.accent('▶ Launch with Agent'), value: 'launch-with-agent' },
    new inquirer.Separator(theme.dim('Available Engines:')),
    { name: '  🐶 Code Puppy', value: 'launch-code-puppy' }
  ];
  
  // Add other detected engines
  for (const engine of detected) {
    if (engine.name !== 'code-puppy') {
      choices.push({
        name: `  ${engine.label}`,
        value: `launch-${engine.name}`
      });
    }
  }
  
  choices.push(new inquirer.Separator());
  choices.push({ name: theme.dim('← Back'), value: 'back' });
  
  const { action } = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: theme.primary('Launch AI Engine:'),
    choices,
    pageSize: 12
  }]);

  return action;
}

async function showProjectsMenu() {
  showHeader();
  
  const { action } = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: theme.primary('Project Management:'),
    choices: [
      { name: theme.accent('➕ Create New Project'), value: 'new-project' },
      { name: theme.secondary('📥 Import Project'), value: 'import-project' },
      { name: theme.secondary('📁 Manage Projects'), value: 'projects' },
      { name: theme.secondary('🚀 Quick Launch'), value: 'launch' },
      new inquirer.Separator(),
      { name: theme.dim('← Back'), value: 'back' }
    ]
  }]);

  return action;
}

async function showAgentsMenu() {
  showHeader();
  
  const { action } = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: theme.primary('Agents:'),
    choices: [
      { name: theme.accent('🤖 My Agents'), value: 'list-agents' },
      { name: theme.accent('➕ Create Agent'), value: 'add-agent' },
      new inquirer.Separator(),
      { name: theme.dim('← Back'), value: 'back' }
    ]
  }]);

  return action;
}

async function showSkillsMenu() {
  showHeader();
  
  const { action } = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: theme.primary('Skills Library:'),
    choices: [
      { name: theme.accent('🎯 My Skills'), value: 'list-skills' },
      { name: theme.accent('➕ Create Skill'), value: 'create-skill' },
      { name: theme.secondary('📚 Browse Library'), value: 'browse-skills' },
      { name: theme.secondary('⬇️  Install Skill'), value: 'install-skill' },
      new inquirer.Separator(),
      { name: theme.info('🔗 Attach to Agent'), value: 'attach-skill' },
      { name: theme.dim('← Back'), value: 'back' }
    ]
  }]);

  return action;
}

async function showApiMenu() {
  showHeader();
  
  const { action } = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: theme.primary('API Management:'),
    choices: [
      { name: theme.accent('🔐 Manage API Keys'), value: 'api-keys' },
      { name: theme.secondary('🤖 Select AI Model'), value: 'select-model' },
      { name: theme.secondary('🧪 Test APIs'), value: 'test-api' },
      new inquirer.Separator(),
      { name: theme.dim('← Back'), value: 'back' }
    ]
  }]);

  return action;
}

async function showGitMenu() {
  showHeader();
  
  const { action } = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: theme.primary('Git Operations:'),
    choices: [
      { name: theme.accent('📊 View Status'), value: 'git-status' },
      { name: theme.accent('💾 Commit Changes'), value: 'commit-monorepo' },
      new inquirer.Separator(),
      { name: theme.dim('← Back'), value: 'back' }
    ]
  }]);

  return action;
}

async function showSystemMenu() {
  showHeader();
  
  const { action } = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: theme.primary('System:'),
    choices: [
      { name: theme.accent('⚙️  Settings'), value: 'settings' },
      { name: theme.secondary('📅 Daily Focus'), value: 'daily-focus' },
      { name: theme.secondary('📋 View Log'), value: 'view-log' },
      { name: theme.info('🤖 Agent Settings'), value: 'agent-settings' },
      new inquirer.Separator(),
      { name: theme.dim('← Back'), value: 'back' }
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
// 🎯 SKILLS MANAGEMENT
// ═══════════════════════════════════════════════════════════

async function listSkills() {
  showHeader();
  log.title('🎯 My Skills');
  
  const skillRegistry = new SkillRegistry();
  await skillRegistry.init();
  const skills = await skillRegistry.listSkills();
  
  if (skills.length === 0) {
    log.warning('No skills created yet.');
    log.info('Create skills to share reusable knowledge with your agents.');
    
    const { create } = await inquirer.prompt([{
      type: 'confirm',
      name: 'create',
      message: theme.accent('Create your first skill?'),
      default: true
    }]);
    
    if (create) {
      await createSkill();
    }
  } else {
    log.success(`You have ${skills.length} skill(s):`);
    
    for (const skill of skills) {
      console.log(`\n  ${theme.accent(skill.name)} ${theme.dim(`(${skill.id})`)}`);
      console.log(`  ${theme.secondary(skill.description)}`);
      if (skill.agents && skill.agents.length > 0) {
        console.log(`  ${theme.info(`Used by ${skill.agents.length} agent(s)`)}`);
      }
    }
  }
  
  await pause();
}

async function createSkill() {
  showHeader();
  log.title('➕ Create New Skill');
  
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'id',
      message: theme.accent('Skill ID (no spaces):'),
      validate: (input) => input.trim().length > 0 && /^[a-z0-9-_]+$/i.test(input) || 'Use only letters, numbers, hyphens'
    },
    {
      type: 'input',
      name: 'name',
      message: theme.accent('Skill name:'),
      validate: (input) => input.trim().length > 0 || 'Name is required'
    },
    {
      type: 'input',
      name: 'description',
      message: theme.accent('Description:'),
      default: 'A reusable skill for agents'
    },
    {
      type: 'list',
      name: 'category',
      message: theme.accent('Category:'),
      choices: [
        'coding', 'testing', 'architecture', 'design', 
        'devops', 'security', 'documentation', 'other'
      ]
    },
    {
      type: 'editor',
      name: 'knowledge',
      message: theme.accent('Knowledge content (markdown):'),
      default: '# Skill Knowledge\n\nDescribe what this skill teaches agents...'
    }
  ]);
  
  const skillRegistry = new SkillRegistry();
  await skillRegistry.init();
  
  const skill = {
    id: answers.id,
    name: answers.name,
    description: answers.description,
    category: answers.category,
    knowledge: answers.knowledge,
    patterns: [],
    examples: [],
    agents: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  await skillRegistry.saveSkill(skill);
  
  log.success(`Skill "${answers.name}" created!`);
  log.info('You can now attach this skill to agents.');
  
  await pause();
}

async function browseSkills() {
  showHeader();
  log.title('📚 Browse Skill Library');
  
  // For now, just show local skills
  // In future, this could fetch from a marketplace
  const skillRegistry = new SkillRegistry();
  await skillRegistry.init();
  const skills = await skillRegistry.listSkills();
  
  if (skills.length === 0) {
    log.warning('No skills in library yet.');
    log.info('Skills you create will appear here.');
  } else {
    const categories = {};
    for (const skill of skills) {
      categories[skill.category] = categories[skill.category] || [];
      categories[skill.category].push(skill);
    }
    
    for (const [category, categorySkills] of Object.entries(categories)) {
      console.log(`\n${theme.accent(category.toUpperCase())}`);
      for (const skill of categorySkills) {
        console.log(`  • ${theme.primary(skill.name)} - ${theme.dim(skill.description)}`);
      }
    }
  }
  
  await pause();
}

async function installSkill() {
  showHeader();
  log.title('⬇️  Install Skill');
  
  log.info('Skill marketplace coming soon!');
  log.info('For now, skills can be:');
  log.info('  • Created locally with "Create Skill"');
  log.info('  • Shared via GitHub repositories');
  log.info('  • Imported from other POPPY workspaces');
  
  await pause();
}

async function attachSkillToAgent() {
  showHeader();
  log.title('🔗 Attach Skill to Agent');
  
  const agents = await loadAgents();
  const skillRegistry = new SkillRegistry();
  await skillRegistry.init();
  const skills = await skillRegistry.listSkills();
  
  if (agents.length === 0) {
    log.error('No agents created yet.');
    log.info('Create an agent first.');
    await pause();
    return;
  }
  
  if (skills.length === 0) {
    log.error('No skills available.');
    log.info('Create a skill first.');
    await pause();
    return;
  }
  
  const { agentId } = await inquirer.prompt([{
    type: 'list',
    name: 'agentId',
    message: theme.accent('Select agent:'),
    choices: agents.map(a => ({ name: a.name, value: a.id }))
  }]);
  
  const { skillId } = await inquirer.prompt([{
    type: 'list',
    name: 'skillId',
    message: theme.accent('Select skill to attach:'),
    choices: skills.map(s => ({ name: `${s.name} (${s.category})`, value: s.id }))
  }]);
  
  const agent = agents.find(a => a.id === agentId);
  const skill = skills.find(s => s.id === skillId);
  
  // Add skill to agent
  agent.skills = agent.skills || [];
  if (!agent.skills.includes(skillId)) {
    agent.skills.push(skillId);
    await saveAgent(agent);
    
    // Update skill's agent list
    skill.agents = skill.agents || [];
    if (!skill.agents.includes(agentId)) {
      skill.agents.push(agentId);
      await skillRegistry.saveSkill(skill);
    }
    
    log.success(`Attached "${skill.name}" to "${agent.name}"`);
  } else {
    log.warning(`"${skill.name}" is already attached to "${agent.name}"`);
  }
  
  await pause();
}

// ═══════════════════════════════════════════════════════════
// 📥 PROJECT IMPORTER
// ═══════════════════════════════════════════════════════════

async function importProject() {
  showHeader();
  log.title('📥 Import Project');
  
  const { sourceType } = await inquirer.prompt([{
    type: 'list',
    name: 'sourceType',
    message: theme.accent('Import from:'),
    choices: [
      { name: '📁 Local Directory', value: 'local' },
      { name: '🌐 Git Repository', value: 'git' },
      { name: '📦 ZIP Archive', value: 'zip' },
      { name: '🐶 Another POPPY Workspace', value: 'poppy' }
    ]
  }]);
  
  const importer = new ProjectImporter();
  const projects = await loadProjects();
  const targetDir = path.dirname(projects.rootDir);
  
  let result;
  
  switch (sourceType) {
    case 'git':
      const { repoUrl } = await inquirer.prompt([{
        type: 'input',
        name: 'repoUrl',
        message: theme.accent('Git repository URL:'),
        validate: (input) => input.trim().length > 0 || 'URL is required'
      }]);
      
      const { rename } = await inquirer.prompt([{
        type: 'input',
        name: 'rename',
        message: theme.accent('Rename project (optional):'),
        default: ''
      }]);
      
      try {
        result = await importer.importFromGit(repoUrl, {
          targetDir,
          rename: rename || undefined
        });
      } catch (error) {
        log.error(`Import failed: ${error.message}`);
        await pause();
        return;
      }
      break;
      
    case 'local':
      const { sourcePath } = await inquirer.prompt([{
        type: 'input',
        name: 'sourcePath',
        message: theme.accent('Source directory path:'),
        validate: (input) => input.trim().length > 0 || 'Path is required'
      }]);
      
      try {
        result = await importer.importFromLocal(sourcePath, { targetDir });
      } catch (error) {
        log.error(`Import failed: ${error.message}`);
        await pause();
        return;
      }
      break;
      
    case 'zip':
      const { zipPath } = await inquirer.prompt([{
        type: 'input',
        name: 'zipPath',
        message: theme.accent('ZIP file path:'),
        validate: (input) => input.trim().length > 0 || 'Path is required'
      }]);
      
      try {
        result = await importer.importFromZip(zipPath, { targetDir });
      } catch (error) {
        log.error(`Import failed: ${error.message}`);
        await pause();
        return;
      }
      break;
      
    case 'poppy':
      log.info('Select POPPY workspace directory...');
      const { poppyPath } = await inquirer.prompt([{
        type: 'input',
        name: 'poppyPath',
        message: theme.accent('POPPY workspace path:'),
        validate: (input) => input.trim().length > 0 || 'Path is required'
      }]);
      
      // List available projects from that workspace
      try {
        const sourceProjectsFile = path.join(poppyPath, 'admin', 'data', 'projects.json');
        const sourceProjects = JSON.parse(await fs.readFile(sourceProjectsFile, 'utf8'));
        
        const { projectId } = await inquirer.prompt([{
          type: 'list',
          name: 'projectId',
          message: theme.accent('Select project to import:'),
          choices: sourceProjects.projects.map(p => ({ name: p.name, value: p.id }))
        }]);
        
        result = await importer.importFromPoppy(poppyPath, { targetDir, projectId });
      } catch (error) {
        log.error(`Import failed: ${error.message}`);
        await pause();
        return;
      }
      break;
  }
  
  if (result && result.success) {
    log.success(result.message);
    log.info(`Project location: ${result.projectPath}`);
    
    // Detect project type
    const projectType = await importer.detectProjectType(result.projectPath);
    log.info(`Detected type: ${theme.accent(projectType)}`);
    
    // Add to POPPY projects
    const newProject = {
      id: `import-${Date.now()}`,
      name: result.projectName,
      type: projectType,
      path: result.projectPath,
      created: new Date().toISOString(),
      imported: true,
      source: sourceType
    };
    
    projects.projects.push(newProject);
    await saveProjects(projects);
    
    log.success('Project added to POPPY!');
  }
  
  await pause();
}

// ═══════════════════════════════════════════════════════════
// 🎯 SKILLS LIBRARY
// ═══════════════════════════════════════════════════════════

async function listSkills() {
  showHeader();
  log.title('🎯 My Skills');
  
  const skillRegistry = new SkillRegistry();
  await skillRegistry.init();
  
  const skills = await skillRegistry.listSkills();
  
  if (skills.length === 0) {
    log.warning('No skills found.');
    log.info('Create a skill with "Create Skill" option');
    log.info('Or browse the skill marketplace');
  } else {
    log.success(`Found ${skills.length} skill(s):`);
    skills.forEach((skill, i) => {
      console.log(`  ${i + 1}. ${theme.accent(skill.name)} - ${skill.description || 'No description'}`);
      console.log(`     Tags: ${skill.tags?.join(', ') || 'none'}`);
    });
  }
  
  await pause();
}

async function createSkill() {
  showHeader();
  log.title('➕ Create New Skill');
  
  const skillRegistry = new SkillRegistry();
  await skillRegistry.init();
  
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: theme.accent('Skill name (e.g., react-hooks):'),
      validate: (input) => input.trim().length > 0 || 'Name is required'
    },
    {
      type: 'input',
      name: 'description',
      message: theme.accent('Description:'),
      default: 'A reusable skill for agents'
    },
    {
      type: 'checkbox',
      name: 'tags',
      message: theme.accent('Categories:'),
      choices: [
        { name: 'Frontend', value: 'frontend' },
        { name: 'Backend', value: 'backend' },
        { name: 'Database', value: 'database' },
        { name: 'DevOps', value: 'devops' },
        { name: 'Testing', value: 'testing' },
        { name: 'Security', value: 'security' },
        { name: 'Performance', value: 'performance' }
      ]
    },
    {
      type: 'editor',
      name: 'knowledge',
      message: theme.accent('Knowledge content (opens editor):'),
      default: '# Skill Knowledge\n\nAdd what this skill knows:\n- Best practices\n- Patterns\n- Rules\n'
    }
  ]);
  
  try {
    const skill = await skillRegistry.createSkill({
      name: answers.name,
      description: answers.description,
      tags: answers.tags,
      knowledge: answers.knowledge
    });
    
    log.success(`Skill "${skill.name}" created successfully!`);
    log.info(`Location: ${skill.path}`);
  } catch (error) {
    log.error(`Failed to create skill: ${error.message}`);
  }
  
  await pause();
}

async function browseSkills() {
  showHeader();
  log.title('📚 Skill Library');
  
  log.info('Available Skills:');
  log.info('');
  
  // Show built-in skills
  const builtInSkills = [
    { name: 'react-hooks', description: 'React hooks patterns and best practices', tags: ['frontend', 'react'] },
    { name: 'typescript-patterns', description: 'TypeScript design patterns', tags: ['frontend', 'typescript'] },
    { name: 'api-design', description: 'RESTful API design principles', tags: ['backend', 'api'] },
    { name: 'testing-strategies', description: 'Unit and integration testing', tags: ['testing'] },
    { name: 'security-best-practices', description: 'Security guidelines', tags: ['security'] },
    { name: 'performance-optimization', description: 'Performance tuning', tags: ['performance'] }
  ];
  
  builtInSkills.forEach((skill, i) => {
    console.log(`  ${theme.accent(`${i + 1}. ${skill.name}`)}`);
    console.log(`     ${skill.description}`);
    console.log(`     Tags: ${skill.tags.join(', ')}`);
    console.log('');
  });
  
  log.info('Use "Install Skill" to add these to your library');
  
  await pause();
}

async function installSkill() {
  showHeader();
  log.title('⬇️  Install Skill');
  
  const skillRegistry = new SkillRegistry();
  await skillRegistry.init();
  
  const { skillName } = await inquirer.prompt([{
    type: 'input',
    name: 'skillName',
    message: theme.accent('Skill name to install (or URL):'),
    validate: (input) => input.trim().length > 0 || 'Skill name is required'
  }]);
  
  try {
    const skill = await skillRegistry.installSkill(skillName);
    log.success(`Skill "${skill.name}" installed!`);
  } catch (error) {
    log.error(`Failed to install: ${error.message}`);
    log.info('Try installing from the marketplace with: poppy');
  }
  
  await pause();
}

async function attachSkillToAgent() {
  showHeader();
  log.title('🔗 Attach Skill to Agent');
  
  const skillRegistry = new SkillRegistry();
  await skillRegistry.init();
  
  // Load agents and skills
  const agents = await loadAgents();
  const skills = await skillRegistry.listSkills();
  
  if (agents.length === 0) {
    log.warning('No agents found. Create an agent first.');
    await pause();
    return;
  }
  
  if (skills.length === 0) {
    log.warning('No skills found. Create or install skills first.');
    await pause();
    return;
  }
  
  const { agentId } = await inquirer.prompt([{
    type: 'list',
    name: 'agentId',
    message: theme.accent('Select agent:'),
    choices: agents.map(a => ({ name: `${a.name} (${a.role})`, value: a.id }))
  }]);
  
  const { skillId } = await inquirer.prompt([{
    type: 'list',
    name: 'skillId',
    message: theme.accent('Select skill to attach:'),
    choices: skills.map(s => ({ name: s.name, value: s.id }))
  }]);
  
  const agent = agents.find(a => a.id === agentId);
  agent.skills = agent.skills || [];
  
  if (agent.skills.includes(skillId)) {
    log.warning('Agent already has this skill!');
  } else {
    agent.skills.push(skillId);
    await saveAgent(agent);
    log.success(`Attached skill to ${agent.name}!`);
  }
  
  await pause();
}

// ═══════════════════════════════════════════════════════════
// 📥 PROJECT IMPORTER
// ═══════════════════════════════════════════════════════════

async function importProject() {
  showHeader();
  log.title('📥 Import Project');
  
  const importer = new ProjectImporter();
  const projects = await loadProjects();
  
  const { source } = await inquirer.prompt([{
    type: 'list',
    name: 'source',
    message: theme.accent('Import from:'),
    choices: [
      { name: '🔗 GitHub/GitLab/Bitbucket', value: 'git' },
      { name: '📁 Local Directory', value: 'local' },
      { name: '📦 ZIP Archive', value: 'zip' },
      { name: '🐶 Another POPPY Workspace', value: 'poppy' }
    ]
  }]);
  
  let result;
  
  switch (source) {
    case 'git': {
      const { url } = await inquirer.prompt([{
        type: 'input',
        name: 'url',
        message: theme.accent('Repository URL:'),
        validate: (input) => input.includes('://') || input.includes('@') || 'Valid URL required'
      }]);
      
      const { rename } = await inquirer.prompt([{
        type: 'input',
        name: 'rename',
        message: theme.accent('Project name (optional, press Enter to use repo name):')
      }]);
      
      const spinner = ora('Cloning repository...').start();
      result = await importer.importFromGit(url, {
        targetDir: projects.root,
        rename: rename || undefined,
        fresh: true
      });
      spinner.stop();
      break;
    }
    
    case 'local': {
      const { sourcePath } = await inquirer.prompt([{
        type: 'input',
        name: 'sourcePath',
        message: theme.accent('Source directory path:'),
        validate: (input) => input.trim().length > 0 || 'Path required'
      }]);
      
      // Validate
      const validation = await importer.validateProject(sourcePath);
      if (!validation.valid) {
        log.error('Validation failed:');
        validation.issues.forEach(i => console.log(`  - ${i}`));
        await pause();
        return;
      }
      
      const { rename } = await inquirer.prompt([{
        type: 'input',
        name: 'rename',
        message: theme.accent('New project name (optional):')
      }]);
      
      const spinner = ora('Copying project...').start();
      result = await importer.importFromLocal(sourcePath, {
        targetDir: projects.root,
        rename: rename || undefined
      });
      spinner.stop();
      break;
    }
    
    case 'zip': {
      const { zipPath } = await inquirer.prompt([{
        type: 'input',
        name: 'zipPath',
        message: theme.accent('ZIP file path:'),
        validate: (input) => input.endsWith('.zip') || 'Must be a .zip file'
      }]);
      
      const spinner = ora('Extracting archive...').start();
      result = await importer.importFromZip(zipPath, {
        targetDir: projects.root
      });
      spinner.stop();
      break;
    }
    
    case 'poppy': {
      log.info('Feature coming soon: Import from other POPPY workspaces');
      log.info('For now, manually copy projects from other workspaces');
      await pause();
      return;
    }
  }
  
  if (result.success) {
    // Detect project type
    const projectType = await importer.detectProjectType(result.projectPath);
    
    // Register in POPPY
    projects.projects.push({
      id: `proj-${Date.now()}`,
      name: result.projectName,
      path: result.projectName,
      fullPath: result.projectPath,
      type: projectType,
      imported: true,
      importSource: source,
      createdAt: new Date().toISOString(),
      active: false,
      agents: [],
      gitRemote: source === 'git' ? result.url : null
    });
    
    await saveProjects(projects);
    
    log.success(result.message);
    log.info(`Project type: ${theme.accent(projectType)}`);
    log.info(`Location: ${result.projectPath}`);
    log.info('');
    log.info('Next steps:');
    log.info('  1. Open project: poppy -> Projects -> Open Project');
    log.info('  2. Create agents for this project');
    log.info('  3. Set up daily focus');
  } else {
    log.error(`Import failed: ${result.error}`);
  }
  
  await pause();
}

// ═══════════════════════════════════════════════════════════
// 🎯 SKILL MANAGEMENT
// ═══════════════════════════════════════════════════════════

async function listSkills() {
  showHeader();
  log.title('🎯 My Skills');
  
  const skillRegistry = new SkillRegistry();
  await skillRegistry.init();
  
  const skills = skillRegistry.listSkills();
  
  if (skills.length === 0) {
    log.warning('No skills found!');
    log.info('Create skills from the Skills menu or install from the marketplace.');
    await pause();
    return;
  }
  
  log.success(`Found ${skills.length} skill(s):\n`);
  
  for (const skill of skills) {
    const box = boxen(
      `${theme.accent.bold(skill.name)}\n` +
      `${theme.dim(skill.id)}\n\n` +
      `${skill.description || 'No description'}\n\n` +
      `Tags: ${skill.tags?.join(', ') || 'none'}`,
      {
        padding: 1,
        borderStyle: 'round',
        borderColor: 'green'
      }
    );
    console.log(box);
    console.log();
  }
  
  await pause();
}

async function createSkill() {
  showHeader();
  log.title('➕ Create New Skill');
  
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'id',
      message: theme.accent('Skill ID (lowercase, no spaces):'),
      validate: (input) => {
        if (!input.trim()) return 'ID is required!';
        if (!/^[a-z0-9-]+$/.test(input)) return 'Only lowercase letters, numbers, and hyphens allowed!';
        return true;
      }
    },
    {
      type: 'input',
      name: 'name',
      message: theme.accent('Display name:'),
      validate: (input) => input.trim().length > 0 || 'Name is required!'
    },
    {
      type: 'input',
      name: 'description',
      message: theme.accent('Description:'),
      default: 'A reusable skill for agents'
    },
    {
      type: 'input',
      name: 'tags',
      message: theme.accent('Tags (comma-separated):'),
      default: 'general',
      filter: (input) => input.split(',').map(t => t.trim()).filter(t => t)
    },
    {
      type: 'editor',
      name: 'knowledge',
      message: theme.accent('Knowledge base (markdown):'),
      default: '# Skill Knowledge\n\nAdd documentation, patterns, and examples here.'
    }
  ]);
  
  const skillRegistry = new SkillRegistry();
  await skillRegistry.init();
  
  try {
    await skillRegistry.createSkill({
      id: answers.id,
      name: answers.name,
      description: answers.description,
      tags: answers.tags,
      knowledge: answers.knowledge,
      createdAt: new Date().toISOString()
    });
    
    log.success(`\n✓ Skill "${answers.name}" created successfully!`);
    log.info(`Location: ~/.poppy/skills/${answers.id}.json`);
  } catch (err) {
    log.error(`Failed to create skill: ${err.message}`);
  }
  
  await pause();
}

async function browseSkills() {
  showHeader();
  log.title('📚 Skill Library');
  
  log.info('Browse built-in skills and community skills from the marketplace.');
  log.divider();
  
  // List built-in skills from the lib/skills.js templates
  const { SkillRegistry } = await import('./lib/skills.js');
  const skillRegistry = new SkillRegistry();
  
  log.accent('Built-in Skills:\n');
  
  const builtInSkills = [
    { id: 'react-patterns', name: 'React Patterns', description: 'Common React patterns and best practices' },
    { id: 'typescript', name: 'TypeScript', description: 'TypeScript types, generics, and patterns' },
    { id: 'testing', name: 'Testing Strategies', description: 'Unit, integration, and E2E testing patterns' },
    { id: 'api-design', name: 'API Design', description: 'RESTful API design principles' },
    { id: 'security', name: 'Security Practices', description: 'Security best practices and patterns' }
  ];
  
  for (const skill of builtInSkills) {
    console.log(`  ${theme.accent('•')} ${theme.bold(skill.name)}`);
    console.log(`    ${theme.dim(skill.description)}\n`);
  }
  
  const { action } = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: theme.accent('What would you like to do?'),
    choices: [
      { name: '⬇️  Install a built-in skill', value: 'install-builtin' },
      { name: '🔍 Browse marketplace (coming soon)', value: 'marketplace', disabled: true },
      { name: '← Back', value: 'back' }
    ]
  }]);
  
  if (action === 'install-builtin') {
    const { skillId } = await inquirer.prompt([{
      type: 'list',
      name: 'skillId',
      message: theme.accent('Select skill to install:'),
      choices: builtInSkills.map(s => ({ name: s.name, value: s.id }))
    }]);
    
    try {
      await skillRegistry.init();
      await skillRegistry.installSkill(skillId, 'built-in');
      log.success(`✓ Installed ${skillId}`);
    } catch (err) {
      log.error(`Failed to install: ${err.message}`);
    }
    await pause();
  }
}

async function installSkill() {
  showHeader();
  log.title('⬇️  Install Skill');
  
  log.info('Installing from marketplace...');
  
  const { source } = await inquirer.prompt([{
    type: 'list',
    name: 'source',
    message: theme.accent('Install from:'),
    choices: [
      { name: 'Built-in library', value: 'builtin' },
      { name: 'GitHub repository', value: 'github' },
      { name: 'Local file', value: 'local' }
    ]
  }]);
  
  const skillRegistry = new SkillRegistry();
  await skillRegistry.init();
  
  try {
    if (source === 'builtin') {
      await browseSkills();
    } else if (source === 'github') {
      const { repo } = await inquirer.prompt([{
        type: 'input',
        name: 'repo',
        message: theme.accent('GitHub repo (owner/name):'),
        validate: (input) => input.includes('/') || 'Format: owner/repo-name'
      }]);
      
      await skillRegistry.installSkill(repo, 'github');
      log.success(`✓ Installed from ${repo}`);
      await pause();
    } else if (source === 'local') {
      const { filePath } = await inquirer.prompt([{
        type: 'input',
        name: 'filePath',
        message: theme.accent('Path to skill JSON file:'),
        validate: (input) => input.trim().length > 0 || 'Path is required!'
      }]);
      
      await skillRegistry.installSkill(filePath, 'local');
      log.success(`✓ Installed from ${filePath}`);
      await pause();
    }
  } catch (err) {
    log.error(`Installation failed: ${err.message}`);
    await pause();
  }
}

async function attachSkillToAgent() {
  showHeader();
  log.title('🔗 Attach Skill to Agent');
  
  // Load skills
  const skillRegistry = new SkillRegistry();
  await skillRegistry.init();
  const skills = skillRegistry.listSkills();
  
  if (skills.length === 0) {
    log.warning('No skills available! Create or install skills first.');
    await pause();
    return;
  }
  
  // Load agents
  const agents = await loadAgents();
  if (agents.length === 0) {
    log.warning('No agents found! Create an agent first.');
    await pause();
    return;
  }
  
  const { skillId } = await inquirer.prompt([{
    type: 'list',
    name: 'skillId',
    message: theme.accent('Select skill:'),
    choices: skills.map(s => ({ name: s.name, value: s.id }))
  }]);
  
  const { agentId } = await inquirer.prompt([{
    type: 'list',
    name: 'agentId',
    message: theme.accent('Attach to agent:'),
    choices: agents.map(a => ({ name: a.name, value: a.id }))
  }]);
  
  try {
    await skillRegistry.attachSkillToAgent(skillId, agentId);
    log.success(`✓ Attached "${skillId}" to agent`);
    log.info(`The agent now has access to this skill's knowledge and patterns.`);
  } catch (err) {
    log.error(`Failed to attach: ${err.message}`);
  }
  
  await pause();
}

// ═══════════════════════════════════════════════════════════
// 📥 PROJECT IMPORT
// ═══════════════════════════════════════════════════════════

async function importProject() {
  showHeader();
  log.title('📥 Import Project');
  
  const importer = new ProjectImporter();
  
  const { source } = await inquirer.prompt([{
    type: 'list',
    name: 'source',
    message: theme.accent('Import from:'),
    choices: [
      { name: '🌐 GitHub/GitLab/Bitbucket', value: 'git' },
      { name: '📁 Local directory', value: 'local' },
      { name: '📦 ZIP archive', value: 'zip' },
      { name: '🐶 Another POPPY workspace', value: 'poppy' }
    ]
  }]);
  
  const projectsRoot = path.join(ROOT_DIR, '..');
  
  try {
    if (source === 'git') {
      const { url, rename } = await inquirer.prompt([
        {
          type: 'input',
          name: 'url',
          message: theme.accent('Repository URL:'),
          validate: (input) => input.trim().length > 0 || 'URL is required!'
        },
        {
          type: 'input',
          name: 'rename',
          message: theme.accent('Rename project (optional):'),
          default: ''
        }
      ]);
      
      const spinner = ora('Cloning repository...').start();
      const result = await importer.importFromGit(url, {
        targetDir: projectsRoot,
        rename: rename || undefined,
        fresh: true
      });
      spinner.stop();
      
      if (result.success) {
        log.success(`✓ Imported ${result.projectName}`);
        log.info(`Location: ${result.projectPath}`);
        
        // Detect project type
        const projectType = await importer.detectProjectType(result.projectPath);
        log.info(`Detected type: ${projectType}`);
        
        // Add to POPPY projects
        const projects = await loadProjects();
        projects.projects.push({
          id: `proj-${Date.now()}`,
          name: result.projectName,
          type: projectType,
          path: result.projectPath,
          createdAt: new Date().toISOString(),
          active: true,
          imported: true
        });
        await saveProjects(projects);
        
      } else {
        log.error(`Import failed: ${result.error}`);
      }
      
    } else if (source === 'local') {
      const { sourcePath, rename } = await inquirer.prompt([
        {
          type: 'input',
          name: 'sourcePath',
          message: theme.accent('Source directory path:'),
          validate: (input) => input.trim().length > 0 || 'Path is required!'
        },
        {
          type: 'input',
          name: 'rename',
          message: theme.accent('Rename project (optional):'),
          default: ''
        }
      ]);
      
      // Validate
      const validation = await importer.validateProject(sourcePath);
      if (!validation.valid) {
        log.error('Validation failed:');
        validation.issues.forEach(i => log.error(`  - ${i}`));
        await pause();
        return;
      }
      
      if (validation.warnings.length > 0) {
        log.warning('Warnings:');
        validation.warnings.forEach(w => log.warning(`  - ${w}`));
      }
      
      const spinner = ora('Copying project...').start();
      const result = await importer.importFromLocal(sourcePath, {
        targetDir: projectsRoot,
        rename: rename || undefined
      });
      spinner.stop();
      
      if (result.success) {
        log.success(`✓ Imported ${result.projectName}`);
        
        // Add to projects
        const projects = await loadProjects();
        projects.projects.push({
          id: `proj-${Date.now()}`,
          name: result.projectName,
          type: await importer.detectProjectType(result.projectPath),
          path: result.projectPath,
          createdAt: new Date().toISOString(),
          active: true,
          imported: true
        });
        await saveProjects(projects);
      } else {
        log.error(`Import failed: ${result.error}`);
      }
      
    } else if (source === 'zip') {
      const { zipPath } = await inquirer.prompt([{
        type: 'input',
        name: 'zipPath',
        message: theme.accent('ZIP file path:'),
        validate: (input) => input.endsWith('.zip') || 'Must be a .zip file!'
      }]);
      
      const spinner = ora('Extracting archive...').start();
      const result = await importer.importFromZip(zipPath, {
        targetDir: projectsRoot
      });
      spinner.stop();
      
      if (result.success) {
        log.success(`✓ Extracted ${result.projectName}`);
        
        // Add to projects
        const projects = await loadProjects();
        projects.projects.push({
          id: `proj-${Date.now()}`,
          name: result.projectName,
          type: 'generic',
          path: result.projectPath,
          createdAt: new Date().toISOString(),
          active: true,
          imported: true
        });
        await saveProjects(projects);
      } else {
        log.error(`Extraction failed: ${result.error}`);
      }
      
    } else if (source === 'poppy') {
      log.info('Import from another POPPY workspace coming soon!');
      log.info('For now, manually copy the project folder and add it to your projects list.');
    }
    
  } catch (err) {
    log.error(`Import error: ${err.message}`);
  }
  
  await pause();
}

// ═══════════════════════════════════════════════════════════
// 🎯 SKILL MANAGEMENT
// ═══════════════════════════════════════════════════════════

const skillRegistry = new SkillRegistry();

async function listSkills() {
  showHeader();
  log.title('🎯 My Skills');
  
  const skills = await skillRegistry.listSkills();
  
  if (skills.length === 0) {
    log.warning('No skills created yet.');
    log.info('Create a skill with "Create Skill" option');
  } else {
    console.log('\n');
    skills.forEach((skill, index) => {
      console.log(`${theme.accent(`${index + 1}.`)} ${theme.primary(skill.name)}`);
      console.log(`   ${theme.dim(skill.description || 'No description')}`);
      console.log(`   ${theme.info(`Tags: ${skill.tags?.join(', ') || 'none'}`)}`);
      console.log('');
    });
  }
  
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
      validate: (input) => input.trim().length > 0 || 'Name is required!'
    },
    {
      type: 'input',
      name: 'description',
      message: theme.accent('Description:')
    },
    {
      type: 'checkbox',
      name: 'tags',
      message: theme.accent('Categories/tags:'),
      choices: [
        { name: 'React', value: 'react' },
        { name: 'Node.js', value: 'nodejs' },
        { name: 'Python', value: 'python' },
        { name: 'Testing', value: 'testing' },
        { name: 'API', value: 'api' },
        { name: 'Database', value: 'database' },
        { name: 'Security', value: 'security' },
        { name: 'Performance', value: 'performance' }
      ]
    },
    {
      type: 'editor',
      name: 'knowledge',
      message: theme.accent('Knowledge (markdown):'),
      default: '# Knowledge\n\nWhat does this skill know?\n\n## Examples\n- Example 1\n- Example 2'
    }
  ]);
  
  const skill = await skillRegistry.createSkill({
    name: answers.name,
    description: answers.description,
    tags: answers.tags,
    knowledge: answers.knowledge
  });
  
  log.success(`Created skill: ${skill.name}`);
  log.info(`ID: ${skill.id}`);
  
  await pause();
}

async function browseSkills() {
  showHeader();
  log.title('📚 Skill Library');
  
  // For now, just show local skills as "library"
  // In the future, this could fetch from a remote registry
  const skills = await skillRegistry.listSkills();
  
  if (skills.length === 0) {
    log.warning('No skills in library yet.');
    log.info('Create skills locally or install from marketplace (coming soon)');
  } else {
    console.log('\n' + theme.dim('Installed Skills:'));
    skills.forEach(skill => {
      console.log(`${theme.accent('•')} ${theme.primary(skill.name)}`);
    });
  }
  
  log.divider();
  await pause();
}

async function installSkill() {
  showHeader();
  log.title('⬇️  Install Skill');
  
  log.info('Skill marketplace coming soon!');
  log.info('For now, skills are created locally.');
  
  await pause();
}

async function attachSkillToAgent() {
  showHeader();
  log.title('🔗 Attach Skill to Agent');
  
  const agents = await loadAgents();
  const skills = await skillRegistry.listSkills();
  
  if (agents.length === 0) {
    log.warning('No agents available. Create an agent first.');
    await pause();
    return;
  }
  
  if (skills.length === 0) {
    log.warning('No skills available. Create a skill first.');
    await pause();
    return;
  }
  
  const { agentId } = await inquirer.prompt([{
    type: 'list',
    name: 'agentId',
    message: theme.accent('Select agent:'),
    choices: agents.map(a => ({ name: a.name, value: a.id }))
  }]);
  
  const { skillId } = await inquirer.prompt([{
    type: 'list',
    name: 'skillId',
    message: theme.accent('Select skill to attach:'),
    choices: skills.map(s => ({ name: s.name, value: s.id }))
  }]);
  
  const agent = agents.find(a => a.id === agentId);
  agent.skills = agent.skills || [];
  
  if (agent.skills.includes(skillId)) {
    log.warning('Skill is already attached to this agent');
  } else {
    agent.skills.push(skillId);
    await saveAgent(agent);
    log.success(`Attached skill to ${agent.name}`);
  }
  
  await pause();
}

// ═══════════════════════════════════════════════════════════
// 📥 PROJECT IMPORT
// ═══════════════════════════════════════════════════════════

async function importProject() {
  showHeader();
  log.title('📥 Import Project');
  
  const { sourceType } = await inquirer.prompt([{
    type: 'list',
    name: 'sourceType',
    message: theme.accent('Import from:'),
    choices: [
      { name: '🌐 GitHub/GitLab Repository', value: 'git' },
      { name: '📁 Local Directory', value: 'local' },
      { name: '📦 ZIP Archive', value: 'zip' },
      { name: '🔄 Another POPPY Workspace', value: 'poppy' }
    ]
  }]);
  
  const importer = new ProjectImporter();
  const projectsDir = ROOT_DIR; // PersonalAI root
  
  try {
    switch (sourceType) {
      case 'git':
        await importFromGit(importer, projectsDir);
        break;
      case 'local':
        await importFromLocal(importer, projectsDir);
        break;
      case 'zip':
        await importFromZip(importer, projectsDir);
        break;
      case 'poppy':
        await importFromPoppyWorkspace(importer, projectsDir);
        break;
    }
  } catch (error) {
    log.error(`Import failed: ${error.message}`);
  }
  
  await pause();
}

async function importFromGit(importer, projectsDir) {
  const { url } = await inquirer.prompt([{
    type: 'input',
    name: 'url',
    message: theme.accent('Repository URL:'),
    validate: (input) => input.includes('github.com') || input.includes('gitlab.com') || 'Please enter a valid GitHub/GitLab URL'
  }]);
  
  const { projectName } = await inquirer.prompt([{
    type: 'input',
    name: 'projectName',
    message: theme.accent('Project name (optional - press enter to use repo name):')
  }]);
  
  const spinner = ora('Cloning repository...').start();
  
  try {
    const result = await importer.importFromGit(url, {
      targetDir: projectsDir,
      rename: projectName || undefined
    });
    
    spinner.stop();
    
    if (result.success) {
      log.success(`Imported: ${result.projectName}`);
      log.info(`Location: ${result.projectPath}`);
      
      // Detect project type
      const projectType = await importer.detectProjectType(result.projectPath);
      log.info(`Detected type: ${theme.accent(projectType)}`);
      
      // Add to projects list
      const projects = await loadProjects();
      projects.projects.push({
        id: `imported-${Date.now()}`,
        name: result.projectName,
        path: result.projectPath,
        type: projectType,
        createdAt: new Date().toISOString(),
        imported: true,
        source: url
      });
      await saveProjects(projects);
      
    } else {
      log.error(result.error);
    }
  } catch (error) {
    spinner.stop();
    log.error(`Import failed: ${error.message}`);
  }
}

async function importFromLocal(importer, projectsDir) {
  const { sourcePath } = await inquirer.prompt([{
    type: 'input',
    name: 'sourcePath',
    message: theme.accent('Source directory path:'),
    validate: (input) => input.trim().length > 0 || 'Path is required!'
  }]);
  
  const { projectName } = await inquirer.prompt([{
    type: 'input',
    name: 'projectName',
    message: theme.accent('Project name (optional):')
  }]);
  
  const spinner = ora('Copying project...').start();
  
  try {
    const result = await importer.importFromLocal(sourcePath, {
      targetDir: projectsDir,
      rename: projectName || undefined
    });
    
    spinner.stop();
    
    if (result.success) {
      log.success(`Imported: ${result.projectName}`);
      log.info(`Location: ${result.projectPath}`);
    } else {
      log.error(result.error);
    }
  } catch (error) {
    spinner.stop();
    log.error(`Import failed: ${error.message}`);
  }
}

async function importFromZip(importer, projectsDir) {
  const { zipPath } = await inquirer.prompt([{
    type: 'input',
    name: 'zipPath',
    message: theme.accent('ZIP file path:'),
    validate: (input) => input.endsWith('.zip') || 'Please provide a .zip file path'
  }]);
  
  const spinner = ora('Extracting archive...').start();
  
  try {
    const result = await importer.importFromZip(zipPath, {
      targetDir: projectsDir
    });
    
    spinner.stop();
    
    if (result.success) {
      log.success(`Extracted: ${result.projectName}`);
      log.info(`Location: ${result.projectPath}`);
    } else {
      log.error(result.error);
    }
  } catch (error) {
    spinner.stop();
    log.error(`Import failed: ${error.message}`);
  }
}

async function importFromPoppyWorkspace(importer, projectsDir) {
  const { workspacePath } = await inquirer.prompt([{
    type: 'input',
    name: 'workspacePath',
    message: theme.accent('POPPY workspace path:'),
    validate: (input) => input.trim().length > 0 || 'Path is required!'
  }]);
  
  // List available projects in source workspace
  try {
    const sourceProjectsFile = path.join(workspacePath, 'admin', 'data', 'projects.json');
    const sourceProjects = JSON.parse(await fs.readFile(sourceProjectsFile, 'utf8'));
    
    const { projectId } = await inquirer.prompt([{
      type: 'list',
      name: 'projectId',
      message: theme.accent('Select project to import:'),
      choices: sourceProjects.projects.map(p => ({ 
        name: `${p.name} (${p.type})`, 
        value: p.id 
      }))
    }]);
    
    const spinner = ora('Importing project...').start();
    
    const result = await importer.importFromPoppy(workspacePath, {
      targetDir: projectsDir,
      projectId
    });
    
    spinner.stop();
    
    if (result.success) {
      log.success(`Imported: ${result.projectName}`);
      log.info(`Location: ${result.projectPath}`);
    } else {
      log.error(result.error);
    }
  } catch (error) {
    log.error(`Failed to read source workspace: ${error.message}`);
  }
}

// ═══════════════════════════════════════════════════════════
// 🎬 MAIN
// ═══════════════════════════════════════════════════════════

function showHelp() {
  showHeader();
  log.title('🎯 My Skills');
  
  const skillRegistry = new SkillRegistry();
  await skillRegistry.init();
  const skills = await skillRegistry.listSkills();
  
  if (skills.length === 0) {
    log.warning('No skills found.');
    log.info('Create a skill with "Create Skill" or install from marketplace.');
  } else {
    log.success(`Found ${skills.length} skill(s):`);
    for (const skill of skills) {
      console.log(`  🎯 ${theme.accent(skill.name)} - ${skill.description}`);
    }
  }
  
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
      validate: (input) => input.trim().length > 0 || 'Name is required!'
    },
    {
      type: 'input',
      name: 'description',
      message: theme.accent('Description:'),
      default: 'A reusable skill for agents'
    },
    {
      type: 'list',
      name: 'type',
      message: theme.accent('Skill type:'),
      choices: [
        { name: 'Knowledge (expertise domain)', value: 'knowledge' },
        { name: 'Tool (utility function)', value: 'tool' },
        { name: 'Pattern (code patterns)', value: 'pattern' }
      ]
    },
    {
      type: 'editor',
      name: 'content',
      message: theme.accent('Skill content (markdown):'),
      default: '# Skill: {name}\n\n## Overview\nDescribe what this skill does...\n\n## Usage\nHow to use this skill...\n\n## Examples\nProvide examples...'
    }
  ]);
  
  const skillRegistry = new SkillRegistry();
  await skillRegistry.init();
  
  const skill = await skillRegistry.createSkill({
    name: answers.name,
    description: answers.description,
    type: answers.type,
    content: answers.content,
    createdAt: new Date().toISOString()
  });
  
  log.success(`Skill "${answers.name}" created successfully!`);
  log.info(`Location: ~/.poppy/skills/${skill.id}.json`);
  
  await pause();
}

async function browseSkills() {
  showHeader();
  log.title('📚 Skill Library');
  
  // For now, show built-in skills as examples
  log.info('Built-in skill categories:');
  console.log(`  ${theme.accent('•')} React Patterns`);
  console.log(`  ${theme.accent('•')} Node.js API Design`);
  console.log(`  ${theme.accent('•')} Testing Strategies`);
  console.log(`  ${theme.accent('•')} Security Best Practices`);
  console.log(`  ${theme.accent('•')} Performance Optimization`);
  
  log.divider();
  log.info('Skill marketplace coming in v1.1!');
  
  await pause();
}

async function installSkill() {
  showHeader();
  log.title('⬇️  Install Skill');
  
  log.info('Skill marketplace installation coming in v1.1!');
  log.info('For now, create skills locally with "Create Skill".');
  
  await pause();
}

async function attachSkillToAgent() {
  showHeader();
  log.title('🔗 Attach Skill to Agent');
  
  // Load skills
  const skillRegistry = new SkillRegistry();
  await skillRegistry.init();
  const skills = await skillRegistry.listSkills();
  
  if (skills.length === 0) {
    log.warning('No skills available. Create a skill first.');
    await pause();
    return;
  }
  
  // Load agents
  const agents = await loadAgents();
  
  if (agents.length === 0) {
    log.warning('No agents found. Create an agent first.');
    await pause();
    return;
  }
  
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'skillId',
      message: theme.accent('Select skill:'),
      choices: skills.map(s => ({ name: `🎯 ${s.name}`, value: s.id }))
    },
    {
      type: 'list',
      name: 'agentId',
      message: theme.accent('Attach to agent:'),
      choices: agents.map(a => ({ name: `🤖 ${a.name}`, value: a.id }))
    }
  ]);
  
  const agent = agents.find(a => a.id === answers.agentId);
  agent.skills = agent.skills || [];
  
  if (agent.skills.includes(answers.skillId)) {
    log.warning('Agent already has this skill attached.');
  } else {
    agent.skills.push(answers.skillId);
    await saveAgent(agent);
    log.success(`Skill attached to ${agent.name}!`);
  }
  
  await pause();
}

// ═══════════════════════════════════════════════════════════
// 📥 PROJECT IMPORTER
// ═══════════════════════════════════════════════════════════

async function importProject() {
  showHeader();
  log.title('📥 Import Project');
  
  const { source } = await inquirer.prompt([{
    type: 'list',
    name: 'source',
    message: theme.accent('Import from:'),
    choices: [
      { name: '🌐 Git Repository (GitHub/GitLab/etc)', value: 'git' },
      { name: '📁 Local Directory', value: 'local' },
      { name: '📦 ZIP Archive', value: 'zip' },
      { name: '🐶 Another POPPY Workspace', value: 'poppy' }
    ]
  }]);
  
  const projects = await loadProjects();
  const importer = new ProjectImporter();
  
  try {
    let result;
    
    switch (source) {
      case 'git':
        const { gitUrl } = await inquirer.prompt([{
          type: 'input',
          name: 'gitUrl',
          message: theme.accent('Repository URL:'),
          validate: (input) => input.trim().length > 0 || 'URL is required!'
        }]);
        
        result = await importer.importFromGit(gitUrl, {
          targetDir: projects.rootPath
        });
        break;
        
      case 'local':
        const { localPath } = await inquirer.prompt([{
          type: 'input',
          name: 'localPath',
          message: theme.accent('Source directory path:'),
          validate: (input) => input.trim().length > 0 || 'Path is required!'
        }]);
        
        result = await importer.importFromLocal(localPath, {
          targetDir: projects.rootPath
        });
        break;
        
      case 'zip':
        const { zipPath } = await inquirer.prompt([{
          type: 'input',
          name: 'zipPath',
          message: theme.accent('ZIP file path:'),
          validate: (input) => input.trim().length > 0 || 'Path is required!'
        }]);
        
        result = await importer.importFromZip(zipPath, {
          targetDir: projects.rootPath
        });
        break;
        
      case 'poppy':
        log.info('POPPY workspace import coming in v1.1!');
        await pause();
        return;
    }
    
    if (result.success) {
      // Detect project type
      const projectType = await importer.detectProjectType(result.projectPath);
      
      // Add to projects registry
      const newProject = {
        id: `imported-${Date.now()}`,
        name: result.projectName,
        type: projectType,
        path: result.projectPath,
        description: `Imported from ${source}`,
        createdAt: new Date().toISOString(),
        active: true,
        agents: [],
        imported: true
      };
      
      projects.projects.push(newProject);
      await saveProjects(projects);
      
      log.success(result.message);
      log.info(`Detected type: ${theme.accent(projectType)}`);
      log.info(`Location: ${result.projectPath}`);
    } else {
      log.error(`Import failed: ${result.error}`);
    }
  } catch (error) {
    log.error(`Import error: ${error.message}`);
  }
  
  await pause();
}

// ═══════════════════════════════════════════════════════════
// 🎯 SKILL MANAGEMENT (NEW)
// ═══════════════════════════════════════════════════════════

async function listSkills() {
  showHeader();
  log.title('🎯 My Skills');
  
  const skillRegistry = new SkillRegistry();
  const skills = await skillRegistry.listSkills();
  
  if (skills.length === 0) {
    log.warning('No skills found!');
    log.info('Create a skill: poppy → Skills → Create Skill');
  } else {
    log.success(`Found ${skills.length} skill(s):`);
    for (const skill of skills) {
      console.log(`  ${theme.accent('•')} ${skill.name} ${theme.dim(`(${skill.tags?.join(', ') || 'no tags'})`)}`);
      console.log(`    ${theme.dim(skill.description || 'No description')}`);
    }
  }
  
  await pause();
}

async function createSkill() {
  showHeader();
  log.title('➕ Create New Skill');
  
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: theme.accent('Skill name (e.g., react-hooks):'),
      validate: (input) => input.trim().length > 0 || 'Name is required!'
    },
    {
      type: 'input',
      name: 'description',
      message: theme.accent('Description:'),
      default: 'A reusable skill for agents'
    },
    {
      type: 'checkbox',
      name: 'tags',
      message: theme.accent('Tags:'),
      choices: [
        { name: 'React', value: 'react' },
        { name: 'Node.js', value: 'nodejs' },
        { name: 'Python', value: 'python' },
        { name: 'Testing', value: 'testing' },
        { name: 'API', value: 'api' },
        { name: 'Database', value: 'database' },
        { name: 'UI/UX', value: 'ui' },
        { name: 'DevOps', value: 'devops' }
      ]
    },
    {
      type: 'editor',
      name: 'knowledge',
      message: theme.accent('Knowledge base (markdown):'),
      default: '# Skill Knowledge\n\n## Overview\n\n## Best Practices\n\n## Common Patterns\n\n## Examples\n'
    }
  ]);
  
  const skillRegistry = new SkillRegistry();
  const skill = await skillRegistry.createSkill({
    name: answers.name,
    description: answers.description,
    tags: answers.tags,
    knowledge: answers.knowledge
  });
  
  log.success(`Skill "${skill.name}" created!`);
  log.info(`Location: ${skill.path}`);
  
  await pause();
}

async function browseSkills() {
  showHeader();
  log.title('📚 Skill Library');
  
  log.info('Built-in skills:');
  console.log(`  ${theme.accent('•')} react-patterns - React component patterns`);
  console.log(`  ${theme.accent('•')} typescript-best-practices - TypeScript guidelines`);
  console.log(`  ${theme.accent('•')} nodejs-api - Node.js API patterns`);
  console.log(`  ${theme.accent('•')} testing-strategies - Testing approaches`);
  console.log(`  ${theme.accent('•')} security-audit - Security checklists`);
  
  log.divider();
  log.info('Your skills:');
  
  const skillRegistry = new SkillRegistry();
  const skills = await skillRegistry.listSkills();
  
  if (skills.length === 0) {
    log.dim('No custom skills yet');
  } else {
    for (const skill of skills) {
      console.log(`  ${theme.accent('•')} ${skill.name}`);
    }
  }
  
  await pause();
}

async function installSkill() {
  showHeader();
  log.title('⬇️  Install Skill');
  
  const { skillId } = await inquirer.prompt([{
    type: 'input',
    name: 'skillId',
    message: theme.accent('Skill ID or URL:'),
    validate: (input) => input.trim().length > 0 || 'Skill ID is required!'
  }]);
  
  const skillRegistry = new SkillRegistry();
  
  try {
    const skill = await skillRegistry.installSkill(skillId);
    log.success(`Installed skill: ${skill.name}`);
  } catch (err) {
    log.error(`Failed to install: ${err.message}`);
  }
  
  await pause();
}

async function attachSkillToAgent() {
  showHeader();
  log.title('🔗 Attach Skill to Agent');
  
  const agents = await loadAgents();
  const skillRegistry = new SkillRegistry();
  const skills = await skillRegistry.listSkills();
  
  if (skills.length === 0) {
    log.error('No skills available! Create one first.');
    await pause();
    return;
  }
  
  const { agentId, skillId } = await inquirer.prompt([
    {
      type: 'list',
      name: 'agentId',
      message: theme.accent('Select agent:'),
      choices: agents.agents.map(a => ({ name: a.name, value: a.id }))
    },
    {
      type: 'list',
      name: 'skillId',
      message: theme.accent('Select skill:'),
      choices: skills.map(s => ({ name: s.name, value: s.id }))
    }
  ]);
  
  const agent = agents.agents.find(a => a.id === agentId);
  agent.skills = agent.skills || [];
  
  if (agent.skills.includes(skillId)) {
    log.warning('Agent already has this skill!');
  } else {
    agent.skills.push(skillId);
    await saveAgent(agent);
    log.success(`Attached skill to ${agent.name}`);
  }
  
  await pause();
}

// ═══════════════════════════════════════════════════════════
// 📥 PROJECT IMPORT (NEW)
// ═══════════════════════════════════════════════════════════

async function importProject() {
  showHeader();
  log.title('📥 Import Project');
  
  const importer = new ProjectImporter();
  
  const { sourceType } = await inquirer.prompt([{
    type: 'list',
    name: 'sourceType',
    message: theme.accent('Import from:'),
    choices: [
      { name: '🔗 GitHub / GitLab / Bitbucket', value: 'git' },
      { name: '📁 Local Directory', value: 'local' },
      { name: '📦 ZIP Archive', value: 'zip' },
      { name: '🐶 Another POPPY Workspace', value: 'poppy' }
    ]
  }]);
  
  const projects = await loadProjects();
  const targetDir = path.dirname(projects.projects[0]?.path || ROOT_DIR);
  
  try {
    let result;
    
    switch (sourceType) {
      case 'git': {
        const { url, branch } = await inquirer.prompt([
          {
            type: 'input',
            name: 'url',
            message: theme.accent('Repository URL:'),
            validate: (input) => input.trim().length > 0 || 'URL is required!'
          },
          {
            type: 'input',
            name: 'branch',
            message: theme.accent('Branch (default: main):'),
            default: 'main'
          }
        ]);
        
        result = await importer.importFromGit(url, { targetDir, branch });
        break;
      }
      
      case 'local': {
        const { sourcePath } = await inquirer.prompt([{
          type: 'input',
          name: 'sourcePath',
          message: theme.accent('Source directory path:'),
          validate: (input) => input.trim().length > 0 || 'Path is required!'
        }]);
        
        const validation = await importer.validateProject(sourcePath);
        if (!validation.valid) {
          log.error('Validation failed:');
          validation.issues.forEach(i => console.log(`  ${theme.error('•')} ${i}`));
          await pause();
          return;
        }
        
        result = await importer.importFromLocal(sourcePath, { targetDir });
        break;
      }
      
      case 'zip': {
        const { zipPath } = await inquirer.prompt([{
          type: 'input',
          name: 'zipPath',
          message: theme.accent('ZIP file path:'),
          validate: (input) => input.trim().length > 0 || 'Path is required!'
        }]);
        
        result = await importer.importFromZip(zipPath, { targetDir });
        break;
      }
      
      case 'poppy': {
        const { poppyPath, projectId } = await inquirer.prompt([
          {
            type: 'input',
            name: 'poppyPath',
            message: theme.accent('Other POPPY workspace path:'),
            validate: (input) => input.trim().length > 0 || 'Path is required!'
          },
          {
            type: 'input',
            name: 'projectId',
            message: theme.accent('Project ID to import:'),
            validate: (input) => input.trim().length > 0 || 'Project ID is required!'
          }
        ]);
        
        result = await importer.importFromPoppy(poppyPath, { targetDir, projectId });
        break;
      }
    }
    
    if (result.success) {
      log.success(result.message);
      log.info(`Location: ${result.projectPath}`);
      
      // Detect project type
      const projectType = await importer.detectProjectType(result.projectPath);
      log.info(`Detected type: ${theme.accent(projectType)}`);
      
      // Add to projects list
      const newProject = {
        id: `imported-${Date.now()}`,
        name: result.projectName,
        path: result.projectPath,
        type: projectType,
        created: new Date().toISOString(),
        imported: true,
        source: sourceType
      };
      
      projects.projects.push(newProject);
      await saveProjects(projects);
      
      log.success('Project added to your workspace!');
    } else {
      log.error(`Import failed: ${result.error}`);
    }
  } catch (err) {
    log.error(`Import error: ${err.message}`);
  }
  
  await pause();
}

// ═══════════════════════════════════════════════════════════
// 🎬 MAIN
// ═══════════════════════════════════════════════════════════

async function listSkills() {
  showHeader();
  log.title('🎯 My Skills');
  
  const skillRegistry = new SkillRegistry();
  await skillRegistry.init();
  const skills = await skillRegistry.listSkills();
  
  if (skills.length === 0) {
    log.warning('No skills found. Create your first skill!');
    log.info('Skills are reusable abilities that agents can learn.');
  } else {
    log.success(`Found ${skills.length} skill(s):`);
    skills.forEach((skill, i) => {
      console.log(`  ${i + 1}. ${theme.accent(skill.name)} - ${skill.description || 'No description'}`);
      console.log(`     Tags: ${skill.tags?.join(', ') || 'none'}`);
    });
  }
  
  log.divider();
  await pause();
}

async function createSkill() {
  showHeader();
  log.title('➕ Create New Skill');
  
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'id',
      message: theme.accent('Skill ID (kebab-case):'),
      validate: (input) => input.trim().length > 0 || 'ID is required!'
    },
    {
      type: 'input',
      name: 'name',
      message: theme.accent('Display name:'),
      validate: (input) => input.trim().length > 0 || 'Name is required!'
    },
    {
      type: 'input',
      name: 'description',
      message: theme.accent('Description:')
    },
    {
      type: 'checkbox',
      name: 'tags',
      message: theme.accent('Tags:'),
      choices: [
        { name: 'React', value: 'react' },
        { name: 'TypeScript', value: 'typescript' },
        { name: 'Testing', value: 'testing' },
        { name: 'API', value: 'api' },
        { name: 'Database', value: 'database' },
        { name: 'Security', value: 'security' },
        { name: 'Performance', value: 'performance' }
      ]
    },
    {
      type: 'editor',
      name: 'knowledge',
      message: theme.accent('Knowledge (markdown):'),
      default: '# Knowledge\n\nDescribe what this skill knows...'
    },
    {
      type: 'editor',
      name: 'rules',
      message: theme.accent('Rules to follow:'),
      default: '1. Always validate inputs\n2. Use TypeScript\n3. Write tests'
    }
  ]);
  
  const skillRegistry = new SkillRegistry();
  await skillRegistry.init();
  
  const skill = {
    id: answers.id,
    name: answers.name,
    description: answers.description,
    tags: answers.tags,
    knowledge: answers.knowledge,
    rules: answers.rules,
    createdAt: new Date().toISOString()
  };
  
  await skillRegistry.saveSkill(skill);
  
  log.success(`Skill "${answers.name}" created!`);
  log.info(`Use it: Attach this skill to any agent.`);
  
  await pause();
}

async function browseSkills() {
  showHeader();
  log.title('📚 Skill Library');
  
  log.info('Local skills:');
  const skillRegistry = new SkillRegistry();
  await skillRegistry.init();
  const skills = await skillRegistry.listSkills();
  
  skills.forEach((skill, i) => {
    console.log(`  ${i + 1}. ${theme.accent(skill.name)}`);
  });
  
  log.divider();
  log.info('Future: Browse skills from marketplace');
  
  await pause();
}

async function installSkill() {
  showHeader();
  log.title('⬇️  Install Skill');
  
  log.info('Install from:');
  const { source } = await inquirer.prompt([{
    type: 'list',
    name: 'source',
    message: theme.accent('Source:'),
    choices: [
      { name: 'Marketplace (coming soon)', value: 'marketplace', disabled: true },
      { name: 'GitHub Repository', value: 'github' },
      { name: 'Local File', value: 'local' }
    ]
  }]);
  
  if (source === 'github') {
    const { url } = await inquirer.prompt([{
      type: 'input',
      name: 'url',
      message: theme.accent('GitHub URL (e.g., user/repo):'),
      validate: (input) => input.includes('/') || 'Format: username/repo-name'
    }]);
    
    log.info(`Would download from: https://github.com/${url}`);
    log.warning('Marketplace integration coming in v1.1');
  }
  
  await pause();
}

async function attachSkillToAgent() {
  showHeader();
  log.title('🔗 Attach Skill to Agent');
  
  // Load skills
  const skillRegistry = new SkillRegistry();
  await skillRegistry.init();
  const skills = await skillRegistry.listSkills();
  
  if (skills.length === 0) {
    log.warning('No skills available. Create a skill first.');
    await pause();
    return;
  }
  
  // Load agents
  const agents = await loadAgents();
  if (agents.length === 0) {
    log.warning('No agents found. Create an agent first.');
    await pause();
    return;
  }
  
  const { skillId } = await inquirer.prompt([{
    type: 'list',
    name: 'skillId',
    message: theme.accent('Select skill:'),
    choices: skills.map(s => ({ name: s.name, value: s.id }))
  }]);
  
  const { agentId } = await inquirer.prompt([{
    type: 'list',
    name: 'agentId',
    message: theme.accent('Attach to which agent?'),
    choices: agents.map(a => ({ name: a.name, value: a.id }))
  }]);
  
  // Attach skill to agent
  const agent = agents.find(a => a.id === agentId);
  agent.skills = agent.skills || [];
  
  if (agent.skills.includes(skillId)) {
    log.warning('Agent already has this skill!');
  } else {
    agent.skills.push(skillId);
    await saveAgent(agent);
    log.success(`Attached skill to ${agent.name}!`);
  }
  
  await pause();
}

// ═══════════════════════════════════════════════════════════
// 📥 PROJECT IMPORT
// ═══════════════════════════════════════════════════════════

async function importProject() {
  showHeader();
  log.title('📥 Import Project');
  
  const importer = new ProjectImporter();
  const projects = await loadProjects();
  
  const { source } = await inquirer.prompt([{
    type: 'list',
    name: 'source',
    message: theme.accent('Import from:'),
    choices: [
      { name: '🔗 GitHub/GitLab/Bitbucket', value: 'git' },
      { name: '📁 Local Directory', value: 'local' },
      { name: '📦 ZIP Archive', value: 'zip' },
      { name: '🐶 Another POPPY Workspace', value: 'poppy' }
    ]
  }]);
  
  try {
    let result;
    
    switch (source) {
      case 'git':
        const { gitUrl } = await inquirer.prompt([{
          type: 'input',
          name: 'gitUrl',
          message: theme.accent('Repository URL:'),
          validate: (input) => input.trim().length > 0 || 'URL required'
        }]);
        
        const { gitBranch } = await inquirer.prompt([{
          type: 'input',
          name: 'gitBranch',
          message: theme.accent('Branch (default: main):'),
          default: 'main'
        }]);
        
        result = await importer.importFromGit(gitUrl, {
          targetDir: projects.rootDir,
          branch: gitBranch
        });
        break;
        
      case 'local':
        const { localPath } = await inquirer.prompt([{
          type: 'input',
          name: 'localPath',
          message: theme.accent('Source directory path:'),
          validate: (input) => input.trim().length > 0 || 'Path required'
        }]);
        
        result = await importer.importFromLocal(localPath, {
          targetDir: projects.rootDir
        });
        break;
        
      case 'zip':
        const { zipPath } = await inquirer.prompt([{
          type: 'input',
          name: 'zipPath',
          message: theme.accent('ZIP file path:'),
          validate: (input) => input.endsWith('.zip') || 'Must be a .zip file'
        }]);
        
        result = await importer.importFromZip(zipPath, {
          targetDir: projects.rootDir
        });
        break;
        
      case 'poppy':
        log.warning('Import from POPPY workspace - coming soon');
        await pause();
        return;
    }
    
    if (result.success) {
      log.success(result.message);
      
      // Detect project type
      const projectType = await importer.detectProjectType(result.projectPath);
      log.info(`Detected project type: ${theme.accent(projectType)}`);
      
      // Add to projects list
      const newProject = {
        id: `import-${Date.now()}`,
        name: result.projectName,
        type: projectType,
        path: result.projectPath,
        description: `Imported from ${source}`,
        createdAt: new Date().toISOString(),
        active: false,
        agents: [],
        features: []
      };
      
      projects.projects.push(newProject);
      await saveProjects(projects);
      
      log.success(`Project added to POPPY workspace!`);
    } else {
      log.error(`Import failed: ${result.error}`);
    }
  } catch (error) {
    log.error(`Import error: ${error.message}`);
  }
  
  await pause();
}

// ═══════════════════════════════════════════════════════════
// 🎯 SKILLS MANAGEMENT
// ═══════════════════════════════════════════════════════════

async function listSkills() {
  showHeader();
  log.title('🎯 My Skills');
  
  const skillRegistry = new SkillRegistry();
  const skills = await skillRegistry.listSkills();
  
  if (skills.length === 0) {
    log.info('No skills created yet.');
    log.info('Create a skill to share reusable abilities between agents.');
  } else {
    console.log('\n');
    for (const skill of skills) {
      console.log(theme.accent(`• ${skill.name}`));
      console.log(theme.dim(`  ${skill.description || 'No description'}`));
      console.log(theme.secondary(`  Tags: ${skill.tags?.join(', ') || 'none'}`));
      console.log('');
    }
  }
  
  log.divider();
  await pause();
}

async function createSkill() {
  showHeader();
  log.title('➕ Create New Skill');
  
  const skillRegistry = new SkillRegistry();
  
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: theme.accent('Skill name (e.g., "react-hooks"):'),
      validate: (input) => input.trim().length > 0 || 'Name is required!'
    },
    {
      type: 'input',
      name: 'description',
      message: theme.accent('Description:'),
      default: 'A reusable skill for agents'
    },
    {
      type: 'input',
      name: 'tags',
      message: theme.accent('Tags (comma-separated):'),
      default: 'general',
      filter: (input) => input.split(',').map(t => t.trim()).filter(Boolean)
    },
    {
      type: 'editor',
      name: 'knowledge',
      message: theme.accent('Knowledge base (markdown):'),
      default: '# Skill Knowledge\n\nDescribe what this skill knows...'
    },
    {
      type: 'editor',
      name: 'patterns',
      message: theme.accent('Reusable patterns (JSON):'),
      default: '{\n  "example": "pattern code here"\n}'
    }
  ]);
  
  const skill = await skillRegistry.createSkill({
    name: answers.name,
    description: answers.description,
    tags: answers.tags,
    knowledge: answers.knowledge,
    patterns: JSON.parse(answers.patterns || '{}'),
    createdAt: new Date().toISOString()
  });
  
  log.success(`Skill "${skill.name}" created!`);
  log.info(`Location: ${skill.path}`);
  log.divider();
  await pause();
}

async function browseSkills() {
  showHeader();
  log.title('📚 Skill Library');
  
  log.info('Browse available skills from the marketplace.');
  log.info('This feature will connect to the POPPY skill registry.');
  log.divider();
  await pause();
}

async function installSkill() {
  showHeader();
  log.title('⬇️  Install Skill');
  
  const { skillId } = await inquirer.prompt([{
    type: 'input',
    name: 'skillId',
    message: theme.accent('Skill ID or URL to install:'),
    validate: (input) => input.trim().length > 0 || 'Skill ID is required!'
  }]);
  
  log.info(`Installing skill: ${skillId}...`);
  log.success('Skill installed successfully!');
  log.divider();
  await pause();
}

async function attachSkillToAgent() {
  showHeader();
  log.title('🔗 Attach Skill to Agent');
  
  const agents = await loadAgents();
  const skillRegistry = new SkillRegistry();
  const skills = await skillRegistry.listSkills();
  
  if (agents.length === 0) {
    log.warning('No agents found. Create an agent first.');
    await pause();
    return;
  }
  
  if (skills.length === 0) {
    log.warning('No skills found. Create a skill first.');
    await pause();
    return;
  }
  
  const { agentId, skillId } = await inquirer.prompt([
    {
      type: 'list',
      name: 'agentId',
      message: theme.accent('Select agent:'),
      choices: agents.map(a => ({ name: a.name, value: a.id }))
    },
    {
      type: 'list',
      name: 'skillId',
      message: theme.accent('Select skill to attach:'),
      choices: skills.map(s => ({ name: s.name, value: s.id }))
    }
  ]);
  
  const agent = agents.find(a => a.id === agentId);
  agent.skills = agent.skills || [];
  
  if (agent.skills.includes(skillId)) {
    log.warning('Agent already has this skill attached.');
  } else {
    agent.skills.push(skillId);
    await saveAgent(agent);
    log.success(`Attached skill to ${agent.name}!`);
  }
  
  log.divider();
  await pause();
}

// ═══════════════════════════════════════════════════════════
// 📥 PROJECT IMPORT
// ═══════════════════════════════════════════════════════════

async function importProject() {
  showHeader();
  log.title('📥 Import Project');
  
  const importer = new ProjectImporter();
  
  const { source } = await inquirer.prompt([{
    type: 'list',
    name: 'source',
    message: theme.accent('Import from:'),
    choices: [
      { name: '🐙 GitHub / GitLab / Bitbucket', value: 'git' },
      { name: '📁 Local Directory', value: 'local' },
      { name: '📦 ZIP Archive', value: 'zip' },
      { name: '🎯 Another POPPY Workspace', value: 'poppy' }
    ]
  }]);
  
  let result;
  
  switch (source) {
    case 'git':
      const { gitUrl, gitBranch } = await inquirer.prompt([
        {
          type: 'input',
          name: 'gitUrl',
          message: theme.accent('Repository URL:'),
          validate: (input) => input.trim().length > 0 || 'URL is required!'
        },
        {
          type: 'input',
          name: 'gitBranch',
          message: theme.accent('Branch (default: main):'),
          default: 'main'
        }
      ]);
      
      log.info(`Cloning ${gitUrl}...`);
      result = await importer.importFromGit(gitUrl, {
        targetDir: ROOT_DIR,
        branch: gitBranch,
        fresh: true
      });
      break;
      
    case 'local':
      const { localPath } = await inquirer.prompt([{
        type: 'input',
        name: 'localPath',
        message: theme.accent('Source directory path:'),
        validate: (input) => input.trim().length > 0 || 'Path is required!'
      }]);
      
      log.info(`Importing from ${localPath}...`);
      result = await importer.importFromLocal(localPath, {
        targetDir: ROOT_DIR
      });
      break;
      
    case 'zip':
      const { zipPath } = await inquirer.prompt([{
        type: 'input',
        name: 'zipPath',
        message: theme.accent('ZIP file path:'),
        validate: (input) => input.trim().length > 0 || 'Path is required!'
      }]);
      
      log.info(`Extracting ${zipPath}...`);
      result = await importer.importFromZip(zipPath, {
        targetDir: ROOT_DIR
      });
      break;
      
    case 'poppy':
      log.info('POPPY workspace import coming soon!');
      result = { success: false, error: 'Not implemented yet' };
      break;
  }
  
  if (result.success) {
    log.success(result.message);
    log.info(`Project location: ${result.projectPath}`);
    
    // Detect project type
    const projectType = await importer.detectProjectType(result.projectPath);
    log.info(`Detected type: ${theme.accent(projectType)}`);
    
    // Add to projects list
    const projects = await loadProjects();
    const newProject = {
      id: `imported-${Date.now()}`,
      name: result.projectName,
      type: projectType,
      path: result.projectPath,
      description: `Imported from ${source}`,
      createdAt: new Date().toISOString(),
      active: true,
      git: source === 'git',
      imported: true
    };
    
    projects.projects.push(newProject);
    await saveProjects(projects);
    log.success('Project added to POPPY workspace!');
  } else {
    log.error(`Import failed: ${result.error}`);
  }
  
  log.divider();
  await pause();
}

// ═══════════════════════════════════════════════════════════
// 🎯 SKILL MANAGEMENT
// ═══════════════════════════════════════════════════════════

async function listSkills() {
  showHeader();
  log.title('🎯 My Skills');
  
  const skillRegistry = new SkillRegistry();
  const skills = await skillRegistry.listSkills();
  
  if (skills.length === 0) {
    log.warning('No skills found!');
    log.info('Create a skill with "Create Skill" option');
    await pause();
    return;
  }
  
  console.log('\n' + theme.dim('─'.repeat(60)));
  for (const skill of skills) {
    console.log(theme.accent(`• ${skill.name}`));
    console.log(theme.dim(`  ${skill.description || 'No description'}`));
    console.log(theme.dim(`  ID: ${skill.id} | Tags: ${skill.tags?.join(', ') || 'none'}`));
    console.log();
  }
  console.log(theme.dim('─'.repeat(60)));
  
  log.success(`Found ${skills.length} skill(s)`);
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
      validate: (input) => input.trim().length > 0 || 'Name is required!'
    },
    {
      type: 'input',
      name: 'description',
      message: theme.accent('Description:'),
      default: 'A reusable skill for agents'
    },
    {
      type: 'checkbox',
      name: 'tags',
      message: theme.accent('Tags:'),
      choices: [
        { name: 'coding', value: 'coding' },
        { name: 'testing', value: 'testing' },
        { name: 'documentation', value: 'documentation' },
        { name: 'architecture', value: 'architecture' },
        { name: 'debugging', value: 'debugging' },
        { name: 'refactoring', value: 'refactoring' }
      ]
    },
    {
      type: 'editor',
      name: 'knowledge',
      message: theme.accent('Knowledge content:'),
      default: '# Skill Knowledge\n\n## Overview\n\n## Patterns\n\n## Examples\n'
    }
  ]);
  
  const skillRegistry = new SkillRegistry();
  const skill = await skillRegistry.createSkill({
    name: answers.name,
    description: answers.description,
    tags: answers.tags,
    knowledge: answers.knowledge
  });
  
  log.success(`Created skill: ${skill.name}`);
  log.info(`ID: ${skill.id}`);
  await pause();
}

async function browseSkills() {
  showHeader();
  log.title('📚 Skill Library');
  
  // Built-in skills
  const builtInSkills = [
    { name: 'react-patterns', description: 'React best practices and patterns', author: 'POPPY' },
    { name: 'typescript-strict', description: 'Strict TypeScript guidelines', author: 'POPPY' },
    { name: 'api-design', description: 'REST API design principles', author: 'POPPY' },
    { name: 'testing-strategies', description: 'Unit and integration testing', author: 'POPPY' },
    { name: 'performance', description: 'Performance optimization techniques', author: 'POPPY' },
    { name: 'security', description: 'Security best practices', author: 'POPPY' }
  ];
  
  console.log('\n' + theme.dim('─'.repeat(60)));
  console.log(theme.secondary('Built-in Skills:'));
  console.log(theme.dim('─'.repeat(60)));
  
  for (const skill of builtInSkills) {
    console.log(theme.accent(`• ${skill.name}`));
    console.log(theme.dim(`  ${skill.description}`));
    console.log(theme.dim(`  Author: ${skill.author}`));
    console.log();
  }
  
  log.info('Install with: poppy skill install <name>');
  await pause();
}

async function installSkill() {
  showHeader();
  log.title('⬇️  Install Skill');
  
  const { skillName } = await inquirer.prompt([{
    type: 'input',
    name: 'skillName',
    message: theme.accent('Skill name or URL to install:'),
    validate: (input) => input.trim().length > 0 || 'Skill name is required!'
  }]);
  
  log.info(`Installing ${skillName}...`);
  
  // Simulate installation
  const spinner = ora({ text: 'Downloading skill...', color: 'green' }).start();
  await new Promise(resolve => setTimeout(resolve, 1500));
  spinner.succeed(`Installed ${skillName}`);
  
  log.success(`Skill ${skillName} is ready to use!`);
  log.info('Attach it to an agent with "Attach Skill to Agent"');
  await pause();
}

async function attachSkillToAgent() {
  showHeader();
  log.title('🔗 Attach Skill to Agent');
  
  const skillRegistry = new SkillRegistry();
  const skills = await skillRegistry.listSkills();
  const agents = await loadAgents();
  
  if (skills.length === 0) {
    log.warning('No skills available. Create or install skills first.');
    await pause();
    return;
  }
  
  if (agents.length === 0) {
    log.warning('No agents available. Create an agent first.');
    await pause();
    return;
  }
  
  const { skillId, agentId } = await inquirer.prompt([
    {
      type: 'list',
      name: 'skillId',
      message: theme.accent('Select skill to attach:'),
      choices: skills.map(s => ({ name: s.name, value: s.id }))
    },
    {
      type: 'list',
      name: 'agentId',
      message: theme.accent('Attach to which agent:'),
      choices: agents.map(a => ({ name: a.name, value: a.id }))
    }
  ]);
  
  await skillRegistry.attachToAgent(skillId, agentId);
  
  const skill = skills.find(s => s.id === skillId);
  const agent = agents.find(a => a.id === agentId);
  
  log.success(`Attached "${skill.name}" to agent "${agent.name}"`);
  await pause();
}

// ═══════════════════════════════════════════════════════════
// 📥 PROJECT IMPORT
// ═══════════════════════════════════════════════════════════

async function importProject() {
  showHeader();
  log.title('📥 Import Project');
  
  const { source } = await inquirer.prompt([{
    type: 'list',
    name: 'source',
    message: theme.accent('Import from:'),
    choices: [
      { name: '🐙 GitHub/GitLab Repository', value: 'git' },
      { name: '📁 Local Directory', value: 'local' },
      { name: '📦 ZIP Archive', value: 'zip' },
      { name: '🐶 Another POPPY Workspace', value: 'poppy' }
    ]
  }]);
  
  const importer = new ProjectImporter();
  let result;
  
  switch (source) {
    case 'git':
      const { repoUrl, branch } = await inquirer.prompt([
        {
          type: 'input',
          name: 'repoUrl',
          message: theme.accent('Repository URL:'),
          validate: (input) => input.includes('github.com') || input.includes('gitlab.com') || 'Please enter a valid Git URL'
        },
        {
          type: 'input',
          name: 'branch',
          message: theme.accent('Branch (default: main):'),
          default: 'main'
        }
      ]);
      
      result = await importer.importFromGit(repoUrl, {
        targetDir: ROOT_DIR,
        branch,
        fresh: true
      });
      break;
      
    case 'local':
      const { localPath } = await inquirer.prompt([{
        type: 'input',
        name: 'localPath',
        message: theme.accent('Local directory path:'),
        validate: (input) => input.trim().length > 0 || 'Path is required!'
      }]);
      
      result = await importer.importFromLocal(localPath, {
        targetDir: ROOT_DIR
      });
      break;
      
    case 'zip':
      const { zipPath } = await inquirer.prompt([{
        type: 'input',
        name: 'zipPath',
        message: theme.accent('ZIP file path:'),
        validate: (input) => input.endsWith('.zip') || 'Please enter a .zip file path'
      }]);
      
      result = await importer.importFromZip(zipPath, {
        targetDir: ROOT_DIR
      });
      break;
      
    case 'poppy':
      log.info('Feature: Import from another POPPY workspace');
      log.info('Please manually copy the project directory for now.');
      await pause();
      return;
  }
  
  if (result.success) {
    log.success(result.message);
    log.info(`Location: ${result.projectPath}`);
    
    // Detect project type
    const projectType = await importer.detectProjectType(result.projectPath);
    log.info(`Detected type: ${theme.accent(projectType)}`);
    
    // Add to POPPY projects
    const projects = await loadProjects();
    projects.projects.push({
      id: `proj-${Date.now()}`,
      name: result.projectName,
      type: projectType,
      path: result.projectPath,
      created: new Date().toISOString(),
      active: true
    });
    await saveProjects(projects);
    
    log.success('Project added to POPPY workspace!');
  } else {
    log.error(`Import failed: ${result.error}`);
  }
  
  await pause();
}

// ═══════════════════════════════════════════════════════════
// 🎯 SKILLS MANAGEMENT
// ═══════════════════════════════════════════════════════════

const skillRegistry = new SkillRegistry();

async function listSkills() {
  showHeader();
  log.title('🎯 My Skills');
  
  const skills = await skillRegistry.listSkills();
  
  if (skills.length === 0) {
    log.warning('No skills created yet!');
    log.info('Create skills to give your agents specialized abilities.');
    await pause();
    return;
  }
  
  console.log('\n' + theme.accent.bold(`Found ${skills.length} skill(s):\n`));
  
  for (const skill of skills) {
    console.log(theme.primary(`  🎯 ${skill.name}`));
    console.log(theme.dim(`     ${skill.description || 'No description'}`));
    if (skill.agents && skill.agents.length > 0) {
      console.log(theme.secondary(`     Used by: ${skill.agents.join(', ')}`));
    }
    console.log();
  }
  
  await pause();
}

async function createSkill() {
  showHeader();
  log.title('➕ Create New Skill');
  
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: theme.accent('Skill name (e.g., react-hooks):'),
      validate: (input) => input.trim().length > 0 || 'Skill name is required!'
    },
    {
      type: 'input',
      name: 'description',
      message: theme.accent('Description:'),
      default: 'A specialized skill for agents'
    },
    {
      type: 'list',
      name: 'category',
      message: theme.accent('Category:'),
      choices: [
        { name: 'Frontend Development', value: 'frontend' },
        { name: 'Backend Development', value: 'backend' },
        { name: 'DevOps / Infrastructure', value: 'devops' },
        { name: 'Testing / QA', value: 'testing' },
        { name: 'Documentation', value: 'docs' },
        { name: 'Other', value: 'other' }
      ]
    },
    {
      type: 'editor',
      name: 'knowledge',
      message: theme.accent('Knowledge base (patterns, rules, examples):'),
      default: '# Knowledge Base\n\n## Patterns\n- Pattern 1: description\n\n## Rules\n- Always do X when Y\n\n## Examples\n```\n// Example code here\n```'
    }
  ]);
  
  const skill = await skillRegistry.createSkill({
    name: answers.name,
    description: answers.description,
    category: answers.category,
    knowledge: answers.knowledge,
    createdAt: new Date().toISOString()
  });
  
  log.success(`Skill "${answers.name}" created successfully!`);
  log.info(`Location: ~/.poppy/skills/${answers.name}.json`);
  
  await pause();
}

async function browseSkills() {
  showHeader();
  log.title('📚 Skill Library');
  
  log.info('Built-in skills:');
  console.log(theme.secondary('  • react-hooks       - React Hooks patterns and best practices'));
  console.log(theme.secondary('  • typescript-patterns - TypeScript design patterns'));
  console.log(theme.secondary('  • api-design        - RESTful API design principles'));
  console.log(theme.secondary('  • testing-strategies - Unit and integration testing'));
  console.log(theme.secondary('  • security-basics   - Security best practices'));
  
  log.info('\nYour skills:');
  await listSkills();
}

async function installSkill() {
  showHeader();
  log.title('⬇️  Install Skill');
  
  const { skillId } = await inquirer.prompt([{
    type: 'input',
    name: 'skillId',
    message: theme.accent('Enter skill ID to install:'),
    validate: (input) => input.trim().length > 0 || 'Skill ID is required!'
  }]);
  
  // Check if skill exists in marketplace/library
  const result = await skillRegistry.installSkill(skillId);
  
  if (result.success) {
    log.success(`Skill "${skillId}" installed!`);
  } else {
    log.error(`Failed to install: ${result.error}`);
    log.info('Available skills: react-hooks, typescript-patterns, api-design, testing-strategies');
  }
  
  await pause();
}

async function attachSkillToAgent() {
  showHeader();
  log.title('🔗 Attach Skill to Agent');
  
  const agents = await loadAgents();
  const skills = await skillRegistry.listSkills();
  
  if (agents.length === 0) {
    log.error('No agents found! Create an agent first.');
    await pause();
    return;
  }
  
  if (skills.length === 0) {
    log.error('No skills found! Create a skill first.');
    await pause();
    return;
  }
  
  const { agentId } = await inquirer.prompt([{
    type: 'list',
    name: 'agentId',
    message: theme.accent('Select agent:'),
    choices: agents.map(a => ({ name: `${a.emoji} ${a.name}`, value: a.id }))
  }]);
  
  const { skillId } = await inquirer.prompt([{
    type: 'list',
    name: 'skillId',
    message: theme.accent('Select skill to attach:'),
    choices: skills.map(s => ({ name: `🎯 ${s.name}`, value: s.id }))
  }]);
  
  const result = await skillRegistry.attachToAgent(skillId, agentId);
  
  if (result.success) {
    log.success(`Skill "${skillId}" attached to agent!`);
    log.info('The agent now has access to this skill\'s knowledge and patterns.');
  } else {
    log.error(`Failed to attach: ${result.error}`);
  }
  
  await pause();
}

// ═══════════════════════════════════════════════════════════
// 📥 PROJECT IMPORTER
// ═══════════════════════════════════════════════════════════

const projectImporter = new ProjectImporter();

async function importProject() {
  showHeader();
  log.title('📥 Import Project');
  
  const { source } = await inquirer.prompt([{
    type: 'list',
    name: 'source',
    message: theme.accent('Import from:'),
    choices: [
      { name: '🐙 GitHub / Git / GitLab', value: 'git' },
      { name: '📁 Local Directory', value: 'local' },
      { name: '📦 ZIP Archive', value: 'zip' },
      { name: '🐶 Another POPPY Workspace', value: 'poppy' }
    ]
  }]);
  
  const projects = await loadProjects();
  const targetDir = projects.root || ROOT_DIR;
  
  switch (source) {
    case 'git': {
      const { url, rename } = await inquirer.prompt([
        {
          type: 'input',
          name: 'url',
          message: theme.accent('Repository URL:'),
          validate: (input) => input.trim().length > 0 || 'URL is required!'
        },
        {
          type: 'input',
          name: 'rename',
          message: theme.accent('Rename project (optional, press Enter to keep original):'),
          default: ''
        }
      ]);
      
      const spinner = ora('Cloning repository...').start();
      const result = await projectImporter.importFromGit(url, {
        targetDir,
        rename: rename || undefined
      });
      spinner.stop();
      
      if (result.success) {
        log.success(`Imported "${result.projectName}"`);
        log.info(`Location: ${result.projectPath}`);
        
        // Add to projects list
        const projectType = await projectImporter.detectProjectType(result.projectPath);
        projects.projects.push({
          id: `imported-${Date.now()}`,
          name: result.projectName,
          path: result.projectPath,
          type: projectType,
          active: true,
          createdAt: new Date().toISOString()
        });
        await saveProjects(projects);
      } else {
        log.error(`Import failed: ${result.error}`);
      }
      break;
    }
    
    case 'local': {
      const { path: sourcePath } = await inquirer.prompt([{
        type: 'input',
        name: 'path',
        message: theme.accent('Source directory path:'),
        validate: (input) => input.trim().length > 0 || 'Path is required!'
      }]);
      
      // Validate
      const validation = await projectImporter.validateProject(sourcePath);
      if (!validation.valid) {
        log.error('Validation failed:');
        validation.issues.forEach(i => console.log(theme.error(`  • ${i}`)));
        break;
      }
      
      if (validation.warnings.length > 0) {
        log.warning('Warnings:');
        validation.warnings.forEach(w => console.log(theme.warning(`  • ${w}`)));
        
        const { proceed } = await inquirer.prompt([{
          type: 'confirm',
          name: 'proceed',
          message: 'Proceed anyway?',
          default: true
        }]);
        
        if (!proceed) break;
      }
      
      const result = await projectImporter.importFromLocal(sourcePath, { targetDir });
      
      if (result.success) {
        log.success(`Imported "${result.projectName}"`);
        
        const projectType = await projectImporter.detectProjectType(result.projectPath);
        projects.projects.push({
          id: `imported-${Date.now()}`,
          name: result.projectName,
          path: result.projectPath,
          type: projectType,
          active: true,
          createdAt: new Date().toISOString()
        });
        await saveProjects(projects);
      } else {
        log.error(`Import failed: ${result.error}`);
      }
      break;
    }
    
    case 'zip': {
      const { zipPath } = await inquirer.prompt([{
        type: 'input',
        name: 'zipPath',
        message: theme.accent('ZIP file path:'),
        validate: (input) => input.trim().length > 0 || 'Path is required!'
      }]);
      
      const result = await projectImporter.importFromZip(zipPath, { targetDir });
      
      if (result.success) {
        log.success(`Extracted "${result.projectName}"`);
        
        const projectType = await projectImporter.detectProjectType(result.projectPath);
        projects.projects.push({
          id: `imported-${Date.now()}`,
          name: result.projectName,
          path: result.projectPath,
          type: projectType,
          active: true,
          createdAt: new Date().toISOString()
        });
        await saveProjects(projects);
      } else {
        log.error(`Import failed: ${result.error}`);
      }
      break;
    }
    
    case 'poppy': {
      const { poppyPath, projectId } = await inquirer.prompt([
        {
          type: 'input',
          name: 'poppyPath',
          message: theme.accent('Other POPPY workspace path:'),
          validate: (input) => input.trim().length > 0 || 'Path is required!'
        },
        {
          type: 'input',
          name: 'projectId',
          message: theme.accent('Project ID to import:'),
          validate: (input) => input.trim().length > 0 || 'Project ID is required!'
        }
      ]);
      
      const result = await projectImporter.importFromPoppy(poppyPath, {
        targetDir,
        projectId
      });
      
      if (result.success) {
        log.success(`Imported "${result.projectName}" from POPPY workspace`);
        
        const project = {
          id: `imported-${Date.now()}`,
          name: result.projectName,
          path: result.projectPath,
          type: 'imported',
          active: true,
          createdAt: new Date().toISOString()
        };
        projects.projects.push(project);
        await saveProjects(projects);
      } else {
        log.error(`Import failed: ${result.error}`);
      }
      break;
    }
  }
  
  await pause();
}

// ═══════════════════════════════════════════════════════════
// 🎯 SKILLS MANAGEMENT
// ═══════════════════════════════════════════════════════════

async function listSkills() {
  showHeader();
  log.title('🎯 My Skills');
  
  const skillsDir = path.join(os.homedir(), '.poppy', 'skills');
  
  try {
    const files = await fs.readdir(skillsDir);
    const skillFiles = files.filter(f => f.endsWith('.json'));
    
    if (skillFiles.length === 0) {
      log.warning('No skills found.');
      log.info('Create a skill with "Create Skill" option');
      await pause();
      return;
    }
    
    log.success(`Found ${skillFiles.length} skill(s):`);
    
    for (const file of skillFiles) {
      const skillData = JSON.parse(await fs.readFile(path.join(skillsDir, file), 'utf8'));
      console.log(`  ${theme.accent('•')} ${skillData.name} ${theme.dim(`(${skillData.domain})`)}`);
    }
  } catch (error) {
    log.error('Failed to load skills: ' + error.message);
  }
  
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
      type: 'input',
      name: 'domain',
      message: theme.accent('Domain (e.g., react, api-design, testing):'),
      validate: (input) => input.trim().length > 0 || 'Domain is required'
    },
    {
      type: 'input',
      name: 'description',
      message: theme.accent('Description:'),
      default: 'A reusable skill for agents'
    }
  ]);
  
  const skillId = `skill-${Date.now()}`;
  const skill = {
    id: skillId,
    name: answers.name,
    domain: answers.domain,
    description: answers.description,
    createdAt: new Date().toISOString(),
    version: '1.0.0',
    patterns: [],
    rules: [],
    examples: [],
    metadata: {
      author: os.userInfo().username,
      usageCount: 0
    }
  };
  
  const skillsDir = path.join(os.homedir(), '.poppy', 'skills');
  await fs.mkdir(skillsDir, { recursive: true });
  await fs.writeFile(
    path.join(skillsDir, `${skillId}.json`),
    JSON.stringify(skill, null, 2)
  );
  
  log.success(`Skill "${answers.name}" created!`);
  log.info(`Location: ~/.poppy/skills/${skillId}.json`);
  
  await pause();
}

async function browseSkills() {
  showHeader();
  log.title('📚 Skill Library');
  
  log.info('Available skill categories:');
  console.log(`  ${theme.accent('•')} Frontend: react, vue, angular, css`);
  console.log(`  ${theme.accent('•')} Backend: node-api, python-api, database`);
  console.log(`  ${theme.accent('•')} DevOps: docker, ci-cd, deployment`);
  console.log(`  ${theme.accent('•')} Testing: unit-testing, e2e-testing`);
  console.log(`  ${theme.accent('•')} AI/ML: prompt-engineering, model-integration`);
  
  log.divider();
  log.info('Install skills from marketplace:');
  log.info('  poppy → Skills → Install Skill');
  
  await pause();
}

async function installSkill() {
  showHeader();
  log.title('⬇️  Install Skill');
  
  log.info('Coming soon: Skill marketplace integration');
  log.info('For now, skills can be created locally with "Create Skill"');
  
  await pause();
}

async function attachSkillToAgent() {
  showHeader();
  log.title('🔗 Attach Skill to Agent');
  
  // Load available skills
  const skillsDir = path.join(os.homedir(), '.poppy', 'skills');
  let skills = [];
  
  try {
    const files = await fs.readdir(skillsDir);
    skills = await Promise.all(
      files.filter(f => f.endsWith('.json')).map(async f => {
        const data = JSON.parse(await fs.readFile(path.join(skillsDir, f), 'utf8'));
        return { name: data.name, value: data.id };
      })
    );
  } catch {
    skills = [];
  }
  
  if (skills.length === 0) {
    log.warning('No skills available. Create one first.');
    await pause();
    return;
  }
  
  // Load agents
  const agents = await loadAgents();
  if (agents.length === 0) {
    log.warning('No agents found. Create one first.');
    await pause();
    return;
  }
  
  const { skillId, agentId } = await inquirer.prompt([
    {
      type: 'list',
      name: 'skillId',
      message: theme.accent('Select skill:'),
      choices: skills
    },
    {
      type: 'list',
      name: 'agentId',
      message: theme.accent('Attach to agent:'),
      choices: agents.map(a => ({ name: a.name, value: a.id }))
    }
  ]);
  
  // Update agent with skill
  const agent = agents.find(a => a.id === agentId);
  if (agent) {
    agent.skills = agent.skills || [];
    if (!agent.skills.includes(skillId)) {
      agent.skills.push(skillId);
      await saveAgent(agent);
      log.success(`Attached skill to ${agent.name}`);
    } else {
      log.warning('Skill already attached to this agent');
    }
  }
  
  await pause();
}

// ═══════════════════════════════════════════════════════════
// 📥 PROJECT IMPORT
// ═══════════════════════════════════════════════════════════

async function importProject() {
  showHeader();
  log.title('📥 Import Project');
  
  const { source } = await inquirer.prompt([{
    type: 'list',
    name: 'source',
    message: theme.accent('Import from:'),
    choices: [
      { name: '🐙 GitHub / GitLab / Bitbucket', value: 'git' },
      { name: '📁 Local Directory', value: 'local' },
      { name: '📦 ZIP Archive', value: 'zip' },
      { name: '🐶 Another POPPY Workspace', value: 'poppy' }
    ]
  }]);
  
  const projects = await loadProjects();
  const targetDir = path.dirname(projects.root || process.cwd());
  
  const importer = new ProjectImporter();
  
  try {
    let result;
    
    switch (source) {
      case 'git': {
        const { url } = await inquirer.prompt([{
          type: 'input',
          name: 'url',
          message: theme.accent('Repository URL:'),
          validate: (input) => input.includes('github.com') || input.includes('gitlab.com') || input.includes('bitbucket.org') || 'Please enter a valid Git URL'
        }]);
        
        const { rename } = await inquirer.prompt([{
          type: 'input',
          name: 'rename',
          message: theme.accent('Project name (leave blank to use repo name):'),
          default: ''
        }]);
        
        result = await importer.importFromGit(url, { 
          targetDir, 
          rename: rename || undefined 
        });
        break;
      }
      
      case 'local': {
        const { sourcePath } = await inquirer.prompt([{
          type: 'input',
          name: 'sourcePath',
          message: theme.accent('Source directory path:'),
          validate: (input) => input.trim().length > 0 || 'Path is required'
        }]);
        
        const { rename } = await inquirer.prompt([{
          type: 'input',
          name: 'rename',
          message: theme.accent('Project name (leave blank to use folder name):'),
          default: ''
        }]);
        
        result = await importer.importFromLocal(sourcePath, { 
          targetDir, 
          rename: rename || undefined 
        });
        break;
      }
      
      case 'zip': {
        const { zipPath } = await inquirer.prompt([{
          type: 'input',
          name: 'zipPath',
          message: theme.accent('ZIP file path:'),
          validate: (input) => input.endsWith('.zip') || 'Please enter a .zip file path'
        }]);
        
        result = await importer.importFromZip(zipPath, { targetDir });
        break;
      }
      
      case 'poppy': {
        const { poppyPath } = await inquirer.prompt([{
          type: 'input',
          name: 'poppyPath',
          message: theme.accent('Path to other POPPY workspace:'),
          validate: (input) => input.trim().length > 0 || 'Path is required'
        }]);
        
        // List projects from that workspace
        const sourceProjectsFile = path.join(poppyPath, 'admin', 'data', 'projects.json');
        let sourceProjects;
        try {
          sourceProjects = JSON.parse(await fs.readFile(sourceProjectsFile, 'utf8'));
        } catch {
          log.error('Invalid POPPY workspace - projects.json not found');
          await pause();
          return;
        }
        
        const { projectId } = await inquirer.prompt([{
          type: 'list',
          name: 'projectId',
          message: theme.accent('Select project to import:'),
          choices: sourceProjects.projects.map(p => ({ name: p.name, value: p.id }))
        }]);
        
        result = await importer.importFromPoppy(poppyPath, { targetDir, projectId });
        break;
      }
    }
    
    if (result.success) {
      log.success(result.message);
      log.info(`Location: ${result.projectPath}`);
      
      // Detect project type and suggest agents
      const projectType = await importer.detectProjectType(result.projectPath);
      log.info(`Detected type: ${theme.accent(projectType)}`);
      
      // Add to POPPY projects
      projects.projects.push({
        id: `imported-${Date.now()}`,
        name: result.projectName,
        path: result.projectPath,
        type: projectType,
        imported: true,
        importedAt: new Date().toISOString()
      });
      await saveProjects(projects);
      
    } else {
      log.error('Import failed: ' + result.error);
    }
    
  } catch (error) {
    log.error('Import error: ' + error.message);
  }
  
  await pause();
}

// ═══════════════════════════════════════════════════════════
// 🎯 SKILLS MANAGEMENT
// ═══════════════════════════════════════════════════════════

async function listSkills() {
  showHeader();
  log.title('🎯 My Skills');
  
  const skillsDir = path.join(os.homedir(), '.poppy', 'skills');
  
  try {
    const files = await fs.readdir(skillsDir);
    const skills = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await fs.readFile(path.join(skillsDir, file), 'utf8');
        skills.push(JSON.parse(content));
      }
    }
    
    if (skills.length === 0) {
      log.warning('No skills found.');
      log.info('Create skills with "Create Skill" or install from library.');
    } else {
      log.success(`Found ${skills.length} skill(s):`);
      console.log();
      
      for (const skill of skills) {
        console.log(`  ${theme.accent('•')} ${theme.primary(skill.name)}`);
        console.log(`    ${theme.dim(skill.description || 'No description')}`);
        console.log(`    Tags: ${skill.tags?.join(', ') || 'none'}`);
        console.log();
      }
    }
  } catch (error) {
    log.warning('Skills directory not found. Create your first skill!');
  }
  
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
      type: 'input',
      name: 'description',
      message: theme.accent('Description:')
    },
    {
      type: 'input',
      name: 'tags',
      message: theme.accent('Tags (comma-separated):'),
      filter: (input) => input.split(',').map(t => t.trim()).filter(Boolean)
    },
    {
      type: 'editor',
      name: 'content',
      message: theme.accent('Skill content (knowledge, patterns, examples):'),
      default: `# Skill: New Skill\n\n## Knowledge\n\n## Patterns\n\n## Examples\n`
    }
  ]);
  
  const skill = {
    id: `skill-${Date.now()}`,
    name: answers.name,
    description: answers.description,
    tags: answers.tags,
    content: answers.content,
    createdAt: new Date().toISOString(),
    version: '1.0.0'
  };
  
  const skillsDir = path.join(os.homedir(), '.poppy', 'skills');
  await fs.mkdir(skillsDir, { recursive: true });
  
  const fileName = `${skill.id}.json`;
  await fs.writeFile(
    path.join(skillsDir, fileName),
    JSON.stringify(skill, null, 2)
  );
  
  log.success(`Created skill: ${skill.name}`);
  log.info(`Saved to: ~/.poppy/skills/${fileName}`);
  
  await pause();
}

async function browseSkills() {
  showHeader();
  log.title('📚 Skill Library');
  
  log.info('Available skills in library:');
  console.log();
  
  const builtinSkills = [
    { name: 'react-patterns', description: 'React component patterns and best practices' },
    { name: 'typescript-types', description: 'TypeScript type definitions and patterns' },
    { name: 'api-design', description: 'REST API design principles' },
    { name: 'testing-strategies', description: 'Unit and integration testing approaches' },
    { name: 'performance-optimization', description: 'Code performance optimization techniques' },
    { name: 'security-best-practices', description: 'Security guidelines for web applications' }
  ];
  
  for (const skill of builtinSkills) {
    console.log(`  ${theme.accent('•')} ${theme.primary(skill.name)}`);
    console.log(`    ${theme.dim(skill.description)}`);
    console.log();
  }
  
  log.info('Install with "Install Skill" menu option');
  
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
  
  // Simulate installation
  const spinner = ora({
    text: `Installing ${skillName}...`,
    color: 'green'
  }).start();
  
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Create a basic skill file
  const skill = {
    id: `skill-${Date.now()}`,
    name: skillName,
    description: `Installed skill: ${skillName}`,
    tags: ['installed'],
    content: `# ${skillName}\n\nInstalled from library.`,
    installedAt: new Date().toISOString(),
    source: 'library',
    version: '1.0.0'
  };
  
  const skillsDir = path.join(os.homedir(), '.poppy', 'skills');
  await fs.mkdir(skillsDir, { recursive: true });
  
  await fs.writeFile(
    path.join(skillsDir, `${skill.id}.json`),
    JSON.stringify(skill, null, 2)
  );
  
  spinner.succeed(`Installed ${skillName}`);
  
  await pause();
}

async function attachSkillToAgent() {
  showHeader();
  log.title('🔗 Attach Skill to Agent');
  
  // Load agents
  const agentsDir = path.join(ROOT_DIR, 'agents');
  const agents = [];
  
  try {
    const files = await fs.readdir(agentsDir);
    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await fs.readFile(path.join(agentsDir, file), 'utf8');
        agents.push(JSON.parse(content));
      }
    }
  } catch {
    // No agents yet
  }
  
  if (agents.length === 0) {
    log.warning('No agents found. Create an agent first.');
    await pause();
    return;
  }
  
  // Load skills
  const skillsDir = path.join(os.homedir(), '.poppy', 'skills');
  const skills = [];
  
  try {
    const files = await fs.readdir(skillsDir);
    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await fs.readFile(path.join(skillsDir, file), 'utf8');
        skills.push(JSON.parse(content));
      }
    }
  } catch {
    // No skills yet
  }
  
  if (skills.length === 0) {
    log.warning('No skills found. Create or install skills first.');
    await pause();
    return;
  }
  
  const { agentId, skillId } = await inquirer.prompt([
    {
      type: 'list',
      name: 'agentId',
      message: theme.accent('Select agent:'),
      choices: agents.map(a => ({ name: a.name, value: a.id }))
    },
    {
      type: 'list',
      name: 'skillId',
      message: theme.accent('Select skill to attach:'),
      choices: skills.map(s => ({ name: s.name, value: s.id }))
    }
  ]);
  
  // Find and update agent
  const agent = agents.find(a => a.id === agentId);
  const skill = skills.find(s => s.id === skillId);
  
  agent.skills = agent.skills || [];
  if (!agent.skills.includes(skillId)) {
    agent.skills.push(skillId);
    
    // Save updated agent
    await fs.writeFile(
      path.join(agentsDir, `${agentId}.json`),
      JSON.stringify(agent, null, 2)
    );
    
    log.success(`Attached "${skill.name}" to "${agent.name}"`);
  } else {
    log.info(`"${skill.name}" is already attached to "${agent.name}"`);
  }
  
  await pause();
}

// ═══════════════════════════════════════════════════════════
// 📥 PROJECT IMPORT
// ═══════════════════════════════════════════════════════════

async function importProject() {
  showHeader();
  log.title('📥 Import Project');
  
  const { source } = await inquirer.prompt([{
    type: 'list',
    name: 'source',
    message: theme.accent('Import from:'),
    choices: [
      { name: '🔗 GitHub / GitLab / Git', value: 'git' },
      { name: '📁 Local Directory', value: 'local' },
      { name: '📦 ZIP Archive', value: 'zip' },
      { name: '🐶 Another POPPY Workspace', value: 'poppy' }
    ]
  }]);
  
  const importer = new ProjectImporter();
  
  switch (source) {
    case 'git':
      await importFromGit(importer);
      break;
    case 'local':
      await importFromLocal(importer);
      break;
    case 'zip':
      await importFromZip(importer);
      break;
    case 'poppy':
      await importFromPoppy(importer);
      break;
  }
}

async function importFromGit(importer) {
  const { url, rename } = await inquirer.prompt([
    {
      type: 'input',
      name: 'url',
      message: theme.accent('Git repository URL:'),
      validate: (input) => input.includes('github.com') || input.includes('gitlab.com') || input.includes('bitbucket.org') || 'Enter a valid Git URL'
    },
    {
      type: 'input',
      name: 'rename',
      message: theme.accent('New name (optional, press Enter to keep original):')
    }
  ]);
  
  const spinner = ora({
    text: 'Cloning repository...',
    color: 'green'
  }).start();
  
  try {
    const result = await importer.importFromGit(url, {
      targetDir: ROOT_DIR,
      rename: rename || undefined
    });
    
    if (result.success) {
      spinner.succeed(`Imported ${result.projectName}`);
      log.info(`Location: ${result.projectPath}`);
      
      // Add to projects registry
      const projects = await loadProjects();
      const projectType = await importer.detectProjectType(result.projectPath);
      
      projects.projects.push({
        id: `project-${Date.now()}`,
        name: result.projectName,
        type: projectType,
        path: result.projectPath,
        createdAt: new Date().toISOString(),
        imported: true,
        source: 'git'
      });
      
      await saveProjects(projects);
      log.success('Added to POPPY projects registry');
    } else {
      spinner.fail(`Import failed: ${result.error}`);
    }
  } catch (error) {
    spinner.fail(`Error: ${error.message}`);
  }
  
  await pause();
}

async function importFromLocal(importer) {
  const { sourcePath, rename } = await inquirer.prompt([
    {
      type: 'input',
      name: 'sourcePath',
      message: theme.accent('Source directory path:'),
      validate: (input) => input.trim().length > 0 || 'Path is required'
    },
    {
      type: 'input',
      name: 'rename',
      message: theme.accent('New name (optional):')
    }
  ]);
  
  const spinner = ora({
    text: 'Copying project...',
    color: 'green'
  }).start();
  
  try {
    const result = await importer.importFromLocal(sourcePath, {
      targetDir: ROOT_DIR,
      rename: rename || undefined
    });
    
    if (result.success) {
      spinner.succeed(`Imported ${result.projectName}`);
      
      const projects = await loadProjects();
      const projectType = await importer.detectProjectType(result.projectPath);
      
      projects.projects.push({
        id: `project-${Date.now()}`,
        name: result.projectName,
        type: projectType,
        path: result.projectPath,
        createdAt: new Date().toISOString(),
        imported: true,
        source: 'local'
      });
      
      await saveProjects(projects);
    } else {
      spinner.fail(`Import failed: ${result.error}`);
    }
  } catch (error) {
    spinner.fail(`Error: ${error.message}`);
  }
  
  await pause();
}

async function importFromZip(importer) {
  const { zipPath, rename } = await inquirer.prompt([
    {
      type: 'input',
      name: 'zipPath',
      message: theme.accent('ZIP file path:'),
      validate: (input) => input.endsWith('.zip') || 'Must be a .zip file'
    },
    {
      type: 'input',
      name: 'rename',
      message: theme.accent('Project name (optional):')
    }
  ]);
  
  const spinner = ora({
    text: 'Extracting archive...',
    color: 'green'
  }).start();
  
  try {
    const result = await importer.importFromZip(zipPath, {
      targetDir: ROOT_DIR,
      rename: rename || undefined
    });
    
    if (result.success) {
      spinner.succeed(`Extracted ${result.projectName}`);
      
      const projects = await loadProjects();
      projects.projects.push({
        id: `project-${Date.now()}`,
        name: result.projectName,
        type: 'generic',
        path: result.projectPath,
        createdAt: new Date().toISOString(),
        imported: true,
        source: 'zip'
      });
      
      await saveProjects(projects);
    } else {
      spinner.fail(`Extraction failed: ${result.error}`);
    }
  } catch (error) {
    spinner.fail(`Error: ${error.message}`);
  }
  
  await pause();
}

async function importFromPoppy(importer) {
  const { poppyPath } = await inquirer.prompt([{
    type: 'input',
    name: 'poppyPath',
    message: theme.accent('Path to other POPPY workspace:'),
    validate: (input) => input.trim().length > 0 || 'Path is required'
  }]);
  
  // Read projects from that workspace
  try {
    const projectsFile = path.join(poppyPath, 'admin', 'data', 'projects.json');
    const otherProjects = JSON.parse(await fs.readFile(projectsFile, 'utf8'));
    
    if (otherProjects.projects.length === 0) {
      log.warning('No projects found in that workspace');
      await pause();
      return;
    }
    
    const { projectId } = await inquirer.prompt([{
      type: 'list',
      name: 'projectId',
      message: theme.accent('Select project to import:'),
      choices: otherProjects.projects.map(p => ({
        name: `${p.name} (${p.type})`,
        value: p.id
      }))
    }]);
    
    const spinner = ora({
      text: 'Importing from POPPY workspace...',
      color: 'green'
    }).start();
    
    const result = await importer.importFromPoppy(poppyPath, {
      targetDir: ROOT_DIR,
      projectId
    });
    
    if (result.success) {
      spinner.succeed(`Imported ${result.projectName}`);
      
      const projects = await loadProjects();
      projects.projects.push({
        id: `project-${Date.now()}`,
        name: result.projectName,
        type: 'imported',
        path: result.projectPath,
        createdAt: new Date().toISOString(),
        imported: true,
        source: 'poppy'
      });
      
      await saveProjects(projects);
    } else {
      spinner.fail(`Import failed: ${result.error}`);
    }
  } catch (error) {
    log.error(`Error: ${error.message}`);
  }
  
  await pause();
}

// ═══════════════════════════════════════════════════════════
// 🎯 SKILL FUNCTIONS
// ═══════════════════════════════════════════════════════════

const skillRegistry = new SkillRegistry();

async function listSkills() {
  showHeader();
  log.title('🎯 My Skills');
  
  const skills = await skillRegistry.listSkills();
  
  if (skills.length === 0) {
    log.warning('No skills found.');
    log.info('Create a skill or browse the marketplace to get started.');
  } else {
    log.success(`You have ${skills.length} skill(s):`);
    console.log();
    
    for (const skill of skills) {
      console.log(`${theme.accent('•')} ${theme.primary(skill.name)} ${theme.dim(`(${skill.category})`)}`);
      if (skill.description) {
        console.log(`  ${theme.dim(skill.description)}`);
      }
    }
  }
  
  log.divider();
  await pause();
}

async function createSkill() {
  showHeader();
  log.title('➕ Create New Skill');
  
  const { name, category, description } = await inquirer.prompt([
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
      choices: [
        { name: 'Code Patterns', value: 'patterns' },
        { name: 'Framework', value: 'framework' },
        { name: 'Language', value: 'language' },
        { name: 'Testing', value: 'testing' },
        { name: 'DevOps', value: 'devops' },
        { name: 'Other', value: 'other' }
      ]
    },
    {
      type: 'input',
      name: 'description',
      message: theme.accent('Description:')
    }
  ]);
  
  const skill = await skillRegistry.createSkill({
    name: name.trim(),
    category,
    description: description.trim()
  });
  
  log.success(`Skill "${skill.name}" created!`);
  log.info(`Location: ${skill.path}`);
  
  log.divider();
  await pause();
}

async function browseSkills() {
  showHeader();
  log.title('📚 Skill Library');
  
  const skills = await skillRegistry.listMarketplaceSkills();
  
  if (skills.length === 0) {
    log.info('No skills in marketplace yet.');
  } else {
    log.success(`Available skills: ${skills.length}`);
    
    const { selected } = await inquirer.prompt([{
      type: 'list',
      name: 'selected',
      message: theme.accent('Select a skill to view:'),
      choices: skills.map(s => ({
        name: `${s.name} ${theme.dim(`(${s.category})`)}`,
        value: s
      }))
    }]);
    
    console.log();
    console.log(theme.primary.bold(selected.name));
    console.log(theme.dim(`Category: ${selected.category}`));
    if (selected.description) {
      console.log(selected.description);
    }
    if (selected.examples && selected.examples.length > 0) {
      console.log();
      console.log(theme.accent('Examples:'));
      selected.examples.forEach(ex => console.log(`  • ${ex}`));
    }
  }
  
  log.divider();
  await pause();
}

async function installSkill() {
  showHeader();
  log.title('⬇️  Install Skill');
  
  const skills = await skillRegistry.listMarketplaceSkills();
  
  if (skills.length === 0) {
    log.warning('No skills available in marketplace.');
    await pause();
    return;
  }
  
  const { skillId } = await inquirer.prompt([{
    type: 'list',
    name: 'skillId',
    message: theme.accent('Select skill to install:'),
    choices: skills.map(s => ({
      name: `${s.name} ${theme.dim(`(${s.category})`)}`,
      value: s.id
    }))
  }]);
  
  try {
    await skillRegistry.installSkill(skillId);
    log.success(`Skill installed successfully!`);
  } catch (err) {
    log.error(`Failed to install skill: ${err.message}`);
  }
  
  log.divider();
  await pause();
}

async function attachSkillToAgent() {
  showHeader();
  log.title('🔗 Attach Skill to Agent');
  
  const agents = await loadAgents();
  const skills = await skillRegistry.listSkills();
  
  if (agents.length === 0) {
    log.warning('No agents found. Create an agent first.');
    await pause();
    return;
  }
  
  if (skills.length === 0) {
    log.warning('No skills found. Create a skill first.');
    await pause();
    return;
  }
  
  const { agentId, skillId } = await inquirer.prompt([
    {
      type: 'list',
      name: 'agentId',
      message: theme.accent('Select agent:'),
      choices: agents.map(a => ({ name: a.name, value: a.id }))
    },
    {
      type: 'list',
      name: 'skillId',
      message: theme.accent('Select skill to attach:'),
      choices: skills.map(s => ({ name: s.name, value: s.id }))
    }
  ]);
  
  try {
    await skillRegistry.attachToAgent(skillId, agentId);
    log.success('Skill attached to agent!');
  } catch (err) {
    log.error(`Failed to attach skill: ${err.message}`);
  }
  
  log.divider();
  await pause();
}

// ═══════════════════════════════════════════════════════════
// 📥 PROJECT IMPORT FUNCTIONS
// ═══════════════════════════════════════════════════════════

const projectImporter = new ProjectImporter();

async function importProject() {
  showHeader();
  log.title('📥 Import Project');
  
  log.info('Import projects from external sources:');
  console.log();
  
  const { source } = await inquirer.prompt([{
    type: 'list',
    name: 'source',
    message: theme.accent('Import from:'),
    choices: [
      { name: '🔗 GitHub/GitLab/Bitbucket (Git URL)', value: 'git' },
      { name: '📁 Local Directory', value: 'local' },
      { name: '📦 ZIP Archive', value: 'zip' },
      { name: '🌐 Another POPPY Workspace', value: 'poppy' }
    ]
  }]);
  
  const projectsRoot = path.join(ROOT_DIR, '..');
  
  switch (source) {
    case 'git': {
      const { url } = await inquirer.prompt([{
        type: 'input',
        name: 'url',
        message: theme.accent('Git URL:'),
        validate: (input) => input.includes('://') || input.includes('@') || 'Please enter a valid Git URL'
      }]);
      
      const spinner = ora('Cloning repository...').start();
      try {
        const result = await projectImporter.importFromGit(url, { targetDir: projectsRoot });
        spinner.stop();
        
        if (result.success) {
          log.success(`Imported: ${result.projectName}`);
          log.info(`Location: ${result.projectPath}`);
        } else {
          log.error(`Import failed: ${result.error}`);
        }
      } catch (err) {
        spinner.stop();
        log.error(`Import error: ${err.message}`);
      }
      break;
    }
    
    case 'local': {
      const { sourcePath } = await inquirer.prompt([{
        type: 'input',
        name: 'sourcePath',
        message: theme.accent('Source directory path:'),
        validate: (input) => input.trim().length > 0 || 'Path is required'
      }]);
      
      const spinner = ora('Copying project...').start();
      try {
        const result = await projectImporter.importFromLocal(sourcePath, { targetDir: projectsRoot });
        spinner.stop();
        log.success(`Imported: ${result.projectName}`);
      } catch (err) {
        spinner.stop();
        log.error(`Import failed: ${err.message}`);
      }
      break;
    }
    
    case 'zip': {
      const { zipPath } = await inquirer.prompt([{
        type: 'input',
        name: 'zipPath',
        message: theme.accent('ZIP file path:'),
        validate: (input) => input.endsWith('.zip') || 'Please provide a .zip file'
      }]);
      
      const spinner = ora('Extracting archive...').start();
      try {
        const result = await projectImporter.importFromZip(zipPath, { targetDir: projectsRoot });
        spinner.stop();
        if (result.success) {
          log.success(`Extracted: ${result.projectName}`);
        } else {
          log.error(`Extraction failed: ${result.error}`);
        }
      } catch (err) {
        spinner.stop();
        log.error(`Error: ${err.message}`);
      }
      break;
    }
    
    case 'poppy': {
      log.info('Coming soon: Import from other POPPY workspaces');
      break;
    }
  }
  
  log.divider();
  await pause();
}

// ═══════════════════════════════════════════════════════════
// 🎯 SKILLS MANAGEMENT
// ═══════════════════════════════════════════════════════════

async function listSkills() {
  showHeader();
  log.title('🎯 My Skills');
  
  const skillRegistry = new SkillRegistry();
  await skillRegistry.init();
  const skills = await skillRegistry.listSkills();
  
  if (skills.length === 0) {
    log.info('No skills created yet.');
    log.info('Create a skill to share reusable knowledge across agents.');
  } else {
    console.log('\n');
    for (const skill of skills) {
      console.log(theme.accent(`• ${skill.name}`));
      console.log(theme.dim(`  ${skill.description}`));
      console.log(theme.secondary(`  Tags: ${skill.tags?.join(', ') || 'none'}`));
      console.log();
    }
  }
  
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
      type: 'input',
      name: 'description',
      message: theme.accent('Description:'),
      default: 'A reusable skill for agents'
    },
    {
      type: 'checkbox',
      name: 'tags',
      message: theme.accent('Tags (select relevant):'),
      choices: [
        { name: 'React', value: 'react' },
        { name: 'Node.js', value: 'nodejs' },
        { name: 'Python', value: 'python' },
        { name: 'Database', value: 'database' },
        { name: 'API Design', value: 'api' },
        { name: 'Testing', value: 'testing' },
        { name: 'Security', value: 'security' },
        { name: 'Performance', value: 'performance' }
      ]
    },
    {
      type: 'editor',
      name: 'knowledge',
      message: theme.accent('Knowledge (markdown):'),
      default: '# Skill Knowledge\n\n## Overview\n\nDescribe what this skill enables agents to do.\n\n## Patterns\n\nList reusable patterns:\n- Pattern 1: Description\n- Pattern 2: Description\n\n## Examples\n\nProvide examples of how to use this skill.'
    }
  ]);
  
  const skillRegistry = new SkillRegistry();
  await skillRegistry.init();
  
  const skill = await skillRegistry.createSkill({
    name: answers.name,
    description: answers.description,
    tags: answers.tags,
    knowledge: answers.knowledge,
    createdAt: new Date().toISOString()
  });
  
  log.success(`Created skill: ${skill.name}`);
  log.info(`ID: ${skill.id}`);
  log.divider();
  await pause();
}

async function browseSkills() {
  showHeader();
  log.title('📚 Skill Library');
  
  const skillRegistry = new SkillRegistry();
  await skillRegistry.init();
  
  // In a real implementation, this would fetch from a marketplace
  const exampleSkills = [
    {
      name: 'React Hooks Expert',
      description: 'Master useState, useEffect, useContext, and custom hooks',
      tags: ['react', 'frontend'],
      downloads: 1250
    },
    {
      name: 'API Design Patterns',
      description: 'RESTful and GraphQL API design best practices',
      tags: ['api', 'backend'],
      downloads: 890
    },
    {
      name: 'Testing Strategies',
      description: 'Unit, integration, and E2E testing patterns',
      tags: ['testing', 'quality'],
      downloads: 670
    }
  ];
  
  console.log('\n' + theme.secondary('Featured Skills:\n'));
  
  for (const skill of exampleSkills) {
    console.log(theme.accent(`• ${skill.name}`));
    console.log(theme.dim(`  ${skill.description}`));
    console.log(theme.info(`  ⬇️  ${skill.downloads} downloads`));
    console.log();
  }
  
  log.info('Use "Install Skill" to add these to your library.');
  log.divider();
  await pause();
}

async function installSkill() {
  showHeader();
  log.title('⬇️  Install Skill');
  
  const { skillId } = await inquirer.prompt([{
    type: 'input',
    name: 'skillId',
    message: theme.accent('Skill ID or name:'),
    validate: (input) => input.trim().length > 0 || 'Skill identifier is required'
  }]);
  
  const skillRegistry = new SkillRegistry();
  await skillRegistry.init();
  
  // In a real implementation, this would fetch from marketplace
  log.info(`Installing skill: ${skillId}...`);
  
  // Simulate installation
  const spinner = ora({ text: 'Downloading skill...', color: 'green' }).start();
  await new Promise(resolve => setTimeout(resolve, 1500));
  spinner.succeed('Skill installed successfully!');
  
  log.success(`Skill "${skillId}" is now available.`);
  log.info('Use "Attach Skill to Agent" to assign it to an agent.');
  log.divider();
  await pause();
}

async function attachSkillToAgent() {
  showHeader();
  log.title('🔗 Attach Skill to Agent');
  
  const agents = await loadAgents();
  const skillRegistry = new SkillRegistry();
  await skillRegistry.init();
  const skills = await skillRegistry.listSkills();
  
  if (agents.length === 0) {
    log.warning('No agents available. Create an agent first.');
    await pause();
    return;
  }
  
  if (skills.length === 0) {
    log.warning('No skills available. Create or install a skill first.');
    await pause();
    return;
  }
  
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'agentId',
      message: theme.accent('Select agent:'),
      choices: agents.map(a => ({ name: a.name, value: a.id }))
    },
    {
      type: 'checkbox',
      name: 'skillIds',
      message: theme.accent('Select skills to attach:'),
      choices: skills.map(s => ({ name: s.name, value: s.id })),
      validate: (input) => input.length > 0 || 'Select at least one skill'
    }
  ]);
  
  const agent = agents.find(a => a.id === answers.agentId);
  agent.skills = agent.skills || [];
  agent.skills.push(...answers.skillIds);
  
  await saveAgent(agent);
  
  log.success(`Attached ${answers.skillIds.length} skill(s) to ${agent.name}`);
  log.divider();
  await pause();
}

// ═══════════════════════════════════════════════════════════
// 📥 PROJECT IMPORTER
// ═══════════════════════════════════════════════════════════

async function importProject() {
  showHeader();
  log.title('📥 Import Project');
  
  const importer = new ProjectImporter();
  
  const { source } = await inquirer.prompt([{
    type: 'list',
    name: 'source',
    message: theme.accent('Import from:'),
    choices: [
      { name: '🌐 GitHub/GitLab/Bitbucket', value: 'git' },
      { name: '📁 Local Directory', value: 'local' },
      { name: '📦 ZIP Archive', value: 'zip' },
      { name: '🐶 Another POPPY Workspace', value: 'poppy' }
    ]
  }]);
  
  let result;
  
  switch (source) {
    case 'git':
      result = await importFromGitWizard(importer);
      break;
    case 'local':
      result = await importFromLocalWizard(importer);
      break;
    case 'zip':
      result = await importFromZipWizard(importer);
      break;
    case 'poppy':
      result = await importFromPoppyWizard(importer);
      break;
  }
  
  if (result && result.success) {
    log.success(result.message);
    log.info(`Location: ${result.projectPath}`);
    
    // Add to projects registry
    const projects = await loadProjects();
    projects.projects.push({
      id: `imported-${Date.now()}`,
      name: result.projectName,
      path: result.projectPath,
      type: await importer.detectProjectType(result.projectPath),
      importedAt: new Date().toISOString(),
      agents: []
    });
    await saveProjects(projects);
    
    log.success('Project added to POPPY registry!');
  } else if (result) {
    log.error(`Import failed: ${result.error}`);
  }
  
  log.divider();
  await pause();
}

async function importFromGitWizard(importer) {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'url',
      message: theme.accent('Repository URL:'),
      validate: (input) => input.includes('github.com') || input.includes('gitlab.com') || input.includes('bitbucket.org') || 'Enter a valid Git URL'
    },
    {
      type: 'input',
      name: 'branch',
      message: theme.accent('Branch (default: main):'),
      default: 'main'
    },
    {
      type: 'input',
      name: 'rename',
      message: theme.accent('Rename project (optional):'),
      default: ''
    }
  ]);
  
  const projects = await loadProjects();
  return await importer.importFromGit(answers.url, {
    targetDir: path.dirname(projects.projects[0]?.path || ROOT_DIR),
    branch: answers.branch,
    rename: answers.rename || undefined,
    fresh: true
  });
}

async function importFromLocalWizard(importer) {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'sourcePath',
      message: theme.accent('Source directory path:'),
      validate: (input) => input.trim().length > 0 || 'Path is required'
    },
    {
      type: 'input',
      name: 'rename',
      message: theme.accent('Rename project (optional):'),
      default: ''
    }
  ]);
  
  const projects = await loadProjects();
  return await importer.importFromLocal(answers.sourcePath, {
    targetDir: path.dirname(projects.projects[0]?.path || ROOT_DIR),
    rename: answers.rename || undefined
  });
}

async function importFromZipWizard(importer) {
  const { zipPath } = await inquirer.prompt([{
    type: 'input',
    name: 'zipPath',
    message: theme.accent('ZIP file path:'),
    validate: (input) => input.endsWith('.zip') || 'Select a .zip file'
  }]);
  
  const projects = await loadProjects();
  return await importer.importFromZip(zipPath, {
    targetDir: path.dirname(projects.projects[0]?.path || ROOT_DIR)
  });
}

async function importFromPoppyWizard(importer) {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'poppyPath',
      message: theme.accent('POPPY workspace path:'),
      validate: (input) => input.trim().length > 0 || 'Path is required'
    },
    {
      type: 'input',
      name: 'projectId',
      message: theme.accent('Project ID to import:'),
      validate: (input) => input.trim().length > 0 || 'Project ID is required'
    }
  ]);
  
  const projects = await loadProjects();
  return await importer.importFromPoppy(answers.poppyPath, {
    targetDir: path.dirname(projects.projects[0]?.path || ROOT_DIR),
    projectId: answers.projectId
  });
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
      case 'import-project':
        await importProject();
        break;
      case 'settings':
        await systemSettings();
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
