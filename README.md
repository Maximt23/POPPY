# 🐶 Code-Puppy Project Workspace

Welcome to your multi-project workspace! This setup allows you to easily switch between projects.

## 📁 Projects

### 1. 📱 WearWise (P1) - React Native App
- **Location**: `\PersonalAI\P1`
- **Type**: React Native + Expo 55
- **Features**: Camera, Location, SQLite
- **Start**: `npm start` (runs Expo)

### 2. 🚀 Project Two (P2) - Node.js Server
- **Location**: `\PersonalAI\P2`
- **Type**: Node.js + Express
- **Features**: REST API, Health checks
- **Start**: `npm start` (runs on port 3000)

### 3. 🎛️ Admin Console (Admin) - Management Tool
- **Location**: `\PersonalAI\admin`
- **Type**: Node.js CLI Application
- **Features**:
  - 📅 **Daily Focus Planning** - Set which projects to work on each day
  - 🤖 **Agent Inventory** - Store and manage reusable agents
  - 🔄 **Agent Sharing** - Share agents between projects seamlessly
  - 📊 **Usage Tracking** - Monitor agent and project usage
  - 🚀 **New Project Wizard** - Scaffold new projects with starter agents
  - ⚡ **Quick Agent Mode** - Fast-track agent creation
  - 🌐 **Git Integration** - Sync projects and agents to Git
    - Auto-initialize Git repos for new projects
    - Push agents to GitHub/GitLab/Bitbucket
    - Sync project changes to version control
    - Auto-sync on exit option
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

### 🌐 Git Integration

**Setup Git Sync:**
1. Go to **System Settings → Git Configuration**
2. Choose provider: GitHub / GitLab / Bitbucket
3. Enter your username and Personal Access Token
4. Set default agents repository name
5. Enable auto-sync (optional) - agents sync on exit

**Features:**
- **☁️ Sync Project to Git** - Push any project to Git with one click
- **Auto-Init** - New projects automatically get Git initialized
- **Agent Backup** - Export all agents to structured JSON files
- **Auto-Sync** - Automatically sync agents when exiting admin

**Git Workflow:**
```
Create New Project → Git initialized automatically
                   ↓
Make changes → ☁️ Sync Project to Git
                   ↓
Commit & push to GitHub/GitLab
```

## 🔧 Quick Commands

| Action | Command |
|--------|---------|
| Run WearWise | `cd P1 && npm start` |
| Run Project Two | `cd P2 && npm start` |
| Launch Admin | `cd admin && npm start` |
| Open Selector | `.\select-project.bat` |
| Install P1 deps | `cd P1 && npm install` |
| Install P2 deps | `cd P2 && npm install` |
| Install Admin deps | `cd admin && npm install` |

## 🎮 Admin Console Menu

When you launch the admin console, you'll see:

```
⚡ Quick Actions
  🚀 Start New Project
  ⚡ Quick Agent Mode

📋 Daily Planning
  📅 Set Today's Focus
  📊 View Today's Log

🗂️  Projects
  📁 Manage Projects
  🚀 Quick Launch Project
  ☁️  Sync Project to Git       ← NEW!

🤖 Agent Inventory
  📦 View All Agents
  ➕ Add New Agent
  🔄 Share Agent
  ⚙️  Agent Settings

⚡ System
  🔧 System Settings
  🌐 Git Configuration          ← NEW!
  ☁️  Sync Agents to Git        ← NEW!
  🚪 Exit (auto-syncs if enabled)
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
