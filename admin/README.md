# POPPY - Universal AI Project Manager

```
  ██████╗  ██████╗ ██████╗ ██████╗ ██╗   ██╗
  ██╔══██╗██╔═══██╗██╔══██╗██╔══██╗██║   ██║
  ██████╔╝██║   ██║██████╔╝██████╔╝╚██████╔╝
  ██╔═══╝ ██║   ██║██╔═══╝ ██╔═══╝  ╚═══██║
  ██║     ╚██████╔╝██║     ██║         ██║
  ╚═╝      ╚══════╝╚═╝     ╚═╝         ╚═╝
```

POPPY is a universal project manager that works with **any AI coding engine**. Organize your projects, manage AI agents, track daily progress, and maintain git discipline - regardless of which AI assistant you use.

## 🎯 Supported AI Engines

- **Code-Puppy** - Personal AI assistant with project isolation
- **Code-Ex** - Extended code assistant engine  
- **Claude Code** - Anthropic's terminal-based assistant
- **Cursor** - AI-first code editor
- **GitHub Copilot** - GitHub's AI pair programmer
- **Custom** - Bring your own AI configuration

## 📦 Installation

### Global Install (Recommended)

```bash
npm install -g poppy-admin
```

### Local Install

```bash
npm install poppy-admin
npx poppy
```

### From Source

```bash
git clone https://github.com/Maximt23/code-puppy-POPPY.git
cd admin
npm install
npm link  # Makes 'poppy' command available globally
```

## 🚀 Quick Start

1. **Launch POPPY:**
   ```bash
   poppy
   ```

2. **Configure your AI engine:**
   ```bash
   poppy --setup
   ```

3. **Add your API keys:**
   ```bash
   poppy --config
   ```

## ⚙️ Configuration

### Set Your AI Engine

```bash
poppy engine code-puppy    # For Code-Puppy
poppy engine claude-code   # For Claude Code
poppy engine cursor        # For Cursor
```

### Add API Keys

```bash
poppy key openai sk-...
poppy key anthropic sk-ant-...
poppy key gemini ...
```

### First-Time Setup

When you first run `poppy`, it will:

1. Create `~/.poppy/` configuration directory
2. Set up agent inventory storage
3. Configure default project paths
4. Prompt for API keys (optional)

## 📋 Features

### Project Management
- **Create Projects** - Scaffold new projects with templates
- **Track Progress** - Daily focus and work logging
- **Quick Launch** - Open projects in your editor
- **Monorepo Support** - Manage multiple projects together

### Agent Inventory
- **Shared Agents** - Reusable agents across all projects
- **Project Agents** - Project-specific AI configurations
- **Agent Templates** - Quick-start agent creation
- **Export/Import** - Share agents with team members

### Git Integration
- **Status Monitoring** - See all changes across projects
- **Smart Commits** - Commit with meaningful messages
- **Auto-Sync** - Push to GitHub automatically
- **Repository Health** - Track uncommitted and unpushed changes

### Daily Tracking
- **Set Focus** - Define daily objectives
- **Log Work** - Track what you accomplished
- **Review History** - See past daily logs
- **Time Tracking** - Monitor time spent on projects

## 🛠️ Commands

```bash
poppy                    # Launch interactive menu
poppy --help            # Show help
poppy --version         # Show version
poppy --setup           # Initial configuration
poppy --config          # Edit configuration
poppy new <name>        # Quick create project
poppy status            # Show git status
poppy commit            # Commit changes
```

## 📁 Project Structure

```
~/.poppy/
├── config.json          # POPPY configuration
├── agents/              # Agent inventory
│   ├── agent-1.json
│   └── agent-2.json
├── logs/                # Daily work logs
└── templates/           # Project templates

~/Projects/              # Your projects (configurable)
├── project-1/
├── project-2/
└── shared-agents/
```

## 🔧 Custom Configuration

Create `~/.poppy/config.json`:

```json
{
  "engine": "code-puppy",
  "apiKeys": {
    "openai": "sk-...",
    "anthropic": "sk-ant-..."
  },
  "paths": {
    "projects": "/home/user/Projects",
    "agents": "/home/user/.poppy/agents"
  },
  "git": {
    "enabled": true,
    "provider": "github",
    "username": "yourusername",
    "token": "ghp_..."
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

## 🙏 Credits

Created by Maxim as a universal project management tool for AI-assisted coding.

---

**POPPY** - Organize your AI coding workflow, regardless of the engine.
