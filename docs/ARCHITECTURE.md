# POPPY Architecture

## The Vision: Universal AI Workspace Manager

**POPPY is a terminal-based management layer that unifies AI coding engines, projects, agents, skills, and workflows in one place.**

Think of it like this:
- **Codex** = AI engine (from OpenAI)
- **Claude Code** = AI engine (from Anthropic)
- **Cursor** = AI engine (from Cursor)
- **POPPY** = Universal overlay that manages ALL of them + your projects + agents + skills

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                               │
│  Terminal Menu System (Inquirer.js)                                  │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  Main Menu: ▶ Launch | ➕ New | 📁 Projects | 🤖 Agents | etc.  │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      POPPY CORE SYSTEM                               │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐    │
│  │    MENU      │  │   ENTITY     │  │      DATA LAYER          │    │
│  │   SYSTEM     │  │  MANAGERS    │  │   (File System Based)    │    │
│  │              │  │              │  │                          │    │
│  │ • mainMenu() │  │ • Projects   │  │  ~/.poppy/               │    │
│  │ • showXMenu()│  │ • Agents     │  │  ├── config.json         │    │
│  │ • listX()    │  │ • Skills     │  │  ├── api-keys.enc        │    │
│  │ • createX()  │  │ • Prompts    │  │  ├── projects.json      │    │
│  │ • deleteX()  │  │ • Analytics  │  │  └── agents/            │    │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘    │
│                          │                                          │
│  ┌───────────────────────┴──────────────────────────────────────┐  │
│  │                   ENGINE MANAGER                                │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  Detects & Launches: Codex, Claude, Cursor, etc.       │  │  │
│  │  │  • detectEngines()                                      │  │  │
│  │  │  • launchEngine()                                       │  │  │
│  │  │  • injectContext()                                      │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
              ┌──────────┐   ┌──────────┐   ┌──────────┐
              │  Codex   │   │  Claude  │   │  Cursor  │
              │ (OpenAI) │   │(Anthropic)│   │ (Editor) │
              └────┬─────┘   └────┬─────┘   └────┬─────┘
                   │               │               │
                   └───────────────┴───────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │        YOUR PROJECTS         │
                    │    P1/  P2/  P3/  admin/     │
                    └─────────────────────────────┘
```

---

## System Architecture

### 1. Menu System (UI Layer)

**Main Menu** (`mainMenu()`)
```
┌─────────────────────────────────────────┐
│      🐶 POPPY Main Menu                 │
├─────────────────────────────────────────┤
│  ▶ Launch AI Engine                     │
│  ➕ New Project                          │
│  📁 Projects                             │
│  🤖 Agents                               │
│  🎯 Skills                               │
│  💬 Prompts                              │
│  🔐 API Keys                             │
│  🔀 Git                                  │
│  ⚙️  System                               │
│  ✕ Exit                                  │
└─────────────────────────────────────────┘
```

**Sub-Menu Pattern** (All entity menus follow this structure):
```
┌─────────────────────────────────────────┐
│      📁 Projects Menu                   │
├─────────────────────────────────────────┤
│  ➕ Create New Project                   │
│  📁 My Projects                          │ ← Real data-backed list
│  📥 Import Project                       │
│  📤 Upload to Marketplace                │
│  🗑️  Delete Project                      │
│  📊 Status                               │
│  🔄 Sync from AI Engines                 │
│  ← Back                                  │
└─────────────────────────────────────────┘
```

### 2. Entity System (Data Layer)

Each entity (Projects, Agents, Skills, Prompts) follows the same pattern:

```
Entity Lifecycle:

┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  LIST   │───→│  LOAD   │───→│ DISPLAY │───→│ ACTION  │
│  (Menu) │    │ (File)  │    │ (Terminal)│   │(Handler)│
└─────────┘    └─────────┘    └─────────┘    └─────────┘
     │                                            │
     │         ┌─────────┐    ┌─────────┐         │
     │         │  CREATE │    │  DELETE │         │
     └────────→│  UPDATE │    │  EXPORT │←────────┘
               │  SAVE   │    │  IMPORT │
               └─────────┘    └─────────┘
```

**Core Functions per Entity:**
```javascript
// Projects
loadProjects()      → Read from ~/.poppy/projects.json
listProjects()      → Display all projects in terminal
createNewProject()  → Wizard + mkdir + git init
manageProjects()    → View + status + actions

