# POPPY Architecture

## The Vision: Universal AI Engine Overlay

**POPPY is not just a project manager - it's a terminal-based management layer that sits ON TOP of any AI coding engine.**

Think of it like this:
- **Codex** = AI engine (like VS Code)
- **Claude Code** = AI engine (like terminal)
- **Cursor** = AI engine (like IDE)
- **POPPY** = Universal overlay that manages ALL of them

```
┌─────────────────────────────────────────┐
│           POPPY (Manager Layer)         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ Agents  │ │ Projects│ │  APIs   │   │
│  │Marketplace│ │  Daily  │ │ Models  │   │
│  └────┬────┘ └────┬────┘ └────┬────┘   │
│       └─────────────┴─────────────┘      │
│              Engine Manager               │
└─────────────────┬─────────────────────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
┌───▼────┐   ┌───▼────┐   ┌───▼────┐
│ Codex  │   │ Claude │   │ Cursor │
│(OpenAI)│   │(Anthro)│   │(Editor)│
└────────┘   └────────┘   └────────┘
    │             │             │
    └─────────────┴─────────────┘
              Your Projects
```

## How It Works

### 1. Engine Detection
POPPY automatically detects which AI engines you have installed:
```javascript
await engineManager.detectEngines();
// Returns: ['codex', 'claude-code'] based on what's installed
```

### 2. Context Injection
When you launch an engine through POPPY, it **injects context** into that engine:

**For Codex:**
- Creates `.codex` config file
- Injects agent system prompt
- Sets model preferences

**For Claude Code:**
- Creates/updates `CLAUDE.md`
- Injects agent instructions
- Sets project context

**For Cursor:**
- Creates `.cursorrules` file
- Creates `.cursor/poppy-context.json`
- Injects behavior patterns

### 3. The Flow

```
User opens terminal
    ↓
User types: poppy
    ↓
POPPY shows menu:
  - Launch with Agent → Browse agents → Select engine → Launch
  - Quick Launch → Select engine → Launch with default
  - Browse Marketplace → Install agent → Use later
    ↓
User selects "Launch with Agent"
    ↓
POPPY shows available agents (from marketplace + local)
    ↓
User selects "React Expert" agent
    ↓
POPPY detects engines: [Codex, Claude, Cursor]
    ↓
User selects Claude Code
    ↓
POPPY:
  1. Writes CLAUDE.md with React Expert context
  2. Launches: claude [project-path]
  3. Claude Code reads CLAUDE.md
  4. User now has React Expert agent active in Claude!
```

## File Structure

```
~/.poppy/                          # POPPY config directory
├── config.json                     # User preferences
├── api-keys.enc                    # Encrypted API keys
├── installed-agents/               # Downloaded marketplace agents
│   ├── react-expert.json
│   └── security-auditor.json
└── my-agents/                      # User's custom agents
    └── my-custom-agent.json

~/Projects/                         # Your projects
├── my-app/
│   ├── CLAUDE.md                   # Injected by POPPY (Claude)
│   ├── .codex                      # Injected by POPPY (Codex)
│   ├── .cursorrules                # Injected by POPPY (Cursor)
│   └── .cursor/poppy-context.json  # POPPY metadata
└── another-project/

AI Engine Configs (native):
~/.codex/config.json               # Codex native config
~/.claude/config.json              # Claude Code native config
```

## The Adapter Pattern

Each AI engine has an adapter that knows how to:
1. **Detect** if it's installed
2. **Launch** the engine
3. **Inject** POPPY context

### Base Adapter Interface
```javascript
class EngineAdapter {
  async detect()        // Is this engine installed?
  async launch()        // Start the engine
  async injectContext() // Add POPPY context
  async sendCommand()   // Send commands
  async stop()          // Kill process
}
```

### Codex Adapter
```javascript
class CodexAdapter extends EngineAdapter {
  async injectContext(context) {
    // Create .codex file with agent config
    // Include systemPrompt, instructions, model
  }
}
```

### Claude Adapter
```javascript
class ClaudeAdapter extends EngineAdapter {
  async injectContext(context) {
    // Create CLAUDE.md with:
    // - Agent name & description
    // - System instructions
    // - Project context
    // - POPPY metadata
  }
}
```

