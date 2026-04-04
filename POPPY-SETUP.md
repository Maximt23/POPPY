# 🐶 POPPY Setup Guide

## Quick Start

### Step 1: Setup Global Commands
```powershell
cd C:\Users\maxim\PersonalAI\admin
.\setup-global-commands.cmd
```

**Then restart your terminal/PowerShell**

---

## Using POPPY

### From Anywhere (after setup):
```powershell
# Production version - no Creator Dashboard
poppy

# Creator version - has Creator Dashboard  
poppy-maxim
```

### From Admin Folder (immediate, no setup needed):
```powershell
cd C:\Users\maxim\PersonalAI\admin

# Production
.\poppy

# Creator
.\poppy-maxim
```

---

## What's the Difference?

| Command | Shows in System Menu | For |
|---------|---------------------|-----|
| `poppy` | 📊 Analytics, ← Back | General users |
| `poppy-maxim` | 📊 Analytics, 👑 Creator Dashboard, ← Back | Maxim only |

---

## Troubleshooting

### "poppy not recognized"
Run the setup script again:
```powershell
cd C:\Users\maxim\PersonalAI\admin
.\setup-global-commands.cmd
```
Then **restart your terminal**.

### Still not working?
Add manually to PATH:
1. Windows Key + Search "Environment Variables"
2. Click "Edit the system environment variables"
3. Click "Environment Variables" button
4. Under "User variables", find "Path" → Edit
5. Add new entry: `C:\Users\maxim\PersonalAI\admin`
6. OK → OK → Restart terminal

---

**That's it! Now you can type `poppy` or `poppy-maxim` from any folder!** 🐶👑
