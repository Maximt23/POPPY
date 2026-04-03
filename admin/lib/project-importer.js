/**
 * POPPY Project Importer
 * 
 * Import projects from various sources:
 * - GitHub repositories
 * - GitLab repositories  
 * - Local directories
 * - ZIP archives
 * - Other POPPY workspaces
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import os from 'os';

const POPPY_DIR = path.join(os.homedir(), '.poppy');
const IMPORT_LOG = path.join(POPPY_DIR, 'import-log.json');

/**
 * Supported import sources
 */
export const ImportSources = {
  GITHUB: 'github',
  GITLAB: 'gitlab',
  BITBUCKET: 'bitbucket',
  LOCAL: 'local',
  ZIP: 'zip',
  POPPY: 'poppy'
};

/**
 * Import a project from various sources
 */
export class ProjectImporter {
  constructor() {
    this.ensureDirectories();
  }

  async ensureDirectories() {
    await fs.mkdir(POPPY_DIR, { recursive: true });
  }

  /**
   * Import from GitHub/GitLab/Bitbucket
   */
  async importFromGit(url, options = {}) {
    const { targetDir, branch = 'main', rename } = options;
    
    // Parse URL to get repo name
    const repoName = this.extractRepoName(url);
    const projectName = rename || repoName;
    const projectPath = path.join(targetDir, projectName);
    
    // Check if already exists
    try {
      await fs.access(projectPath);
      throw new Error(`Project ${projectName} already exists at ${projectPath}`);
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }
    
    // Clone the repository
    try {
      execSync(`git clone --branch ${branch} ${url} "${projectPath}"`, {
        stdio: 'pipe',
        timeout: 120000
      });
      
      // Remove .git to make it a fresh project (optional)
      if (options.fresh) {
        await fs.rm(path.join(projectPath, '.git'), { recursive: true, force: true });
      }
      
      await this.logImport({
        source: 'git',
        url,
        projectName,
        projectPath,
        timestamp: new Date().toISOString()
      });
      
      return {
        success: true,
        projectName,
        projectPath,
        message: `Imported ${repoName} from ${url}`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Import from local directory
   */
  async importFromLocal(sourcePath, options = {}) {
    const { targetDir, rename } = options;
    
    const projectName = rename || path.basename(sourcePath);
    const projectPath = path.join(targetDir, projectName);
    
    // Check source exists
    try {
      await fs.access(sourcePath);
    } catch {
      throw new Error(`Source path does not exist: ${sourcePath}`);
    }
    
    // Check if target exists
    try {
      await fs.access(projectPath);
      throw new Error(`Project ${projectName} already exists`);
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }
    
    // Copy directory
    await this.copyDirectory(sourcePath, projectPath);
    
    await this.logImport({
      source: 'local',
      from: sourcePath,
      projectName,
      projectPath,
      timestamp: new Date().toISOString()
    });
    
    return {
      success: true,
      projectName,
      projectPath,
      message: `Imported ${projectName} from ${sourcePath}`
    };
  }

  /**
   * Import from ZIP archive
   */
  async importFromZip(zipPath, options = {}) {
    const { targetDir, rename } = options;
    
    // Check if 7z or unzip is available
    const extractCmd = this.findZipExtractor();
    if (!extractCmd) {
      throw new Error('No ZIP extractor found. Install 7-Zip or unzip.');
    }
    
    const projectName = rename || path.basename(zipPath, '.zip');
    const projectPath = path.join(targetDir, projectName);
    
    // Extract
    try {
      if (extractCmd === '7z') {
        execSync(`7z x "${zipPath}" -o"${projectPath}" -y`, { stdio: 'pipe' });
      } else {
        execSync(`unzip -q "${zipPath}" -d "${projectPath}"`, { stdio: 'pipe' });
      }
      
      await this.logImport({
        source: 'zip',
        from: zipPath,
        projectName,
        projectPath,
        timestamp: new Date().toISOString()
      });
      
      return {
        success: true,
        projectName,
        projectPath,
        message: `Extracted ${projectName} from ${zipPath}`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Import from another POPPY workspace
   */
  async importFromPoppy(poppyPath, options = {}) {
    const { targetDir, projectId } = options;
    
    // Read projects.json from source POPPY
    const sourceProjectsFile = path.join(poppyPath, 'admin', 'data', 'projects.json');
    const sourceProjects = JSON.parse(await fs.readFile(sourceProjectsFile, 'utf8'));
    
    const project = sourceProjects.projects.find(p => p.id === projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found in source workspace`);
    }
    
    const sourceProjectPath = path.join(poppyPath, project.name);
    const targetProjectPath = path.join(targetDir, project.name);
    
    // Copy project
    await this.copyDirectory(sourceProjectPath, targetProjectPath);
    
    // Import agents if any
    if (project.agents && project.agents.length > 0) {
      for (const agentId of project.agents) {
        const sourceAgentFile = path.join(poppyPath, 'agents', `${agentId}.json`);
        const targetAgentFile = path.join(targetDir, '..', 'agents', `${agentId}.json`);
        
        try {
          await fs.copyFile(sourceAgentFile, targetAgentFile);
        } catch {
          // Agent might not exist, skip
        }
      }
    }
    
    await this.logImport({
      source: 'poppy',
      from: poppyPath,
      projectName: project.name,
      projectPath: targetProjectPath,
      timestamp: new Date().toISOString()
    });
    
    return {
      success: true,
      projectName: project.name,
      projectPath: targetProjectPath,
      message: `Imported ${project.name} from POPPY workspace`
    };
  }

  /**
   * Detect project type from files
   */
  async detectProjectType(projectPath) {
    const files = await fs.readdir(projectPath);
    
    // Check for common project indicators
    if (files.includes('package.json')) {
      const pkg = JSON.parse(await fs.readFile(path.join(projectPath, 'package.json'), 'utf8'));
      
      if (pkg.dependencies?.react || pkg.devDependencies?.react) {
        if (files.includes('src') || files.includes('public')) {
          return 'react-web';
        }
        return 'react-native';
      }
      
      if (pkg.dependencies?.express || pkg.dependencies?.fastify) {
        return 'node-api';
      }
      
      return 'node';
    }
    
    if (files.includes('requirements.txt') || files.includes('setup.py')) {
      return 'python';
    }
    
    if (files.includes('Cargo.toml')) {
      return 'rust';
    }
    
    if (files.includes('go.mod')) {
      return 'go';
    }
    
    if (files.includes('pom.xml') || files.includes('build.gradle')) {
      return 'java';
    }
    
    return 'generic';
  }

  /**
   * List recent imports
   */
  async getImportHistory() {
    try {
      const content = await fs.readFile(IMPORT_LOG, 'utf8');
      return JSON.parse(content);
    } catch {
      return [];
    }
  }

  /**
   * Validate a project before import
   */
  async validateProject(sourcePath) {
    const issues = [];
    const warnings = [];
    
    try {
      const stats = await fs.stat(sourcePath);
      
      if (!stats.isDirectory()) {
        issues.push('Source is not a directory');
      }
      
      // Check size
      const size = await this.getDirectorySize(sourcePath);
      if (size > 1024 * 1024 * 1024) { // 1GB
        warnings.push('Project is larger than 1GB');
      }
      
      // Check for .git
      try {
        await fs.access(path.join(sourcePath, '.git'));
        warnings.push('Contains .git directory (will be preserved)');
      } catch {
        // No .git, that's fine
      }
      
      return { valid: issues.length === 0, issues, warnings };
    } catch (error) {
      return { valid: false, issues: [error.message], warnings: [] };
    }
  }

  // Private helpers
  extractRepoName(url) {
    // Handle various Git URL formats
    const match = url.match(/\/([^\/]+?)(?:\.git)?$/);
    return match ? match[1] : 'imported-project';
  }

  findZipExtractor() {
    try {
      execSync('7z --help', { stdio: 'pipe' });
      return '7z';
    } catch {
      try {
        execSync('unzip -h', { stdio: 'pipe' });
        return 'unzip';
      } catch {
        return null;
      }
    }
  }

  async copyDirectory(source, target) {
    await fs.mkdir(target, { recursive: true });
    const entries = await fs.readdir(source, { withFileTypes: true });
    
    for (const entry of entries) {
      const sourcePath = path.join(source, entry.name);
      const targetPath = path.join(target, entry.name);
      
      if (entry.isDirectory()) {
        await this.copyDirectory(sourcePath, targetPath);
      } else {
        await fs.copyFile(sourcePath, targetPath);
      }
    }
  }

  async getDirectorySize(dirPath) {
    let size = 0;
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        size += await this.getDirectorySize(fullPath);
      } else {
        const stats = await fs.stat(fullPath);
        size += stats.size;
      }
    }
    
    return size;
  }

  async logImport(record) {
    const history = await this.getImportHistory();
    history.push(record);
    
    // Keep only last 100 imports
    if (history.length > 100) {
      history.shift();
    }
    
    await fs.writeFile(IMPORT_LOG, JSON.stringify(history, null, 2));
  }
}

export default ProjectImporter;