### Cursor Adapter
```javascript
class CursorAdapter extends EngineAdapter {
  async injectContext(context) {
    // Create .cursorrules with rules
    // Create .cursor/poppy-context.json
  }
}
```

## API Key Security

Keys are **never shared** with engines directly. Instead:

1. User adds key to POPPY: `poppy api add openai`
2. POPPY encrypts and stores: `~/.poppy/api-keys.enc`
3. When launching engine, POPPY:
   - Sets env vars: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`
   - OR engine reads from its native config
4. Engine uses key natively
5. Agent definitions never contain keys

## Agent Marketplace Architecture

### Public Registry (GitHub)
```
poppy-registry/                    # github.com/Maximt23/poppy-registry
├── agents/
│   ├── react-expert.json          # Community agent
│   ├── node-expert.json
│   └── security-auditor.json
├── categories.json
└── index.json                     # Agent index with metadata
```

### Agent Definition (Safe to Share)
```json
{
  "id": "react-expert",
  "name": "React Expert",
  "description": "Specialized in React patterns",
  "systemPrompt": "You are a React expert...",
  "instructions": ["Use hooks", "Prefer functional components"],
  "requiresApiKey": true,
  "recommendedProvider": "anthropic",
  "recommendedModel": "claude-3-5-sonnet",
  // NO API KEYS HERE!
}
```

## In-Terminal Experience

### Launching POPPY
```bash
$ poppy

  ██████╗  ██████╗ ██████╗ ██████╗ ██╗   ██╗
  ██╔══██╗██╔═══██╗██╔══██╗██╔══██╗██║   ██║
  ██████╔╝██║   ██║██████╔╝██████╔╝╚██████╔╝
  ██╔═══╝ ██║   ██║██╔═══╝ ██╔═══╝  ╚═══██║
  ██║     ╚██████╔╝██║     ██║         ██║
  ╚═╝      ╚══════╝╚═╝     ╚═╝         ╚═╝

? Select an option: 
  ❯ Launch with Agent
    Quick Launch Engine
    Engine Status
  ─── Project Management ───
    Start New Project
    Manage Projects
    Launch Project
  ─── Agent Marketplace ───
    Browse Agents
    My Installed Agents
    Create Agent
    Publish Agent
```

### Launching with Agent
```bash
? Select agent: React Expert (⭐ 4.8, 15K downloads)
? Select engine: Claude Code

[POPPY] Activating agent: React Expert
[POPPY] Description: Specialized in React patterns
[POPPY] Engine: Anthropic Claude Code

[POPPY] Launching Claude Code in: /Users/me/Projects/my-app
# Claude Code opens with React Expert context loaded!

╭─ Claude Code ──────────────────────────────────────────╮
│ Now chatting with Claude                                │
│                                                         │
│ > help me refactor this component to use hooks          │
│                                                         │
│ I'll help you refactor this to use React hooks...       │
│ (Using React Expert agent context)                      │
╰────────────────────────────────────────────────────────╯
```

## Multi-Engine Workflow

```bash
# Morning: Use Claude for architecture
$ poppy
> Launch with Agent
> Agent: System Architect
> Engine: Claude Code
# (Claude opens with architect context)

# Afternoon: Use Codex for implementation
$ poppy
> Launch with Agent
> Agent: Implementation Helper
> Engine: Codex
# (Codex opens with implementation context)

# Evening: Use Cursor for UI polish
$ poppy
> Launch with Agent
> Agent: UI/UX Reviewer
> Engine: Cursor
# (Cursor opens with design context)
```

## Why This Architecture?

1. **Non-intrusive** - Doesn't replace your AI tools, enhances them
2. **Universal** - Works with any AI engine that exists or will exist
3. **Secure** - API keys stay local, agents are shareable
4. **Flexible** - Switch engines mid-project without losing context
5. **Community** - Share expertise without sharing credentials

## The Big Picture

**POPPY is the missing layer** between:
- **AI Engines** (Codex, Claude, Cursor) = The workers
- **Your Projects** = The work
- **Your Knowledge** (agents) = The expertise

POPPY connects them all in a unified, terminal-based interface.

---

**Result**: You have ONE tool (POPPY) that manages:
- Which AI engine to use
- What agent context to apply
- Which model/API to use
- Your projects and progress
- Your API keys (securely)
- The community marketplace

All from your terminal. 🚀
