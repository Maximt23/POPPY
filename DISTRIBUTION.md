# 🚀 POPPY Distribution Guide

## 📦 What You Get (Naked Template)

This is a **clean, personalized POPPY installation**. When you clone this repo, you get:

### ✅ Included (Template)
- `admin/` - POPPY system code
- `admin/data/.gitkeep` - Empty data directory (ready for your data)
- `agents/.gitkeep` - Empty agents directory
- `skills/.gitkeep` - Empty skills directory
- `prompts/.gitkeep` - Empty prompts directory
- `projects/.gitkeep` - Empty projects directory
- `USER-CONFIG.template.md` - Copy this to personalize
- `.gitignore` - Protects your personal data
- Documentation and setup scripts

### ❌ NOT Included (Your Personal Data)
- `admin/data/*` - Your agents, projects, API configs
- `projects/*` - Your private project library
- `agents/*` - Your personal agents (until you share them)
- `skills/*` - Your personal skills
- `prompts/*` - Your personal prompts
- `.env` - Your API keys
- `USER-CONFIG.md` - Your personal info
- `*.log` - Your activity logs

---

## 🎯 First-Time Setup

### 1. Copy Personal Config Template
```bash
cp USER-CONFIG.template.md USER-CONFIG.md
```
Edit `USER-CONFIG.md` with your name and details.

### 2. Set Up Your API Keys
Choose ONE method:

**Option A: .env file (recommended)**
```bash
# Create .env file
echo "OPENAI_API_KEY=your_key_here" >> .env
echo "GITHUB_TOKEN=your_token_here" >> .env
# Add other keys as needed
```

**Option B: Code Puppy config**
If you use Code Puppy, POPPY will auto-detect your keys from `~/.code_puppy/puppy.cfg`

**Option C: Environment variables**
Set them in your shell profile.

### 3. Run POPPY
```bash
./SETUP_POPPY.cmd    # Windows
# or
node admin/admin.js  # Direct
```

---

## 🎨 Menu Structure

```
📁 Projects          → Your private project library
🤖 Agents            → Manage your agents
🎯 Skills            → Manage your skills
💬 Prompts           → Manage your prompt templates
🛒 Marketplace       → Browse community resources
  ├─ 🤖 Agent Marketplace
  ├─ 🎯 Skills Marketplace
  └─ 💬 Prompt Marketplace
🔐 API Keys          → Manage your API keys
🔀 Git               → Git operations
⚙️  System            → System settings
```

---

## 🤝 Sharing Your Work

### Share Agents
1. Create an agent in `agents/`
2. Test it works
3. Commit and push: `git add agents/my-agent.json && git commit -m "feat: new agent"`

### Share Skills
1. Create a skill in `skills/`
2. Document it well
3. Commit and push

### Share Prompts
1. Create a prompt in `prompts/`
2. Make it reusable
3. Commit and push

---

## 🔒 Security

Your personal data is protected by `.gitignore`:

```
✅ Safe to commit:    agents/, skills/, prompts/, admin/*.js
❌ NEVER commit:     .env, admin/data/*, projects/*, USER-CONFIG.md
```

---

## 📞 Support

- Original Author: Maxim Tsitolovsky (Maximt23)
- Your Installation: Personal and Private
- Community: Share agents/skills/prompts via Marketplace

---

**Welcome to POPPY! Make it yours. 🐶**
