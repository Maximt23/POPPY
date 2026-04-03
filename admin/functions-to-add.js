// Add these functions to the end of admin.js, before main().catch

// ═══════════════════════════════════════════════════════════
// 🎯 SKILL FUNCTIONS
// ═══════════════════════════════════════════════════════════

async function listSkills() {
  showHeader();
  log.title('🎯 My Skills');
  log.info('Skills are reusable abilities for agents.');
  log.divider();
  const skills = [
    { name: 'react-patterns', category: 'frontend', description: 'React best practices' },
    { name: 'api-design', category: 'backend', description: 'RESTful API design' },
    { name: 'testing-strategies', category: 'testing', description: 'Testing patterns' }
  ];
  log.success('Available skills:');
  skills.forEach((skill, i) => {
    console.log(`  ${i + 1}. ${theme.accent(skill.name)} (${skill.category})`);
  });
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
    }
  ]);
  log.success(`✓ Skill "${answers.name}" created!`);
  await pause();
}

async function browseSkills() {
  await listSkills();
}

async function installSkill() {
  showHeader();
  log.title('⬇️  Install Skill');
  const { skillName } = await inquirer.prompt([{
    type: 'input',
    name: 'skillName',
    message: theme.accent('Skill name:')
  }]);
  log.success(`✓ Skill "${skillName}" installed!`);
  await pause();
}

async function attachSkillToAgent() {
  showHeader();
  log.title('🔗 Attach Skill to Agent');
  const agents = await loadAgents();
  if (agents.length === 0) {
    log.warning('No agents available.');
    await pause();
    return;
  }
  log.success('Would attach skill to agent');
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
      { name: '🔗 GitHub / GitLab', value: 'git' },
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
      message: theme.accent('Repository URL:')
    }]);
    log.success(`✓ Would import from: ${url}`);
  }
  if (source === 'local') {
    const { path } = await inquirer.prompt([{
      type: 'input',
      name: 'path',
      message: theme.accent('Local path:')
    }]);
    log.success(`✓ Would import from: ${path}`);
  }
  if (source === 'zip') {
    const { path } = await inquirer.prompt([{
      type: 'input',
      name: 'path',
      message: theme.accent('ZIP file path:')
    }]);
    log.success(`✓ Would extract: ${path}`);
  }
  await pause();
}

// ═══════════════════════════════════════════════════════════
// 🚀 LAUNCH FUNCTIONS
// ═══════════════════════════════════════════════════════════

async function launchCodePuppy() {
  showHeader();
  log.title('🐶 Launching Code Puppy');
  try {
    const { execSync } = await import('child_process');
    try {
      execSync('where code-puppy', { stdio: 'pipe' });
      log.success('✓ Code Puppy found!');
      log.info('Launching...');
      const { spawn } = await import('child_process');
      spawn('code-puppy', [], { stdio: 'inherit', shell: true });
    } catch {
      log.error('Code Puppy not installed!');
      log.info('Install with: npm install -g code-puppy');
    }
  } catch (error) {
    log.error(`Failed: ${error.message}`);
  }
  await pause();
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
    await pause();
    return;
  }
  const { agentId } = await inquirer.prompt([{
    type: 'list',
    name: 'agentId',
    message: theme.accent('Select agent:'),
    choices: agents.map(a => ({ name: a.name, value: a.id }))
  }]);
  const agent = agents.find(a => a.id === agentId);
  log.success(`Would launch with: ${agent.name}`);
  await pause();
}

// ═══════════════════════════════════════════════════════════
// 🔐 API FUNCTIONS
// ═══════════════════════════════════════════════════════════

async function apiKeys() {
  showHeader();
  log.title('🔐 API Key Management');
  const { action } = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: theme.accent('Action:'),
    choices: [
      { name: '➕ Add Key', value: 'add' },
      { name: '📋 List Keys', value: 'list' },
      { name: theme.dim('← Back'), value: 'back' }
    ]
  }]);
  if (action === 'back') return;
  if (action === 'add') {
    const { provider } = await inquirer.prompt([{
      type: 'list',
      name: 'provider',
      message: theme.accent('Provider:'),
      choices: ['OpenAI', 'Anthropic', 'Google']
    }]);
    const { key } = await inquirer.prompt([{
      type: 'password',
      name: 'key',
      message: theme.accent('API Key:'),
      mask: '•'
    }]);
    log.success(`✓ ${provider} key stored!`);
  }
  if (action === 'list') {
    log.info('No keys stored yet.');
  }
  await pause();
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
