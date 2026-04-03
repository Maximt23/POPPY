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

## 🚀 Quick Start (Choose One)

### Option 1: One-Line Install (Windows)
Copy-paste into Command Prompt or PowerShell:
```cmd
powershell -Command "git clone https://github.com/Maximt23/code-puppy-POPPY.git %USERPROFILE%\poppy && setx PATH \"%PATH%;%USERPROFILE%\poppy\admin\" && %USERPROFILE%\poppy\admin\poppy.cmd"
```
Then restart your terminal and type: `poppy`

### Option 2: NPM Install (Recommended for Developers)
```bash
npm install -g poppy-admin
poppy --setup
```

### Option 3: Manual Install
1. **Download**: `git clone https://github.com/Maximt23/code-puppy-POPPY.git`
2. **Add to PATH**: Add the `admin` folder to your system PATH
3. **Run**: Type `poppy` in your terminal

---

## 📥 Download & Installation

### Windows

**Quick Install (Automatic):**
```batch
curl -o install-poppy.bat https://raw.githubusercontent.com/Maximt23/code-puppy-POPPY/master/admin/install.cmd
install-poppy.bat
```

**Manual Install:**
1. Download: https://github.com/Maximt23/code-puppy-POPPY/archive/refs/heads/master.zip
2. Extract to: `C:\Users\YourName\poppy`
3. Add to PATH:
   - Win + R → type `sysdm.cpl` → Enter
   - Advanced → Environment Variables
   - Edit PATH → Add `C:\Users\YourName\poppy\admin`
4. Open new terminal → Type `poppy`

### macOS / Linux

**Quick Install:**
```bash
curl -fsSL https://raw.githubusercontent.com/Maximt23/code-puppy-POPPY/master/admin/install.sh | bash
```

**Manual Install:**
```bash
git clone https://github.com/Maximt23/code-puppy-POPPY.git ~/poppy
echo 'export PATH="$PATH:$HOME/poppy/admin"' >> ~/.bashrc
source ~/.bashrc
poppy
```

---

## 🎯 Supported AI Engines

- **Code-Puppy** - Personal AI assistant with project isolation
- **Code-Ex** - Extended code assistant engine  
- **Claude Code** - Anthropic's terminal-based assistant
- **Cursor** - AI-first code editor
- **GitHub Copilot** - GitHub's AI pair programmer
- **Custom** - Bring your own AI configuration

---

## ⚙️ First-Time Setup

After installation, run:
```bash
poppy --setup
```

This will:
1. Detect or select your AI engine
2. Configure project directories
3. Set up agent inventory storage
4. Configure Git integration (optional)

---

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

---

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

---

## 🔧 Configuration

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

### Config File Location

Config is stored at:
- **Windows**: `%USERPROFILE%\.poppy\config.json`
- **Mac/Linux**: `~/.poppy/config.json`

Example config:
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

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

---

## 🙏 Credits

Created by Maxim as a universal project management tool for AI-assisted coding.

---

**POPPY** - Organize your AI coding workflow, regardless of the engine.