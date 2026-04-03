#!/usr/bin/env node

/**
 * POPPY Engine Launch Demo
 * 
 * This demonstrates how POPPY detects and launches AI engines.
 * Run: node demo-engine-launch.js
 */

import { EngineManager } from './lib/engine-manager.js';
import chalk from 'chalk';

const theme = {
  primary: chalk.hex('#22c55e'),
  accent: chalk.hex('#4ade80'),
  dim: chalk.gray,
  warning: chalk.hex('#f59e0b')
};

console.log('\n' + theme.primary('╔══════════════════════════════════════════╗'));
console.log(theme.primary('║     POPPY Engine Detection Demo          ║'));
console.log(theme.primary('╚══════════════════════════════════════════╝'));
console.log();

const manager = new EngineManager();

// Detect engines
console.log(theme.accent('Scanning for AI engines...\n'));

const detected = await manager.detectEngines();

if (detected.length === 0) {
  console.log(theme.warning('❌ No AI engines detected!'));
  console.log(theme.dim('\nTo use POPPY, install one of:'));
  console.log('  • OpenAI Codex: npm install -g @openai/codex');
  console.log('  • Claude Code: npm install -g @anthropic-ai/claude-code');
  console.log('  • Cursor: Download from https://cursor.com');
  console.log();
  process.exit(1);
}

console.log(theme.accent(`✅ Found ${detected.length} AI engine(s):\n`));

for (const engine of detected) {
  console.log(`  ${theme.primary('●')} ${engine.label} ${theme.dim(`(${engine.name})`)}`);
}

console.log('\n' + theme.dim('─'.repeat(50)));
console.log(theme.accent('\nHow this works:'));
console.log(theme.dim('  1. POPPY detects which AI engines you have installed'));
console.log(theme.dim('  2. When you select "Launch with Agent", POPPY will:'));
console.log(theme.dim('     • Inject agent context into the engine'));
console.log(theme.dim('     • Launch the engine in your project directory'));
console.log(theme.dim('     • Pass along API keys securely'));
console.log();

console.log(theme.primary('Next steps:'));
console.log('  1. Run: ./SETUP_POPPY.cmd');
console.log('  2. Run: poppy');
console.log('  3. Select "Launch with Agent"');
console.log();
