# System Integration Architecture - Enterprise Grade

## Core Principles

### 1. The Toyota Philosophy
- **Reliability over cleverness**: Code must work 99.9% of the time
- **Simplicity over complexity**: Simple solutions are maintainable
- **Explicit over implicit**: No magic, no surprises
- **Observability**: Every connection must be monitorable

### 2. Connection Design Pattern

```typescript
interface ConnectionConfig {
  // Identity
  name: string;
  version: string;
  
  // Endpoint
  host: string;
  port: number;
  protocol: 'http' | 'https' | 'tcp' | 'websocket';
  
  // Reliability
  retryPolicy: {
    maxAttempts: number;
    backoffMultiplier: number;
    initialDelayMs: number;
    maxDelayMs: number;
  };
  
  // Timeouts
  timeouts: {
    connection: number;
    request: number;
    idle: number;
  };
  
  // Health
  healthCheck: {
    endpoint: string;
    intervalMs: number;
    timeoutMs: number;
  };
  
  // Circuit Breaker
  circuitBreaker: {
    failureThreshold: number;
    recoveryTimeoutMs: number;
    halfOpenMaxCalls: number;
  };
}
```

### 3. UI-to-Command Bridge Architecture

```typescript
// The Bridge - Simple, Reliable, Observable
class UICommandBridge {
  private logger: StructuredLogger;
  private metrics: MetricsCollector;
  private healthMonitor: HealthMonitor;
  
  constructor(config: BridgeConfig) {
    this.logger = new StructuredLogger(config.name);
    this.metrics = new MetricsCollector();
    this.healthMonitor = new HealthMonitor(config.healthCheck);
  }
  
  async execute(command: Command): Promise<Result> {
    const correlationId = generateCorrelationId();
    const startTime = Date.now();
    
    this.logger.info('Command execution started', {
      correlationId,
      command: command.name,
      params: sanitizeParams(command.params)
    });
    
    try {
      // Pre-execution validation
      await this.validateCommand(command);
      
      // Execute with timeout
      const result = await this.executeWithTimeout(command);
      
      // Post-execution verification
      await this.verifyResult(result);
      
      // Success metrics
      this.metrics.recordSuccess(command.name, Date.now() - startTime);
      
      this.logger.info('Command execution completed', {
        correlationId,
        duration: Date.now() - startTime,
        status: 'success'
      });
      
      return { success: true, data: result, correlationId };
      
    } catch (error) {
      // Failure handling
      this.metrics.recordFailure(command.name, error);
      
      this.logger.error('Command execution failed', {
        correlationId,
        error: error.message,
        stack: error.stack,
        duration: Date.now() - startTime
      });
      
      // Graceful degradation
      return this.handleFailure(error, command, correlationId);
    }
  }
  
  private async executeWithTimeout(command: Command): Promise<any> {
    return Promise.race([
      this.runCommand(command),
      new Promise((_, reject) => 
        setTimeout(() => reject(new TimeoutError()), command.timeout)
      )
    ]);
  }
  
  private async runCommand(command: Command): Promise<any> {
    const { spawn } = await import('child_process');
    
    return new Promise((resolve, reject) => {
      const child = spawn(command.executable, command.args, {
        cwd: command.workingDir,
        env: { ...process.env, ...command.env },
        stdio: ['ignore', 'pipe', 'pipe']
      });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout?.on('data', (data) => { stdout += data; });
      child.stderr?.on('data', (data) => { stderr += data; });
      
      child.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr, exitCode: code });
        } else {
          reject(new CommandError(`Exit code ${code}: ${stderr}`));
        }
      });
      
      child.on('error', (error) => {
        reject(new CommandError(`Spawn failed: ${error.message}`));
      });
    });
  }
}
```

### 4. Error Handling Strategy

```typescript
// Never swallow errors, always categorize
enum ErrorCategory {
  TRANSIENT = 'TRANSIENT',     // Retry may help
  PERMANENT = 'PERMANENT',     // Bug or misconfiguration
  NETWORK = 'NETWORK',         // Connection issues
  TIMEOUT = 'TIMEOUT',         // Slow response
  VALIDATION = 'VALIDATION',   // Bad input
  UNKNOWN = 'UNKNOWN'          // Investigate
}

class ErrorHandler {
  categorize(error: Error): ErrorCategory {
    if (error instanceof TimeoutError) return ErrorCategory.TIMEOUT;
    if (error.code === 'ECONNREFUSED') return ErrorCategory.NETWORK;
    if (error.code === 'ENOTFOUND') return ErrorCategory.NETWORK;
    if (error instanceof ValidationError) return ErrorCategory.VALIDATION;
    return ErrorCategory.UNKNOWN;
  }
  
  shouldRetry(category: ErrorCategory): boolean {
    return category === ErrorCategory.TRANSIENT ||
           category === ErrorCategory.NETWORK ||
           category === ErrorCategory.TIMEOUT;
  }
}
```

### 5. Retry Strategy with Exponential Backoff

