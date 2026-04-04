# Troubleshooting

## Installation Issues

### "poppy" command not found

**Windows:**
```powershell
# Restart terminal or run:
refreshenv
```

**Mac/Linux:**
```bash
source ~/.bashrc  # or ~/.zshrc
```

### Node.js not found

Install Node.js 18+ from [nodejs.org](https://nodejs.org)

## Runtime Issues

### Menu not displaying
```bash
# Reset POPPY config
rm ~/.poppy/config.json
poppy
```

### Projects not showing
```bash
# Check projects.json exists
cat ~/.poppy/projects.json
```

### API keys not saving
```bash
# Verify file permissions
ls -la ~/.poppy/
```

## Git Issues

### Push fails
```bash
# Check git config
git remote -v
```

## Password Issues (POPPY-MAXIM)

### Forgot password
```bash
# Reset (deletes all config)
rm ~/.poppy/config.json
# Run poppy-maxim to set new password
```

---

Still stuck? Open an issue on GitHub.
