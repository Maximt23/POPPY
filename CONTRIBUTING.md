# 🤝 Contributing to POPPY

## Development Setup

POPPY uses a **dual-repo system**:
- **POPPY** (public) - Template for users
- **POPPY-MAXIM** (private) - Creator's workspace

## Workflow

```
PersonalAI/ (your local workspace)
├── .git/ (tracks both remotes)
├── P1/                    # Private project
├── P2/                    # Private project
├── admin/                 # POPPY system
└── agents/               # Shared agents
```

## Committing Changes

```bash
# Work in PersonalAI/
cd C:\Users\maxim\PersonalAI

# Make changes
# ...

# Commit and push to BOTH repos
git add .
git commit -m "feat: your change"
git push origin main    # Private repo
git push public main    # Public repo
```

## Repo Differences

| Files | POPPY (Public) | POPPY-MAXIM (Private) |
|-------|---------------|----------------------|
| `P1/`, `P2/` | ❌ Excluded | ✅ Included |
| `.creator` | ❌ No | ✅ Yes (marks creator) |
| Password | ❌ No | ✅ Yes (creator version) |

## Release Process

1. Test locally: `node admin/admin.js`
2. Update CHANGELOG.md
3. Commit with conventional format: `feat:`, `fix:`, `docs:`
4. Push to both remotes
5. Tag release: `git tag v1.x.x`

---

Questions? Open an issue on GitHub.