// Agents
loadAgents()        → Read from ~/.poppy/agents/
listAgents()        → Display all agents
addAgent()          → Wizard + save JSON
shareAgent()        → Export to marketplace

// Skills
loadSkills()        → Read from ~/.poppy/skills/
listSkills()        → Display all skills
createSkill()       → Wizard + save
attachSkill()       → Link to agent
```

### 3. Data Storage Architecture

```
File System Structure:

~/.poppy/                          # User config directory
├── config.json                     # User settings, preferences
├── api-keys.enc                   # Encrypted API keys
├── projects.json                  # Project registry
├── agents/                        # Downloaded agents
│   ├── agent-foreman.json
│   └── agent-qa.json
├── skills/                        # Installed skills
│   └── react-patterns.json
└── prompts/                       # Saved prompts
    └── my-template.json

~/POPPY/                           # Workspace directory
├── P1/                           # Project folders
│   ├── .git/
│   ├── src/
│   └── CLAUDE.md                 # Auto-generated context
├── P2/
├── P3-Admin/                     # POPPY admin project
├── admin/                        # POPPY system files
│   ├── admin.js                 # Main system
│   └── lib/                     # Libraries
└── agents/                       # Shared agents
    └── lead-connector.json
```

### 4. Engine Integration System

```
Engine Launch Flow:

User selects "▶ Launch AI Engine"
              ↓
      showLaunchMenu()
              ↓
    ┌─────────────────────┐
    │ Detect Engines      │───→ engineManager.detectEngines()
    │ • Codex?            │      Check for installed engines
    │ • Claude?           │
    │ • Cursor?           │
    └─────────────────────┘
              ↓
    ┌─────────────────────┐
    │ User Selection      │
    │ → Project?          │
    │ → Agent?            │
    │ → Engine?           │
    └─────────────────────┘
              ↓
    ┌─────────────────────┐
    │ Inject Context      │───→ injectContext(engine, project, agent)
    │                     │
    │ • Write CLAUDE.md   │
    │ • Write .cursorrules│
    │ • Write .codex      │
    └─────────────────────┘
              ↓
    ┌─────────────────────┐
    │ Launch Engine       │───→ launchEngine(engine, projectPath)
    │                     │
    │ $ claude .          │
    │ $ cursor .          │
    │ $ codex agent-mode  │
    └─────────────────────┘
              ↓
    Engine starts with POPPY context!
```

**Context Injection Examples:**

For **Claude Code**:
```markdown
# CLAUDE.md (auto-generated by POPPY)
## Project: WearWise

You are working on a React Native mobile app for wardrobe management.

## Current Agent: Frontend Expert
Focus on UI/UX improvements and React best practices.

## Skills Attached:
- react-patterns
- ui-styling

## Today's Focus:
- Implement outfit suggestion algorithm
- Fix camera integration bugs
```

For **Cursor**:
```javascript
// .cursorrules (auto-generated by POPPY)
{
  "project": "WearWise",
  "agent": "Frontend Expert",
  "skills": ["react-patterns", "ui-styling"],
  "dailyFocus": "Implement outfit suggestion algorithm",
  "codingStyle": "React Native with TypeScript",
  "testRequirements": true
}
```

---

## Data Flow Architecture

### Reading Data (List Views)

```
User selects "📁 My Projects"
              ↓
    ┌─────────────────────┐
    │ showProjectsMenu()  │
    │ case 'list':        │
    └─────────────────────┘
              ↓
    ┌─────────────────────┐
    │ manageProjects()    │
    │                     │
    │ 1. loadProjects()   │───→ Read ~/.poppy/projects.json
    │ 2. For each project │
    │    → Read metadata  │
    │    → Check git status│
    │    → Check active   │
    │ 3. Display in boxen │───→ Terminal UI
    └─────────────────────┘
              ↓
    User sees real project list!
    📁 WearWise (Active)
       Path: P1/
       Type: React Native
       Git: ✓ Clean
    📁 Admin Console
       Path: admin/
       Type: CLI Tool
