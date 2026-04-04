# System Integration Architecture - Enterprise Grade

## Core Principles (The Toyota Way)

### 1. Reliability First
- Code must work 99.9% of the time
- Handle all failure modes gracefully
- No clever hacks - simple and predictable
- Like a Toyota: starts every time, no surprises

### 2. The Paranoid Reviewer Checklist
After writing ANY code, ask:
- [ ] What happens if the command doesn't exist?
- [ ] What happens if the path has spaces?
- [ ] What happens if permissions are denied?
- [ ] What happens on timeout?
- [ ] Are child processes cleaned up?
- [ ] Can this hang indefinitely?
- [ ] Is there a memory leak?
- [ ] Does it work on Windows AND Unix?
- [ ] Can I debug this at 3 AM?

### 3. Memory System - Track Attempts
Keep a log of:
- What you tried
- What failed and why
- What eventually worked
- Never repeat the same failure twice

## Code Puppy Launch - The Correct Way

### The Problem
Global npm commands on Windows need special handling:
- Must use `shell: true` on Windows
- May need `.cmd` extension
- Must handle spawn errors separately from exit codes
- Must not hang waiting for stdio

### The Solution (Marcus-Approved)

```javascript
async function launchCodePuppy() {
  showHeader();
  log.title('🐶 Launching Code Puppy');
  
  const command = 'code-puppy';
  const args = [];
  const options = {
    shell: true,        // Required for Windows .cmd files
    detached: true,     // Allow parent to exit
    stdio: 'ignore'     // Don't wait for stdio (prevents hang)
  };
  
  try {
    log.info(`Spawning: ${command}`);
    
    const { spawn } = await import('child_process');
    const child = spawn(command, args, options);
    
    // Handle spawn errors (executable not found, permissions, etc.)
    child.on('error', (error) => {
      log.error(`Spawn failed: ${error.message}`);
      if (error.code === 'ENOENT') {
        log.info('Is code-puppy installed? Run: npm install -g code-puppy');
      }
    });
    
    // Unref so parent can exit independently
    child.unref();
    
    log.success('✓ Code Puppy launched!');
    log.info('Check your taskbar for the new window');
    
    // Don't wait for the child process
    // Don't call await pause() here - return immediately
    
  } catch (error) {
    log.error(`Failed to launch: ${error.message}`);
    await pause();
  }
}
```

### Key Insights from Memory

**What Failed Before:**
1. `stdio: 'inherit'` - caused the function to wait for child to exit
2. No `unref()` - parent process couldn't exit until child did
3. Missing error handling for spawn failures

**What Works:**
1. `stdio: 'ignore'` - don't wait for input/output
2. `detached: true` + `unref()` - truly independent processes
3. Event-based error handling - catches ENOENT immediately
4. No `await` on the spawn - fire and forget

### Enterprise-Grade Additions

```javascript
class CommandExecutor {
  constructor(config) {
    this.timeout = config.timeout || 30000;
    this.retries = config.retries || 3;
    this.attemptRegistry = [];
  }
  
  async execute(command, args, options) {
    const attemptId = Date.now();
    
    // Check memory: have we tried this before?
    const previousAttempt = this.findPreviousAttempt(command, args);
    if (previousAttempt && previousAttempt.failed) {
      log.warning(`This command failed before: ${previousAttempt.error}`);
      log.info(`Trying alternative: ${previousAttempt.alternative}`);
    }
    
    try {
      const result = await this.spawnWithTimeout(command, args, options);
      this.logSuccess(attemptId, command);
      return result;
    } catch (error) {
      this.logFailure(attemptId, command, error);
      
      // Self-correction: try alternative approaches
      if (error.code === 'ENOENT' && process.platform === 'win32') {
        // Try with .cmd extension
        return this.execute(`${command}.cmd`, args, options);
      }
      
      throw error;
    }
  }
  
  findPreviousAttempt(command, args) {
    return this.attemptRegistry.find(a => 
      a.command === command && 
      JSON.stringify(a.args) === JSON.stringify(args)
    );
  }
  
  logSuccess(id, command) {
    this.attemptRegistry.push({
      id,
      command,
      success: true,
      timestamp: new Date()
    });
  }
  
  logFailure(id, command, error) {
    this.attemptRegistry.push({
      id,
      command,
      failed: true,
      error: error.message,
      code: error.code,
      timestamp: new Date(),
      alternative: this.suggestAlternative(error)
    });
  }
  
  suggestAlternative(error) {
    const alternatives = {
      'ENOENT': 'Check if command is installed and in PATH',
      'EACCES': 'Check file permissions',
      'ETIMEDOUT': 'Increase timeout or check network'
    };
    return alternatives[error.code] || 'Unknown error - investigate manually';
  }
}
```

## Windows-Specific Patterns

### Global NPM Commands
```javascript
// Windows needs shell:true for global npm commands
const isWindows = process.platform === 'win32';

async function runGlobalCommand(command) {
  const options = {
    shell: isWindows,  // true on Windows, false elsewhere
    detached: true,
    stdio: 'ignore'
  };
  
  const child = spawn(command, [], options);
  child.unref();
}
```

### Error Taxonomy
- `ENOENT`: Command not found (not in PATH)
- `EACCES`: Permission denied
- `ETIMEDOUT`: Operation timed out
- `ECONNREFUSED`: Connection refused (for network commands)
- `spawn_error`: Process couldn't start (Windows-specific)

## Testing Your Integration

### Stress Tests
```javascript
// Test 1: Run 100 times - any leaks?
for (let i = 0; i < 100; i++) {
  await launchCodePuppy();
}
// Check with Process Explorer - should be 0 zombie processes

// Test 2: Kill mid-execution
const child = spawn('code-puppy', [], { shell: true });
setTimeout(() => child.kill(), 100);
// Should not crash the parent

// Test 3: Invalid command
await launchCodePuppy('nonexistent-command');
// Should gracefully log error, not crash

// Test 4: Timeout
await launchCodePuppyWithTimeout('slow-command', 1000);
// Should timeout properly, not hang forever
```

## Summary

**Marcus's Rules:**
1. Simple is better than clever
2. Handle ALL error cases
3. Use memory to avoid redundancy
4. Self-review before shipping
5. Stress-test your own code
6. Document failure modes
7. Make it observable

**The Guarantee:**
"If Marcus built it, it works. If it breaks, he knows why before the alert fires."
