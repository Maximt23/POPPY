# 🔄 Dual Repository Setup Guide

## 🎯 Goal

Set up two separate repositories:
1. **`POPPY`** - Public, naked template for users
2. **`POPPY-MAXIM`** - Private, creator version with analytics

---

## 📋 Prerequisites

- GitHub account (Maximt23)
- Git installed locally
- Personal data already in current repo

---

## 🚀 Step-by-Step Setup

### PHASE 1: Prepare Current Repo (Naked Template)

```bash
cd C:\Users\maxim\PersonalAI

# Ensure we're on master
git checkout master

# Verify only template files are tracked
git ls-files | grep -E "(admin/data|projects/|\.env|USER-CONFIG\.md)" 
# Should return nothing (these are ignored)

# Check current remote
git remote -v
# Should show: origin https://github.com/Maximt23/code-puppy-POPPY.git
```

### PHASE 2: Create Public POPPY Repo

**Option A: Rename Current Repo (Recommended)**

1. Go to GitHub → Your Repositories → `code-puppy-POPPY`
2. Click **Settings** → **Repository name**
3. Rename to: `POPPY`
4. Click **Rename**

```bash
# Update local remote reference
git remote set-url origin https://github.com/Maximt23/POPPY.git

# Verify
git remote -v
# Should now show: origin https://github.com/Maximt23/POPPY.git
```

**Option B: Create New POPPY Repo**

1. Go to GitHub → New Repository
2. Name: `POPPY`
3. Visibility: **Public**
4. Description: "POPPY - Personal AI Workspace Organizer"
5. Don't initialize (we'll push existing)

```bash
# Update remote
git remote set-url origin https://github.com/Maximt23/POPPY.git
```

### PHASE 3: Push Clean Template to POPPY

```bash
cd C:\Users\maxim\PersonalAI

# Ensure on master (template branch)
git checkout master

# Double-check no personal files
git status

# Commit any pending changes
git add -A
git commit -m "template: clean POPPY v1.0 ready for public"

# Push to public POPPY repo
git push -u origin master

# Verify on GitHub
# Go to: https://github.com/Maximt23/POPPY
# Should see only template files, no personal data
```

### PHASE 4: Create Private POPPY-MAXIM Repo

1. Go to GitHub → New Repository
2. Name: `POPPY-MAXIM`
3. Visibility: **Private** ⚠️ IMPORTANT
4. Description: "POPPY Creator Version - Personal"
5. Don't initialize

### PHASE 5: Setup Local Personal Version

```bash
cd C:\Users\maxim

# Clone your personal repo (currently PersonalAI folder)
# We'll rename it to avoid confusion

# Option 1: Rename current folder
move PersonalAI POPPY-MAXIM

cd POPPY-MAXIM

# Add new remote for private repo
git remote add personal https://github.com/Maximt23/POPPY-MAXIM.git

# Create creator branch
git checkout -b main

# Add creator marker file (already done via script)
# .creator file should exist

# Ensure .creator is tracked in personal repo but NOT in public
git add .creator
git commit -m "creator: mark as creator version with analytics"

# Push to private repo
git push -u personal main

# Remove the old origin (public repo) from personal version
git remote remove origin

# Verify remotes
git remote -v
# Should only show: personal https://github.com/Maximt23/POPPY-MAXIM.git
```

### PHASE 6: Sync Workflow Setup

**For keeping POPPY (public) updated:**

```bash
# When you have improvements in POPPY-MAXIM to share:

# 1. In POPPY-MAXIM, commit improvements
git add -A
git commit -m "feat: improvements"

# 2. Clone POPPY public repo separately (for updates)
cd C:\Users\maxim
git clone https://github.com/Maximt23/POPPY.git POPPY-PUBLIC

cd POPPY-PUBLIC

# 3. Copy clean improvements from POPPY-MAXIM
cp ../POPPY-MAXIM/admin/admin.js admin/
cp ../POPPY-MAXIM/README.md .
# (Don't copy personal files!)

# 4. Test and commit
git add -A
git commit -m "feat: improvements from creator"
git push origin master

# 5. Clean up
cd ..
rmdir /s /q POPPY-PUBLIC
```

