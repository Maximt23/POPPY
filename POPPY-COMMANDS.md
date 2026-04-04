# 🐶 POPPY Command Guide

## Quick Reference

| Command | Purpose | Creator Dashboard |
|---------|---------|-------------------|
| `poppy` | Production version for general users | ❌ No |
| `poppy-maxim` | 👑 Creator version for Maxim | ✅ Yes |

---

## 🐶 `poppy` - Production Version

**For:** General users, public version  
**Features:**
- 📊 Personal Analytics
- 📁 Project Management
- 🤖 Agent Management
- 🎯 Skills
- 🔐 API Keys
- 🔀 Git Integration

**Usage:**
```bash
cd C:\Users\maxim\PersonalAI
poppy
# Then: System → 📊 Analytics
```

---

## 👑 `poppy-maxim` - Creator Version

**For:** Maxim only (that's you!)  
**Features:**
- ✅ Everything in `poppy` PLUS:
- 👑 **Creator Dashboard** - Global analytics, revenue tracking, feature adoption
- 📈 User statistics across all POPPY installations
- 💰 Revenue metrics
- 🚀 Feature popularity tracking

**Usage:**
```bash
cd C:\Users\maxim\PersonalAI
poppy-maxim
# Then: System → 👑 Creator Dashboard
```

---

## 🔧 How It Works

The `poppy-maxim.cmd` file sets an environment variable:
```batch
set POPPY_MODE=creator
```

Then `admin.js` checks this in `isCreatorVersion()`:
```javascript
if (process.env.POPPY_MODE === 'creator') {
  return true;  // Show Creator Dashboard
}
```

---

## 📝 Marcus Notes

- Marcus: The production version (`poppy`) keeps things clean for users
- Marcus: The creator version (`poppy-maxim`) gives you the full power
- Both versions share the same codebase - just different entry points
- Creator Dashboard shows aggregated data from telemetry

---

## 🚀 Test It Now!

1. **Test production version:**
   ```bash
   poppy
   # Should NOT see "👑 Creator Dashboard" in System menu
   ```

2. **Test creator version:**
   ```bash
   poppy-maxim
   # SHOULD see "👑 Creator Dashboard" in System menu
   # Select it and enjoy your creator analytics!
   ```

---

**Both commands are now ready to use!** 🐶👑
