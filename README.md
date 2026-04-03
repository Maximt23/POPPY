# 🐢 POPPY - Universal AI Project Manager

**POPPY** is a universal overlay for AI coding engines (Codex, Claude Code, Cursor) that manages projects, agents, skills, and workflows across all your AI tools.

Like `code-puppy`, but for managing all your AI engines and projects in one place.

## 🚀 Quick Start (2 Steps)

### Step 1: Clone POPPY
```bash
git clone https://github.com/Maximt23/code-puppy-POPPY.git
```

### Step 2: Run Setup
**Windows:**
```cmd
cd code-puppy-POPPY\admin
SETUP_POPPY.cmd
```

**Mac/Linux:**
```bash
cd code-puppy-POPPY/admin
chmod +x SETUP_POPPY.sh
./SETUP_POPPY.sh
```

That's it! Now type `poppy` from anywhere:
```bash
poppy
```

---

## ✨ What Makes POPPY Special

### 🎯 Universal Engine Support
Launch any AI engine with the same workflow:
- 🤖 **Code Puppy** - Your personal AI assistant
- 🔷 **Codex** (OpenAI)
- 🟣 **Claude Code** (Anthropic)
- 🟢 **Cursor**

### 📁 Project Management
- Create projects with templates (React, Node, Python, etc.)
- Import projects from GitHub, GitLab, ZIP files
- Switch between projects instantly
- Each project gets its own agents and context

### 🤖 Agent System
- Create specialized agents for different tasks
- Attach skills to agents
- Share agents between projects
- Marketplace to download community agents

### 🎯 Skills Library
Skills are reusable abilities agents can learn:
- `react-patterns` - React best practices
- `api-design` - RESTful API design
- `testing-strategies` - Testing patterns
- `security-essentials` - Security practices
- Create your own skills and share them

### 📥 Project Import
Import from anywhere:
- GitHub/GitLab repositories
- Local directories
- ZIP archives
- Other POPPY workspaces

---

## 📂 Menu Structure (Clean & Collapsible)

```
POPPY Main Menu (8 options - no scrolling!)
│
├── ▶ Launch AI Engine
│   ├── 🐶 Code Puppy
│   ├── 🔷 Codex (if installed)
│   ├── 🟣 Claude Code (if installed)
│   └── 🟢 Cursor (if installed)
│
├── ➕ New Project
│
├── 📁 Projects
│   ├── ➕ Create New Project
│   ├── 📥 Import Project ← NEW!
│   ├── 📁 Manage Projects
│   └── 🚀 Quick Launch
│
├── 🤖 Agents
│   ├── 🤖 My Agents
│   └── ➕ Create Agent
│
├── 🎯 Skills ← NEW!
│   ├── 🎯 My Skills
│   ├── ➕ Create Skill
│   ├── 📚 Browse Library
│   ├── ⬇️  Install Skill
│   └── 🔗 Attach to Agent
│
├── 🔐 API Keys
│
├── 🔀 Git
│
├── ⚙️  System
│   ├── ⚙️  Settings
│   ├── 📅 Daily Focus
│   ├── 📋 View Log
│   └── 🤖 Agent Settings
│
└── ✕ Exit
```

---

## 🎯 Working with Skills

Skills are reusable "abilities" that agents can learn.

### Create a Skill
```bash
poppy
→ Skills
→ Create Skill
→ Name: react-patterns
→ Category: Frontend
→ Content: [editor opens for knowledge, patterns, rules]
→ Done! Skill created
```

### Attach Skill to Agent
```bash
poppy
→ Skills
→ Attach to Agent
→ Select skill: react-patterns
→ Select agent: Frontend Expert
→ Done! Agent now knows React patterns
```

### Install from Library
```bash
poppy
→ Skills
→ Install Skill
→ Browse Library
→ Select: api-design, testing-strategies
→ Done! Skills installed
```

---

## 📥 Importing Projects

### From GitHub/GitLab/Bitbucket
```bash
poppy
→ Projects
→ Import Project
→ GitHub / GitLab / Bitbucket
→ Enter URL: https://github.com/user/repo
→ Done! Project imported and tracked in POPPY
```

### From Local Directory
```bash
poppy
→ Projects
→ Import Project
→ Local Directory
→ Enter path: C:\Users\me\my-project
→ Done! Project copied and added to POPPY
```

### From ZIP File
```bash
poppy
→ Projects
→ Import Project
→ ZIP Archive
→ Enter path: C:\Downloads\project.zip
→ Done! Extracted and added to POPPY
```

### From Another POPPY Workspace
```bash
poppy
→ Projects
→ Import Project
→ POPPY Workspace
→ Enter path: C:\Users\other\PersonalAI
→ Select project from list
→ Done! Project + agents imported
```

---

## 📁 Your Data

POPPY stores your data in `~/.poppy/`:
```
~/.poppy/
├── config.json           # Your settings
├── api-keys.enc          # Encrypted API keys
├── skills/               # Your skills
├── agents/               # Downloaded agents
├── projects/             # Project metadata
└── communication/        # Agent messages
```

Projects are stored in your workspace:
```
PersonalAI/
├── P1/                   # Your projects
├── P2/
├── P3/
├── agents/               # Shared agents
└── admin/                # POPPY system
```

---

## 🔐 API Key Management

POPPY securely manages API keys:
```bash
poppy
→ API Keys
→ Manage API Keys
→ Add keys for OpenAI, Anthropic, etc.
→ Keys encrypted and stored securely
```

Keys are:
- ✅ Encrypted at rest
- ✅ Never exposed to agents
- ✅ Used only by POPPY to launch engines

---

## 🔄 Daily Workflow

**Morning:**
```bash
poppy → System → Daily Focus
→ Select today's projects
→ Set focus and priority
```

**Work:**
```bash
poppy → Launch AI Engine → Code Puppy
→ Work on project with agent
```

**End of Day:**
```bash
poppy → System → View Log
→ Git → Commit Changes
```

---

## 🌐 Supported Systems

**AI Engines:**
- ✅ Code Puppy
- ✅ OpenAI Codex
- ✅ Anthropic Claude Code
- ✅ Cursor

**Git Providers:**
- ✅ GitHub
- ✅ GitLab
- ✅ Bitbucket

**Import Sources:**
- ✅ Git repositories
- ✅ Local directories
- ✅ ZIP archives
- ✅ POPPY workspaces

---

## 🛠️ Installation Troubleshooting

### "poppy" command not found
```cmd
# Re-run setup
SETUP_POPPY.cmd

# Or restart terminal
```

### Need to reset POPPY
```bash
# Delete config (keeps projects)
rm ~/.poppy/config.json
```

---

## 📄 License

MIT License

---

**Ready? Run `SETUP_POPPY.cmd` and type `poppy`!** 🚀