---

## 📁 Final Structure

### On Your Machine:

```
C:\Users\maxim\
├── POPPY-MAXIM\          ← Your private version (DAILY USE)
│   ├── .creator           ← Marks as creator version
│   ├── admin/
│   ├── projects/          ← Your private projects
│   ├── USER-CONFIG.md     ← Your personal info
│   ├── .env               ← Your API keys
│   └── .git → github.com/Maximt23/POPPY-MAXIM.git (PRIVATE)
│
└── (POPPY public cloned when needed for updates)
```

### On GitHub:

**Public: `github.com/Maximt23/POPPY`**
```
POPPY/
├── admin/              ← POPPY system code
├── agents/.gitkeep     ← Empty template
├── skills/.gitkeep     ← Empty template
├── prompts/.gitkeep    ← Empty template
├── projects/.gitkeep   ← Empty template
├── USER-CONFIG.template.md
├── README.md
├── DISTRIBUTION.md
├── .gitignore          ← Protects user data
└── (NO personal data, NO .creator file)
```

**Private: `github.com/Maximt23/POPPY-MAXIM`**
```
POPPY-MAXIM/
├── .creator            ← Creator marker
├── admin/             ← Same code + analytics
├── projects/            ← Your actual projects
├── USER-CONFIG.md      ← Your info
├── .env                ← Your API keys
├── global-analytics.json ← User data collection
└── (All your personal data)
```

---

## 🔒 Security Checklist

### POPPY (Public) - NEVER Contains:
- [ ] `.creator` file
- [ ] `admin/data/*` (except .gitkeep)
- [ ] `projects/*` (except .gitkeep)
- [ ] `.env`
- [ ] `USER-CONFIG.md`
- [ ] `global-analytics.json`
- [ ] Any personal API keys
- [ ] Any personal project files

### POPPY-MAXIM (Private) - Contains:
- [x] `.creator` file
- [x] All your personal data
- [x] Global analytics collection
- [x] API keys
- [x] Your projects

---

## 🔄 Daily Workflow

### Working on Your Personal Version:
```bash
cd C:\Users\maxim\POPPY-MAXIM
poppy
# ... work on your projects ...
git add -A
git commit -m "personal: updates"
git push personal main
```

### Sharing Improvements to Public POPPY:
```bash
# Manual copy of clean improvements
# See PHASE 6 above
```

---

## 🆘 Emergency: If You Accidentally Push Personal Data

### To POPPY (Public):
```bash
# IMMEDIATELY:
# 1. Delete the file from GitHub
git checkout master
git rm --cached <sensitive-file>
git commit -m "fix: remove sensitive data"
git push origin master --force

# 2. Clean GitHub history (if needed)
# Go to GitHub → Settings → Danger Zone → Delete repo
# Then recreate clean

# 3. Rotate exposed API keys immediately!
```

---

## ✅ Verification Steps

After setup, verify:

1. **POPPY Public:**
   ```bash
   git clone https://github.com/Maximt23/POPPY.git test-public
   cd test-public
   dir  # Should see NO personal files
   ```

2. **POPPY-MAXIM Private:**
   ```bash
   git clone https://github.com/Maximt23/POPPY-MAXIM.git test-private
   cd test-private
   dir  # Should see your personal files
   type .creator  # Should exist
   ```

3. **Analytics Works:**
   - Run `poppy` in POPPY-MAXIM
   - Go to System → 👑 Creator Dashboard
   - Should show creator analytics

---

## 📞 Need Help?

If stuck on any step:
1. Check `WORKFLOW.md` for detailed git commands
2. Check `QUICKSTART.md` for quick reference
3. Verify with `git status` before any push

---

**Owner:** Maxim Tsitolovsky  
**Setup Date:** 2025
