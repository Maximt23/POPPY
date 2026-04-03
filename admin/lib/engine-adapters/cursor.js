/**
 * Cursor Adapter
 * 
 * POPPY integration with Cursor AI Editor
 */

import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import { EngineAdapter } from './base.js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

export class CursorAdapter extends EngineAdapter {
  constructor(config = {}) {
    super(config);
    this.name = 'cursor';
    this.cliName = 'cursor';
  }

  async detect() {
    // Check for cursor command (different on each platform)
    const platform = process.platform;
    
    if (platform === 'win32') {
      // Windows
      try {
        const { stdout } = await execAsync('where cursor');
        return stdout.includes('cursor');
      } catch {
        // Check common install location
        const cursorPath = path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'cursor', 'Cursor.exe');
        try {
          await fs.access(cursorPath);
          return true;
        } catch {
          return false;
        }
      }
    } else if (platform === 'darwin') {
      // macOS
      try {
        await execAsync('ls /Applications/Cursor.app');
        return true;
      } catch {
        return false;
      }
    } else {
      // Linux
      return await this.checkCli('cursor');
    }
  }

  async launch(projectPath, options = {}) {
    const cwd = projectPath || process.cwd();
    const platform = process.platform;

    console.log(`[POPPY] Launching Cursor in: ${cwd}`);
    
    if (options.agent) {
      console.log(`[POPPY] Configuring agent: ${options.agent.name}`);
      await this.injectContext({
        agent: options.agent,
        project: path.basename(cwd)
      }, cwd);
    }

    let command;
    let args = [];

    if (platform === 'win32') {
      command = 'cursor';
      args = [cwd];
    } else if (platform === 'darwin') {
      command = 'open';
      args = ['-a', 'Cursor', cwd];
    } else {
      command = 'cursor';
      args = [cwd];
    }

    this.process = spawn(command, args, {
      stdio: 'ignore', // Cursor is GUI, detach
      detached: true
    });

    this.isActive = true;

    // Cursor doesn't have a process we wait for
    console.log(`[POPPY] Cursor opened (PID: ${this.process.pid})`);
    
    // Unref so POPPY can continue
    this.process.unref();

    return this.process;
  }

  async injectContext(context, projectPath) {
    // Cursor uses .cursorrules file for AI context
    const cursorRulesPath = path.join(projectPath, '.cursorrules');
    
    const content = `# POPPY Agent Configuration
# Active: ${context.agent?.name || 'None'}

## Agent Role
${context.agent?.description || ''}

## System Instructions
${context.agent?.systemPrompt || ''}

## Coding Standards
${context.agent?.instructions?.join('\n') || 'Follow best practices'}

## Project Context
Name: ${context.project}
Managed by: POPPY Universal AI Project Manager

## Rules
- Always consult project memory
- Follow established patterns
- Maintain code quality
- Keep responses focused
`;

    try {
      const existing = await fs.readFile(cursorRulesPath, 'utf8');
      if (!existing.includes('POPPY Agent')) {
        await fs.writeFile(cursorRulesPath, existing + '\n\n' + content);
      }
    } catch {
      await fs.writeFile(cursorRulesPath, content);
    }

    // Also create .cursor/context.json for advanced features
    const cursorDir = path.join(projectPath, '.cursor');
    await fs.mkdir(cursorDir, { recursive: true });
    
    const contextJson = {
      poppy: {
        active: true,
        agent: context.agent?.id,
        project: context.project,
        timestamp: new Date().toISOString()
      }
    };
    
    await fs.writeFile(
      path.join(cursorDir, 'poppy-context.json'),
      JSON.stringify(contextJson, null, 2)
    );

    return cursorRulesPath;
  }
}

export default CursorAdapter;
