# 🐶 Code-Puppy Monorepo

Welcome to your **monorepo workspace**! Everything lives in one Git repository for complete version history.

## 🗂️  Monorepo Structure

```
PersonalAI/                 ← Git root (monorepo)
├── .git/                   ← Version control
├── P1/                     📱 WearWise (React Native)
├── P2/                     🚀 Project Two (Node.js)
├── admin/                  🎛️ Admin Console (CLI)
├── agents/                 🤖 Shared agent configs
│   ├── agent-xxx.json
│   └── README.md
├── select-project.bat      🎯 Quick selector
└── README.md
```

### 🤖 Agents Folder (`/agents/`)
- Each agent is a separate JSON file
- Tracked by Git = version history of all agent changes
- Shared across all projects in the monorepo
- No more remaking agents!

## 📁 Projects

### 1. 📱 WearWise (P1) - React Native App
- **Location**: `\PersonalAI\P1`
- **Type**: React Native + Expo 55
- **Features**: Camera, Location, SQLite
- **Start**: `npm start`
- **Tracked in monorepo**: ✅

### 2. 🚀 Project Two (P2) - Node.js Server
- **Location**: `\PersonalAI\P2`
- **Type**: Node.js + Express
- **Features**: REST API, Health checks
- **Start**: `npm start`
- **Tracked in monorepo**: ✅

### 3. 🎛️ Admin Console (Admin) - Management Tool
- **Location**: `\PersonalAI\admin`
- **Type**: Node.js CLI Application
- **Features**:
  - 📅 **Daily Focus Planning** - Set which projects to work on each day
  - 🤖 **Agent Inventory** - Store and manage reusable agents in `/agents/`
  - 🔄 **Agent Sharing** - Share agents between projects seamlessly
  - 📊 **Usage Tracking** - Monitor agent and project usage
  - 🚀 **New Project Wizard** - Scaffold new projects with starter agents
  - ⚡ **Quick Agent Mode** - Fast-track agent creation
  - 📝 **Monorepo Commits** - Commit all changes with version history
  - 📊 **Git Status** - View what's changed in the monorepo
- **Start**: `npm start` or `node admin.js`
- **Theme**: Green terminal UI 🟢

## 🎯 How to Switch Projects

### Option 1: Use the Selector Script (Recommended)
```bash
# From anywhere in \PersonalAI
.\select-project.bat
```
Then choose:
- `1` for WearWise (P1)
- `2` for Project Two (P2)
- `A` for **Admin Console** (project & agent management)
- `3` to stay in current directory

### Option 2: Manual Navigation
```bash
cd P1       # Go to WearWise
cd P2       # Go to Project Two
cd admin    # Go to Admin Console
cd ..       # Go back to workspace root
```

## 🎯 Admin Console Features

### ⚡ Quick Actions
- **🚀 Start New Project** - Interactive wizard to create projects:
  - Choose type: React Native, Node.js/Express, React Web, Python, or Empty
  - Auto-generate starter files (package.json, README, etc.)
  - Create starter agents automatically
  - Project gets unique ID and is added to registry

- **⚡ Quick Agent Mode** - Fast-track agent creation:
  - Create multiple agents in quick succession
  - Type "done" to finish at any time
  - Agents automatically saved to inventory

### Daily Planning
- Set today's focus projects
- Set priority levels (High/Medium/Low)
- Track what you worked on

### Agent Inventory
- **Add Agents** - Create reusable agents with descriptions
- **Share Agents** - Make agents available across multiple projects
- **Agent Settings** - View stats, edit, or delete agents
- **No Remaking** - Use the same agents everywhere!
- **Starter Agents** - Auto-create agents when starting new projects:
  - 🐶 Code Assistant
  - 📚 Documentation Helper
  - 🐛 Debug Helper
  - 🎨 UI/UX Reviewer

### 📝 Monorepo Version Control

Everything in this workspace is tracked by **one Git repository** at the PersonalAI root:

**What's Tracked:**
- ✅ All projects (P1, P2, P3...)
- ✅ All agents (`/agents/` folder)
- ✅ Admin configuration
- ✅ Project selector script

**What's NOT Tracked:**
- ❌ `node_modules/` (auto-generated)
- ❌ `.env` files (secrets)
- ❌ Daily logs (session data)

**Workflow:**
```
Make changes → 📝 Commit Changes (in Admin Console)
                    ↓
             Git records everything
                    ↓
         View history anytime (Git Status)
```

**Benefits:**
- 📜 Complete history of all changes
- 🔄 Roll back to any point
- 🤝 Share entire workspace with others
- ☁️ Push to GitHub/GitLab for backup (optional)
- 🆓 100% FREE - no costs ever

## 🔧 Quick Commands

| Action | Command |
|--------|---------|
| Run WearWise | `cd P1 && npm start` |
| Run Project Two | `cd P2 && npm start` |
| Launch Admin | `cd admin && npm start` |
| Open Selector | `.\select-project.bat` |
| **Commit Changes** | `cd .. && git add . && git commit -m "message"` |
| **View Git Log** | `cd .. && git log --oneline` |
| Install P1 deps | `cd P1 && npm install` |
| Install P2 deps | `cd P2 && npm install` |
| Install Admin deps | `cd admin && npm install` |

## 🎮 Admin Console Menu

When you launch the admin console, you'll see:

```
⚡ Quick Actions
  🚀 Start New Project        ← Creates P3, P4, etc.
  ⚡ Quick Agent Mode         ← Batch create agents

📋 Daily Planning
  📅 Set Today's Focus
  📊 View Today's Log

🗂️  Projects
  📁 Manage Projects
  🚀 Quick Launch Project

🤖 Agent Inventory
  📦 View All Agents          ← Shows /agents/ folder
  ➕ Add New Agent           ← Saves to /agents/
  🔄 Share Agent
  ⚙️  Agent Settings

📝 Monorepo                  ← NEW!
  📝 Commit Changes         ← Records all changes
  📊 View Git Status        ← See what's changed

⚡ System
  🔧 System Settings
  🚪 Exit (asks to commit)
```

## 📝 Notes

- **P1 (WearWise)**: Mobile app - requires Expo Go app on phone
- **P2**: Server - runs locally on your machine
- **Admin**: CLI tool - runs in terminal with beautiful green UI
- All projects are independent but can share agents via the Admin Console
- Use `select-project.bat` anytime to switch between them!

## 🎨 Admin Console Theme

The admin console uses a beautiful green color scheme:
- Primary: `#22c55e` (bright green)
- Secondary: `#16a34a` (forest green)
- Accent: `#4ade80` (light green)
- Dark: `#14532d` (dark green)

---
*Managed by Code-Puppy 🐕*
