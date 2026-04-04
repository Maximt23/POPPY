# 🐶 POPPY - Personal AI Workspace Organizer

**POPPY** is a terminal-based AI workspace manager that unifies your AI coding engines, projects, agents, and workflows in one place.

Think of it as a **universal command center** for AI-assisted development - like a smart terminal that knows about all your projects and can launch any AI engine with the right context.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** and **npm**
- **Windows**, **Mac**, or **Linux**
- At least one AI engine installed (optional): [Codex](https://github.com/openai/codex), [Claude Code](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview), or [Cursor](https://www.cursor.com/)

### Installation

**Windows (PowerShell):**
```powershell
git clone https://github.com/Maximt23/POPPY.git
cd POPPY\admin
.\install.cmd
```

**Mac/Linux:**
```bash
git clone https://github.com/Maximt23/POPPY.git
cd POPPY/admin
chmod +x install.sh
./install.sh
```

**That's it!** Now type `poppy` from anywhere:
```bash
poppy
```

---

## ✨ What Makes POPPY Special

### 🎯 Universal AI Engine Support
POPPY doesn't replace your AI engines - it **enhances** them:
- 🤖 **Any AI Engine** - Works with Codex, Claude Code, Cursor, or custom engines
- 🔄 **Context Injection** - Automatically injects project context when launching engines
- 📋 **Consistent Workflow** - Same project management regardless of which AI you use

### 📁 Project Management
- **Create** projects with templates (React, Node.js, Python, React Native)
- **Import** from GitHub, GitLab, local directories, or ZIP files
- **Switch** between projects instantly
- **Track** project status, git state, and AI engine associations

### 🤖 Agent System
- **Create** specialized agents for different tasks (frontend, backend, DevOps, etc.)
- **Attach** skills to agents for reusable knowledge
- **Share** agents between projects
- **Marketplace** to discover community agents (coming soon)

### 🎯 Skills Library
Skills are reusable "abilities" agents can learn:
- `react-patterns` - React best practices
- `api-design` - RESTful API principles  
- `testing-strategies` - Testing patterns
- Create and share your own skills

### 📊 Analytics & Daily Focus
- Set daily focus and priorities
- Track project activity
- View work logs

---

## 📂 Menu Structure

```
POPPY Main Menu
│
├── 📁 Projects
│   ├── ➕ Create New Project
│   ├── 📁 My Projects
│   ├── 📥 Import Project
│   └── 🔄 Sync from AI Engines
│
├── 🤖 Agents
│   ├── ➕ Create Agent
│   ├── 📁 My Agents
│   └── 🔄 Sync from AI Engines
│
├── 🎯 Skills
│   ├── ➕ Create Skill
│   ├── 📁 My Skills
│   ├── ➕ Attach to Agent
│   └── 🔄 Sync from AI Engines
│
├── 🔐 API Keys
│   └── Manage API Keys (OpenAI, Anthropic, etc.)
│
├── 🔀 Git
│   ├── 📊 Status
│   ├── ⬆️  Push Changes
│   └── ⚙️  Configuration
│
├── ⚙️  System
│   ├── ⚙️  Settings
│   ├── 📅 Daily Focus
│   ├── 📋 View Log
│   └── 📊 Analytics
│
└── ✕ Exit
```

---

## 🏗️ Architecture

POPPY is designed as a **management layer** that sits above your AI engines:

```
┌─────────────────────────────────────────┐
│           POPPY (Manager Layer)         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │ Projects│ │ Agents  │ │  APIs   │  │
│  │ Skills  │ │Marketplace│ │ Analytics│  │
│  └────┬────┘ └────┬────┘ └────┬────┘  │
│       └─────────────┴─────────────┘     │
│              Engine Manager              │
└─────────────────┬──────────────────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
┌───▼────┐   ┌───▼────┐   ┌───▼────┐
│ Codex  │   │ Claude │   │ Cursor │
│(OpenAI)│   │(Anthro)│   │(Editor)│
└────────┘   └────────┘   └────────┘
```

### How It Works

1. **Engine Detection** - POPPY scans for installed AI engines
2. **Context Injection** - When launching an engine, POPPY writes context files:
   - For Codex: Creates `.codex` instructions
   - For Claude: Creates `CLAUDE.md` 
   - For Cursor: Creates `.cursorrules`
3. **Unified Interface** - Same workflow regardless of which engine you use

### Data Storage

POPPY stores configuration in `~/.poppy/`:
```
~/.poppy/
├── config.json           # Settings
├── api-keys.enc          # Encrypted API keys
├── agents/               # Downloaded agents
├── skills/               # Installed skills
└── projects.json         # Project registry
```

Projects are stored in your workspace directory:
```
POPPY/
├── P1/                   # Project folders
├── P2/
├── P3/
├── agents/               # Custom agents
└── admin/                # POPPY system
```

---

## 📥 Importing Projects

POPPY can import projects from anywhere:

### From GitHub/GitLab
```bash
poppy
→ Projects
→ Import Project
→ GitHub / GitLab
→ Enter URL: https://github.com/user/repo
```

### From Local Directory
```bash
poppy
→ Projects
→ Import Project
→ Local Directory
→ Enter path: /path/to/project
```

### From ZIP File
```bash
poppy
→ Projects
→ Import Project
→ ZIP Archive
→ Select ZIP file
```

---

## 🎯 Working with Skills

### Create a Skill
```bash
poppy
→ Skills
→ Create Skill
→ Name: react-patterns
→ Category: Frontend
→ Content: [knowledge, patterns, rules]
```

### Attach Skill to Agent
```bash
poppy
→ Skills
→ Attach to Agent
→ Select skill: react-patterns
→ Select agent: Frontend Expert
```

---

## 🔐 API Key Management

POPPY securely manages API keys:
```bash
poppy
→ API Keys
→ Manage API Keys
→ Add keys for OpenAI, Anthropic, etc.
```

Keys are:
- ✅ Encrypted at rest using AES-256
- ✅ Never exposed to agents or logged
- ✅ Used only by POPPY to launch engines

---

## 🔄 Daily Workflow

**Morning:**
```bash
poppy → System → Daily Focus
→ Select today's priority projects
→ Set focus areas
```

**Work:**
```bash
poppy → Projects → My Projects
→ Select project
→ Choose AI engine to launch
→ Start coding with injected context
```

**End of Day:**
```bash
poppy → System → View Log
→ Review what was accomplished
→ Git → Commit Changes
```

---

## 🌐 Supported Systems

**AI Engines:**
- ✅ OpenAI Codex
- ✅ Anthropic Claude Code
- ✅ Cursor
- ✅ Custom engines (extensible)

**Git Providers:**
- ✅ GitHub
- ✅ GitLab
- ✅ Bitbucket

**Platforms:**
- ✅ Windows 10/11
- ✅ macOS
- ✅ Linux

---

## 📄 Documentation

- **[ARCHITECTURE.md](admin/ARCHITECTURE.md)** - System architecture and design
- **[DUAL-REPO-SETUP.md](DUAL-REPO-SETUP.md)** - For contributors (setup details)
- **[WORKFLOW.md](WORKFLOW.md)** - Development workflow guide
- **[QUICKSTART.md](QUICKSTART.md)** - Quick reference

---

## 🤝 Contributing

POPPY is open source! We welcome contributions:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

See [WORKFLOW.md](WORKFLOW.md) for detailed contribution guidelines.

---

## 🆚 POPPY vs POPPY-MAXIM

| Feature | POPPY (This Repo) | POPPY-MAXIM (Creator) |
|---------|-------------------|----------------------|
| **Visibility** | 🌐 Public | 🔒 Private |
| **Use Case** | Template for users | Maxim's daily workspace |
| **Analytics** | Personal only | Personal + Global (Creator Dashboard) |
| **Projects** | Empty template | Actual projects |
| **Purpose** | Community tool | Creator's personal version |

**POPPY** is the open-source template that anyone can clone and use.

**POPPY-MAXIM** is the private creator version with global analytics.

---

## 🛠️ Troubleshooting

### "poppy" command not found
```bash
# Windows: Add to PATH or restart terminal
# Mac/Linux: Source your shell config
source ~/.bashrc  # or ~/.zshrc
```

### Need to reset POPPY
```bash
# Delete config (keeps projects)
rm ~/.poppy/config.json
```

### Installation issues
See [SETUP_POPPY.cmd](admin/SETUP_POPPY.cmd) (Windows) or [install.sh](admin/install.sh) (Mac/Linux).

---

## 📄 License

MIT License - See [LICENSE](admin/LICENSE)

---

## 🙏 Credits

Created by **Maxim Tsitolovsky** - Inspired by the need for a unified AI workspace.

**Ready? Run `poppy` and start organizing your AI workflow!** 🚀

---

<p align="center">
  🐶 <strong>POPPY</strong> - Organize Your AI Workspace
</p>
