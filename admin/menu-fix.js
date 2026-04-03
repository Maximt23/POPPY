// Clean collapsible menu structure for admin.js
// This file contains the new menu functions to be inserted

// Replace mainMenu function (lines 454-516 approximately)
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

  // Handle 'back' from submenus
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