```typescript
async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig
): Promise<T> {
  let lastError: Error;
  let delay = config.initialDelayMs;
  
  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === config.maxAttempts) break;
      
      // Log retry attempt
      console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      
      // Wait with jitter
      await sleep(delay + Math.random() * 100);
      
      // Exponential backoff with cap
      delay = Math.min(delay * config.backoffMultiplier, config.maxDelayMs);
    }
  }
  
  throw new RetryExhaustedError(`Failed after ${config.maxAttempts} attempts`, lastError);
}
```

### 6. Health Monitoring

```typescript
class HealthMonitor {
  private checks: Map<string, HealthCheck> = new Map();
  private status: Map<string, HealthStatus> = new Map();
  
  register(name: string, check: HealthCheck): void {
    this.checks.set(name, check);
    this.status.set(name, HealthStatus.UNKNOWN);
    
    // Start periodic checks
    setInterval(async () => {
      const result = await this.runCheck(name, check);
      this.status.set(name, result.status);
      
      if (result.status === HealthStatus.UNHEALTHY) {
        this.alert(`Health check failed: ${name}`, result);
      }
    }, check.intervalMs);
  }
  
  async runCheck(name: string, check: HealthCheck): Promise<HealthResult> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(check.endpoint, {
        method: 'GET',
        timeout: check.timeoutMs
      });
      
      const latency = Date.now() - startTime;
      
      if (response.ok && latency < check.maxLatencyMs) {
        return {
          status: HealthStatus.HEALTHY,
          latency,
          timestamp: new Date()
        };
      }
      
      return {
        status: HealthStatus.DEGRADED,
        latency,
        error: `HTTP ${response.status}`,
        timestamp: new Date()
      };
      
    } catch (error) {
      return {
        status: HealthStatus.UNHEALTHY,
        error: error.message,
        timestamp: new Date()
      };
    }
  }
  
  getStatus(): HealthReport {
    return {
      overall: this.calculateOverallStatus(),
      checks: Object.fromEntries(this.status),
      timestamp: new Date()
    };
  }
}
```

### 7. Circuit Breaker Pattern

```typescript
class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures = 0;
  private lastFailureTime: number = 0;
  private halfOpenCalls = 0;
  
  constructor(private config: CircuitBreakerConfig) {}
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailureTime > this.config.recoveryTimeoutMs) {
        this.state = CircuitState.HALF_OPEN;
        this.halfOpenCalls = 0;
      } else {
        throw new CircuitOpenError('Circuit breaker is OPEN');
      }
    }
    
    if (this.state === CircuitState.HALF_OPEN) {
      if (this.halfOpenCalls >= this.config.halfOpenMaxCalls) {
        throw new CircuitOpenError('Circuit breaker is HALF_OPEN (max calls reached)');
      }
      this.halfOpenCalls++;
    }
    
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.CLOSED;
      this.failures = 0;
    }
  }
  
  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN;
    }
  }
}
```

### 8. Observability - The Three Pillars

```typescript
// 1. Structured Logging
interface LogEntry {
  timestamp: string;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  message: string;
  correlationId: string;
  service: string;
  context: Record<string, any>;
}

// 2. Metrics
interface Metrics {
  requestCount: Counter;
  requestDuration: Histogram;
  errorRate: Gauge;
  activeConnections: Gauge;
  circuitBreakerState: EnumGauge;
}

// 3. Distributed Tracing
interface Trace {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  operation: string;
  startTime: number;
  endTime?: number;
  tags: Record<string, string>;
  logs: LogEntry[];
}
```

## Best Practices

### Do's
✅ Use connection pooling for databases and HTTP clients
✅ Implement graceful shutdown with connection draining
✅ Use idempotency keys for retry safety
✅ Validate all inputs at system boundaries
✅ Implement backpressure mechanisms
✅ Use async/await with proper error handling
✅ Test failure scenarios (chaos engineering)
✅ Document the failure modes and recovery procedures

### Don'ts
❌ Don't use magic numbers or timeouts
❌ Don't ignore errors or catch-all exceptions
❌ Don't create connections in hot paths
❌ Don't use polling when push (webhooks) is possible
❌ Don't skip health checks in production
❌ Don't build without observability from day one

## POPPY UI-to-Command Integration

```typescript
// For POPPY Admin UI integration
interface UICommandBridge {
  // Simple, reliable command execution
  execute(command: string, args: string[], options: SpawnOptions): Promise<ExecutionResult>;
  
  // Observable execution
  executeWithStream(command: string, onOutput: (line: string) => void): Promise<void>;
  
  // Health check for command availability
  isCommandAvailable(command: string): Promise<boolean>;
  
  // Get command metadata
  getCommandInfo(command: string): Promise<CommandMetadata>;
}

// Implementation priorities:
// 1. Reliability - never hang, always return
// 2. Simplicity - spawn process, capture output, return
// 3. Observability - log everything with correlation IDs
// 4. Enterprise - proper error handling, timeouts, cleanup
```

## Summary

Build connections like you're building for a hospital or a bank:
- **Reliability**: 99.9% uptime
- **Observability**: See everything that happens
- **Maintainability**: Any junior dev can understand it
- **Security**: Defense in depth
- **Simplicity**: No cleverness, no magic

Remember: "The code you write today is the legacy someone inherits tomorrow. Make it a Toyota, not a Ferrari." - Marcus