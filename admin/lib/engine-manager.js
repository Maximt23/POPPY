/**
 * POPPY Engine Manager
 * 
 * Universal adapter system that lets POPPY sit ON TOP of any AI engine.
 * Manages multiple AI assistants from one interface.
 */

import { CodexAdapter } from './engine-adapters/codex.js';
import { ClaudeAdapter } from './engine-adapters/claude.js';
import { CursorAdapter } from './engine-adapters/cursor.js';
import inquirer from 'inquirer';
import chalk from 'chalk';

const theme = {
  primary: chalk.hex('#22c55e'),
  secondary: chalk.hex('#16a34a'),
  accent: chalk.hex('#4ade80'),
  info: chalk.hex('#3b82f6'),
  warning: chalk.hex('#f59e0b'),
  error: chalk.hex('#ef4444'),
  dim: chalk.gray
};

export class EngineManager {
  constructor() {
    this.engines = new Map();
    this.activeEngine = null;
    this.activeProcess = null;
    
    // Register all adapters
    this.register('codex', new CodexAdapter());
    this.register('claude-code', new ClaudeAdapter());
    this.register('cursor', new CursorAdapter());
  }

  register(name, adapter) {
    this.engines.set(name, adapter);
  }

  /**
   * Detect which engines are installed
   */
  async detectEngines() {
    const detected = [];
    
    for (const [name, adapter] of this.engines) {
      const available = await adapter.detect();
      if (available) {
        detected.push({
          name,
          adapter,
          label: this.getEngineLabel(name)
        });
      }
    }
    
    return detected;
  }

  /**
   * Get human-readable engine name
   */
  getEngineLabel(name) {
    const labels = {
      'codex': 'OpenAI Codex',
      'claude-code': 'Anthropic Claude Code',
      'cursor': 'Cursor Editor'
    };
    return labels[name] || name;
  }

  /**
   * Show engine selection menu
   */
  async selectEngine() {
    const detected = await this.detectEngines();
    
    if (detected.length === 0) {
      console.log(theme.error('[POPPY] No AI engines detected!'));
      console.log(theme.dim('Please install one of:'));
      console.log('  - OpenAI Codex: npm install -g @openai/codex');
      console.log('  - Claude Code: npm install -g @anthropic-ai/claude-code');
      console.log('  - Cursor: Download from cursor.com');
      return null;
    }
    
    if (detected.length === 1) {
      console.log(theme.accent(`[POPPY] Auto-selected: ${detected[0].label}`));
      return detected[0];
    }
    
    const { engine } = await inquirer.prompt([{
      type: 'list',
      name: 'engine',
      message: theme.primary('Which AI engine?'),
      choices: detected.map(e => ({
        name: `${e.label} ${theme.dim(`(${e.name})`)}`,
        value: e
      }))
    }]);
    
    return engine;
  }

  /**
   * Launch AI engine with POPPY context
   */
  async launch(projectPath, options = {}) {
    // Select engine if not specified
    let engine = options.engine;
    if (!engine) {
      const selected = await this.selectEngine();
      if (!selected) return null;
      engine = selected.name;
    }
    
    const adapter = this.engines.get(engine);
    if (!adapter) {
      console.log(theme.error(`[POPPY] Unknown engine: ${engine}`));
      return null;
    }

    // Inject agent context if provided
    if (options.agent) {
      console.log(theme.accent(`\n[POPPY] Activating agent: ${options.agent.name}`));
      console.log(theme.dim(`[POPPY] Description: ${options.agent.description}`));
      console.log(theme.dim(`[POPPY] Engine: ${this.getEngineLabel(engine)}\n`));
    }

    // Launch the engine
    this.activeEngine = engine;
    this.activeProcess = await adapter.launch(projectPath, {
      ...options,
      agent: options.agent,
      focus: options.focus,
      model: options.model
    });

    return this.activeProcess;
  }

  /**
   * Launch with specific agent from marketplace
   */
  async launchWithAgent(projectPath, agent, engine = null) {
    return this.launch(projectPath, {
      engine,
      agent,
      mode: 'agent',
      model: agent.recommendedModel
    });
  }

  /**
   * Quick launch - just open engine
   */
  async quickLaunch(projectPath) {
    return this.launch(projectPath, {});
  }

  /**
   * Switch active engine
   */
  async switchEngine(newEngine) {
    // Stop current
    if (this.activeProcess) {
      const currentAdapter = this.engines.get(this.activeEngine);
      if (currentAdapter) {
        await currentAdapter.stop();
      }
    }
    
    // Launch new
    return this.launch(process.cwd(), { engine: newEngine });
  }

  /**
   * Get status of all engines
   */
  async getAllStatus() {
    const status = [];
    
    for (const [name, adapter] of this.engines) {
      const detected = await adapter.detect();
      status.push({
        name,
        label: this.getEngineLabel(name),
        available: detected,
        active: name === this.activeEngine && this.activeProcess !== null
      });
    }
    
    return status;
  }

  /**
   * Show engine status in UI
   */
  async showStatus() {
    const status = await this.getAllStatus();
    
    console.log('\n' + theme.primary('AI Engines Status'));
    console.log(theme.dim('─'.repeat(50)));
    
    for (const s of status) {
      const icon = s.available ? theme.accent('✓') : theme.error('✗');
      const label = s.active ? theme.accent(`${s.label} (ACTIVE)`) : s.label;
      console.log(`${icon} ${label}`);
    }
    
    console.log(theme.dim('─'.repeat(50)) + '\n');
  }

  /**
   * Stop all engines
   */
  async stopAll() {
    for (const [name, adapter] of this.engines) {
      await adapter.stop();
    }
    this.activeEngine = null;
    this.activeProcess = null;
  }
}

export default EngineManager;
