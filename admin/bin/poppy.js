#!/usr/bin/env node

/**
 * POPPY - Universal AI Project Manager
 * 
 * Works with any AI coding engine:
 * - Code-Puppy
 * - Code-Ex  
 * - Claude Code
 * - Cursor
 * - GitHub Copilot
 * - And more...
 * 
 * Usage: poppy [command]
 */

import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import main admin
await import(path.join(__dirname, '..', 'admin.js'));
