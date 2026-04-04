# 🔄 POPPY Dual-Version Workflow

## 🎯 Overview

You have TWO versions of POPPY:

1. **`personal` branch** - Your private version with YOUR data, API keys, projects
2. **`template` branch** - Clean version for GitHub that others can download

---

## 🌿 Branch Strategy

### `personal` (Your Daily Driver)
- ✅ Your API keys in `.env`
- ✅ Your `USER-CONFIG.md` with your name
- ✅ Your projects in `projects/`
- ✅ Your agents in `admin/data/`
- ✅ All your personal data
- ❌ NEVER push this to GitHub public

### `template` (For GitHub)
- ✅ Clean code only
- ✅ Empty directories with `.gitkeep`
- ✅ No API keys
- ✅ No personal data
- ✅ `USER-CONFIG.template.md` for new users
- ✅ Anyone can clone and personalize

---

## 🚀 Setup Instructions

### Step 1: Create Personal Branch (One-Time)

```bash
cd C:\Users\maxim\PersonalAI

# Create and switch to personal branch
git checkout -b personal

# This branch is for YOU ONLY - never push to public
git branch --set-upstream-to=origin/master personal
```

### Step 2: Create Template Branch (One-Time)

```bash
# Go back to master (will be your template)
git checkout master

# Create template branch from master
git checkout -b template

# Clean personal data from template
git rm --cached admin/data/agents.json
git rm --cached admin/data/*.json
git rm --cached USER-CONFIG.md
git rm --cached .env

# Commit the clean template
git add -A
git commit -m "template: clean version for distribution"

# Push template to GitHub
git push origin template
```

---

## 📋 Daily Workflow

### Working on Personal Version (Your Stuff)

```bash
# Switch to personal
git checkout personal

# Work on your projects, agents, etc.
poppy

# Save your changes
git add -A
git commit -m "personal: my daily updates"

# NEVER push personal to GitHub (keep local)
```

### Updating the Template (For Others)

When you improve the code/system and want to share:

```bash
# 1. Get your latest code changes (not data)
git checkout personal
git log --oneline -5  # See recent commits

# 2. Switch to template
git checkout template

# 3. Cherry-pick code improvements from personal
# (Only the ones that aren't personal data)
git cherry-pick <commit-hash>

# 4. OR manually copy improvements
# Edit files in template, keeping it clean

# 5. Test the template works
poppy

# 6. Push template to GitHub
git push origin template
```

---

## 🔀 Quick Commands Reference

```bash
# Check which branch you're on
git branch

# Switch to personal (your daily work)
git checkout personal

# Switch to template (for sharing)
git checkout template

# See what changed
git status

# Compare branches
git diff personal template -- admin/admin.js

# Copy specific file from personal to template
git checkout personal -- admin/admin.js
```

---

## 🎨 Making Updates

### Scenario: You Fixed a Bug in POPPY

```bash
# You're on personal branch, fixed the bug
git checkout personal
git add -A
git commit -m "fix: resolved the bug"

# Now share the fix with template
git checkout template
git cherry-pick <commit-hash-of-the-fix>
git push origin template

# Back to personal
git checkout personal
```

### Scenario: You Added a New Feature

```bash
# On personal branch
git checkout personal
# Code the feature
poppy  # Test it
git add -A
git commit -m "feat: new awesome feature"

# Share with template
git checkout template
git checkout personal -- admin/admin.js  # Copy just the code
git add -A
git commit -m "feat: add new feature to template"
git push origin template

git checkout personal
```

---

## ⚠️ Important Rules

### NEVER Do This on `template` Branch:
- ❌ Add your API keys
- ❌ Commit `USER-CONFIG.md` with your name
- ❌ Add your projects
- ❌ Add your personal agents data
- ❌ Commit `.env` file

### ALWAYS Do This on `template` Branch:
- ✅ Keep `USER-CONFIG.template.md`
- ✅ Keep `.gitignore` protecting data
- ✅ Only share code improvements
- ✅ Test it works with empty data

### NEVER Push `personal` Branch:
- ❌ `git push origin personal` - DON'T DO THIS
- Keep personal branch LOCAL ONLY

---

## 🔄 Sync Workflow (Advanced)

If template gets updates from others:

```bash
# On personal branch
git checkout personal
git fetch origin
git merge origin/template  # Get template updates
# Resolve any conflicts
git commit -m "sync: merge template updates"
```

---

## 🆘 Emergency Recovery

If you accidentally pushed personal data:

```bash
# IMMEDIATELY remove from GitHub
git checkout template
git rm --cached <sensitive-file>
git commit -m "fix: remove sensitive data"
git push origin template --force-with-lease

# Then rotate your API keys!
```

---

## 📁 What's Tracked Where

| File/Dir | `personal` | `template` | Notes |
|----------|-----------|------------|-------|
| `admin/admin.js` | ✅ | ✅ | Share code |
| `admin/data/*` | ✅ | ❌ | Personal only |
| `projects/*` | ✅ | ❌ | Personal only |
| `agents/*.json` | ✅ | ⚠️ | Share good ones |
| `skills/*.json` | ✅ | ⚠️ | Share good ones |
| `prompts/*.json` | ✅ | ⚠️ | Share good ones |
| `.env` | ✅ | ❌ | NEVER share |
| `USER-CONFIG.md` | ✅ | ❌ | Personal only |
| `USER-CONFIG.template.md` | ✅ | ✅ | Template for others |

---

## 🎯 Summary

```
personal branch  → Your daily workspace (LOCAL ONLY)
template branch   → Clean shareable version (GitHub)
master branch     → Same as template (public)
```

**Remember:**
- Work on `personal` for your stuff
- Copy improvements to `template` to share
- Never push `personal` to public GitHub
- Keep `template` clean for others

---

**Owner:** Maxim Tsitolovsky  
**Setup Date:** 2025
