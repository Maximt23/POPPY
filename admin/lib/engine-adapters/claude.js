/**
 * Claude Code Adapter
 * 
 * POPPY integration with Anthropic Claude Code CLI
 */

import { spawn } from 'child_process';
import { EngineAdapter } from './base.js';
import fs from 'fs/promises';
import path from 'path';

export class ClaudeAdapter extends EngineAdapter {
  constructor(config = {}) {
    super(config);
    this.name = 'claude-code';
    this.cliName = 'claude';
  }

  async detect() {
    return await this.checkCli('claude');
  }

  async launch(projectPath, options = {}) {
    const args = [];
    
    // Add allowed tools
    if (options.allowedTools) {
      args.push('--allowedTools', options.allowedTools.join(','));
    }
    
    // Add verbose mode for debugging
    if (options.verbose) {
      args.push('--verbose');
    }

    const cwd = projectPath || process.cwd();

    console.log(`[POPPY] Launching Claude Code in: ${cwd}`);
    
    if (options.agent) {
      console.log(`[POPPY] Injecting agent: ${options.agent.name}`);
      // Write agent context to CLAUDE.md
      await this.injectContext({
        agent: options.agent,
        project: path.basename(cwd),
        focus: options.focus
      }, cwd);
    }

    this.process = spawn('claude', args, {
      cwd,
      stdio: 'inherit',
      env: {
        ...process.env,
        POPPY_ACTIVE: 'true',
        POPPY_AGENT: options.agent?.id || '',
        POPPY_PROJECT: path.basename(cwd),
        // Set default model if specified
        ANTHROPIC_MODEL: options.model || 'claude-3-5-sonnet-20241022'
      }
    });

    this.isActive = true;

    this.process.on('exit', (code) => {
      console.log(`[POPPY] Claude exited with code ${code}`);
      this.isActive = false;
      this.process = null;
    });

    return this.process;
  }

  async injectContext(context, projectPath) {
    // Claude Code reads CLAUDE.md for context
    const claudeMdPath = path.join(projectPath, 'CLAUDE.md');
    
    const content = `# POPPY Context

You are operating under POPPY project management.

## Active Agent
**${context.agent?.name || 'General Assistant'}**
${context.agent?.description || ''}

## Project
${context.project}

## System Instructions
${context.agent?.systemPrompt || ''}

## Current Focus
${context.focus || 'Maintain code quality and follow best practices'}

## Specific Instructions
${context.agent?.instructions?.map(i => `- ${i}`).join('\n') || ''}

## Rules
1. Always check project memory before making decisions
2. Follow the project's coding standards
3. Consult shared rules when appropriate
4. Keep responses concise and actionable

---
*Managed by POPPY - Universal AI Project Manager*
`;

    // Check if CLAUDE.md exists
    try {
      await fs.access(claudeMdPath);
      // Append to existing
      const existing = await fs.readFile(claudeMdPath, 'utf8');
      if (!existing.includes('POPPY Context')) {
        await fs.writeFile(claudeMdPath, existing + '\n\n' + content);
      }
    } catch {
      // Create new
      await fs.writeFile(claudeMdPath, content);
    }

    return claudeMdPath;
  }

  async clearContext(projectPath) {
    // Remove POPPY context from CLAUDE.md
    const claudeMdPath = path.join(projectPath, 'CLAUDE.md');
    try {
      const content = await fs.readFile(claudeMdPath, 'utf8');
      const cleaned = content.replace(/# POPPY Context[\s\S]*?\*Managed by POPPY.*\n/, '');
      await fs.writeFile(claudeMdPath, cleaned);
    } catch {
      // File doesn't exist
    }
  }
}

export default ClaudeAdapter;