```

### Writing Data (Create/Update)

```
User selects "➕ Create New Project"
              ↓
    ┌─────────────────────┐
    │ createNewProject()  │
    │                     │
    │ 1. Prompt wizard    │
    │    → Name?          │
    │    → Type?          │
    │    → Template?      │
    │                     │
    │ 2. Create directory │───→ mkdir P3/
    │                     │
    │ 3. Copy template    │───→ Copy React template
    │                     │
    │ 4. Git init         │───→ git init
    │                     │
    │ 5. Update registry  │───→ Save to projects.json
    │                     │
    │ 6. Create context   │───→ Write CLAUDE.md
    └─────────────────────┘
              ↓
    Project created + Registered in POPPY!
```

---

## Security Architecture

### API Key Management

```
User adds API key
      ↓
┌──────────────────────────┐
│ apiKeyManager.add()      │
│                          │
│ 1. Encrypt with AES-256  │───→ Secure encryption
│ 2. Store in api-keys.enc │───→ Never plaintext
│ 3. Mask in UI            │───→ sk-...xyz
└──────────────────────────┘
      ↓
Key is secure!

Later: Launch engine
      ↓
┌──────────────────────────┐
│ launchEngine()           │
│                          │
│ 1. Decrypt key           │───→ Decrypt in memory only
│ 2. Pass to engine        │───→ env var / config
│ 3. Clear from memory     │───→ No persistence
└──────────────────────────┘
```

---

## Module Structure

```
admin/
├── admin.js                    # Main entry point
│   ├── mainMenu()             # Main menu dispatcher
│   ├── showProjectsMenu()     # Projects menu
│   ├── showAgentsMenu()       # Agents menu
│   ├── showSkillsMenu()       # Skills menu
│   ├── showPromptsMenu()      # Prompts menu
│   ├── showLaunchMenu()       # Engine launcher
│   ├── showSystemMenu()       # System settings
│   └── list/create/manage     # Entity handlers
│
└── lib/
    ├── config.js              # Configuration management
    │   ├── loadConfig()
    │   └── saveConfig()
    │
    ├── engine-manager.js      # AI engine integration
    │   ├── detectEngines()
    │   ├── launchEngine()
    │   └── injectContext()
    │
    ├── api-manager.js         # Secure API key storage
    │   ├── addKey()
    │   ├── getKey()
    │   └── encrypt/decrypt
    │
    ├── marketplace.js          # Agent marketplace
    │   ├── browseAgents()
    │   └── downloadAgent()
    │
    └── engine-adapters/        # Per-engine adapters
        ├── base.js            # Base adapter
        ├── claude.js          # Claude Code adapter
        ├── codex.js           # Codex adapter
        └── cursor.js          # Cursor adapter
```

---

## Key Design Principles

1. **File System as Database**
   - All data stored in JSON files
   - No database server needed
   - Human-readable, git-friendly

2. **Menu-Driven Interface**
   - Consistent menu patterns
   - Real data-backed lists
   - No placeholders or stubs

3. **Engine Agnostic**
   - Works with any AI engine
   - Pluggable adapter system
   - Context injection per engine

4. **Security First**
   - Encrypted API keys
   - No secrets in logs
   - Local-only data storage

5. **Extensible**
   - Easy to add new entities
   - Plugin system for engines
   - Template-based projects

---

## Creator Version (POPPY-MAXIM)

The private creator version adds:

```
┌─────────────────────────────────────────┐
│  ⚙️  System Menu (Creator Version)       │
├─────────────────────────────────────────┤
│  📊 Analytics (Personal)                │
│  👑 Creator Dashboard ← EXTRA!          │
│  ⚙️  Settings                            │
│  📅 Daily Focus                          │
│  📋 View Log                             │
│  🤖 Agent Settings                       │
└─────────────────────────────────────────┘
```

**Creator Dashboard Features:**
- Global POPPY usage statistics
- Model popularity tracking
- Feature usage analytics
- Geographic distribution
- Real user metrics (privacy-respecting)

---

## Version History

- **v1.0** - Initial release
- **v1.1** - Fixed list views for Projects, Agents, Skills, Prompts
- **v1.2** - Added Creator Dashboard (private version)

---

## Contributing

See [WORKFLOW.md](../WORKFLOW.md) for development guidelines.

---

**POPPY Architecture** - Designed for simplicity, security, and extensibility.
