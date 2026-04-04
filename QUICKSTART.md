# 🚀 POPPY Quick Start Guide

## ✅ You're Set Up!

### Current Status
- **Branch:** `personal` (your private workspace)
- **Menu:** New structure with Marketplace + Prompts
- **API Keys:** 4 keys detected (Gemini, Fireworks, Kimi, GitHub)
- **Protection:** Personal data is git-ignored

---

## 🎯 Daily Use

### Launch POPPY
```bash
cd C:\Users\maxim\PersonalAI
poppy
```

### Menu Structure
```
📁 Projects           → Your private projects
🤖 Agents             → Manage agents
🎯 Skills              → Manage skills
💬 Prompts            → NEW: Manage prompts
🛒 Marketplace         → NEW: Browse 3 markets
  ├─ 🤖 Agent Marketplace
  ├─ 🎯 Skills Marketplace
  └─ 💬 Prompt Marketplace
🔐 API Keys            → Shows all 4 of your keys
🔀 Git                 → Git operations
⚙️  System             → System settings
```

---

## 🔄 When You Want to Share Code Updates

```bash
# 1. Make sure you're on personal branch (you are)
git branch  # Should show: * personal

# 2. Save your changes
git add -A
git commit -m "feat: your improvements"

# 3. Switch to template branch
git checkout template

# 4. Copy your code improvements (not data)
git checkout personal -- admin/admin.js

# 5. Test template still works
poppy

# 6. Push to GitHub
git add -A
git commit -m "feat: share improvements"
git push origin template

# 7. Back to personal
git checkout personal
```

---

## ⚠️ Important

**NEVER run on `personal` branch:**
```bash
git push origin personal    # ❌ DON'T DO THIS
```

**ALWAYS stay on `personal` for your daily work:**
```bash
git checkout personal       # ✅ Your workspace
poppy                       # ✅ Run POPPY
```

---

## 📚 Documentation

- `WORKFLOW.md` - Full dual-version workflow
- `DISTRIBUTION.md` - Guide for new users
- `USER-CONFIG.md` - Your personal info (private)
- `USER-CONFIG.template.md` - Template for others

---

## 🐶 Ready!

Run `poppy` and enjoy your new menu with Marketplace + Prompts!
