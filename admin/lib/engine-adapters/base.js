/**
 * POPPY Engine Adapter Base Class
 * 
 * Universal interface for interacting with any AI coding engine.
 * POPPY sits ON TOP of these engines as a management layer.
 */

import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export class EngineAdapter {
  constructor(config = {}) {
    this.name = 'base';
    this.config = config;
    this.process = null;
    this.isActive = false;
  }

  /**
   * Detect if this engine is installed/available
   */
  async detect() {
    throw new Error('detect() must be implemented by subclass');
  }

  /**
   * Launch the engine with POPPY context
   */
  async launch(projectPath, options = {}) {
    throw new Error('launch() must be implemented by subclass');
  }

  /**
   * Inject agent context into running engine
   */
  async injectContext(context) {
    throw new Error('injectContext() must be implemented by subclass');
  }

  /**
   * Send command to engine
   */
  async sendCommand(command) {
    throw new Error('sendCommand() must be implemented by subclass');
  }

  /**
   * Get engine status
   */
  async getStatus() {
    return {
      name: this.name,
      active: this.isActive,
      pid: this.process?.pid
    };
  }

  /**
   * Kill engine process
   */
  async stop() {
    if (this.process) {
      this.process.kill();
      this.process = null;
      this.isActive = false;
    }
  }

  /**
   * Check if engine CLI is available
   */
  async checkCli(command) {
    try {
      await execAsync(`which ${command}`);
      return true;
    } catch {
      try {
        await execAsync(`where ${command}`);
        return true;
      } catch {
        return false;
      }
    }
  }
}

export default EngineAdapter;
