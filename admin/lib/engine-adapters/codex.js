/**
 * Codex (OpenAI) Adapter
 * 
 * POPPY integration with OpenAI Codex CLI
 */

import { spawn } from 'child_process';
import { EngineAdapter } from './base.js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export class CodexAdapter extends EngineAdapter {
  constructor(config = {}) {
    super(config);
    this.name = 'codex';
    this.cliName = 'codex';
  }

  async detect() {
    // Check if codex CLI is installed
    return await this.checkCli('codex');
  }

  async launch(projectPath, options = {}) {
    const args = [];
    
    // Add POPPY context file
    if (options.contextFile) {
      args.push('--context', options.contextFile);
    }
    
    // Add mode
    if (options.mode) {
      args.push('--mode', options.mode); // 'ask', 'code', 'agent'
    }
    
    // Add model preference
    if (options.model) {
      args.push('--model', options.model);
    }

    // Set working directory
    const cwd = projectPath || process.cwd();

    console.log(`[POPPY] Launching Codex in: ${cwd}`);
    console.log(`[POPPY] Mode: ${options.mode || 'default'}`);
    
    if (options.agent) {
      console.log(`[POPPY] Agent: ${options.agent.name}`);
    }

    // Spawn codex process
    this.process = spawn('codex', args, {
      cwd,
      stdio: 'inherit', // Let user interact directly
      env: {
        ...process.env,
        // Inject POPPY context into env vars
        POPPY_ACTIVE: 'true',
        POPPY_AGENT: options.agent?.id || '',
        POPPY_PROJECT: path.basename(cwd)
      }
    });

    this.isActive = true;

    // Handle process exit
    this.process.on('exit', (code) => {
      console.log(`[POPPY] Codex exited with code ${code}`);
      this.isActive = false;
      this.process = null;
    });

    return this.process;
  }

  async injectContext(context) {
    // Codex supports .codex.md files for context
    const contextFile = path.join(os.tmpdir(), `poppy-codex-context-${Date.now()}.md`);
    
    const content = `# POPPY Context
## Active Agent: ${context.agent?.name || 'None'}
## Project: ${context.project}

${context.agent?.systemPrompt || ''}

### Current Focus
${context.focus || 'No specific focus set'}

### Instructions
${context.agent?.instructions?.join('\n') || ''}

---
*Managed by POPPY*
`;

    await fs.writeFile(contextFile, content);
    return contextFile;
  }

  async createAgentMode(agent, projectPath) {
    // Create a .codex file for agent mode
    const codexConfig = {
      name: agent.name,
      description: agent.description,
      instructions: agent.systemPrompt || '',
      model: agent.recommendedModel || 'gpt-4',
      files: ['**/*'],
      exclude: ['node_modules/**', '.git/**']
    };

    const configPath = path.join(projectPath, '.codex');
    await fs.writeFile(configPath, JSON.stringify(codexConfig, null, 2));
    
    return configPath;
  }
}

export default CodexAdapter;
