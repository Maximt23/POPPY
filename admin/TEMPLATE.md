# POPPY Template System

## The POPPY vs Projects Separation

When users clone POPPY, they get **only the template** - not your projects.

### What Gets Cloned (Template)

```
code-puppy-POPPY/                 ← What others get when they clone
├── admin/                        ← POPPY admin console
│   ├── admin.js                  ← Main application
│   ├── lib/                      ← Core libraries
│   │   ├── engine-adapters/      ← Engine integrations
│   │   ├── marketplace.js      ← Agent marketplace
│   │   ├── api-manager.js      ← API key management
│   │   ├── skills.js            ← Skills system
│   │   ├── agent-communication.js ← Agent messaging
│   │   ├── project-templates.js  ← Project scaffolding
│   │   ├── metrics.js          ← Analytics (admin only)
│   │   └── config.js           ← Configuration
│   ├── bin/                      ← CLI entry point
│   ├── README.md                 ← User documentation
│   ├── MARKETPLACE.md            ← Marketplace docs
│   ├── ARCHITECTURE.md           ← Architecture docs
│   ├── SETUP_POPPY.cmd           ← Windows setup
│   ├── go.cmd                    ← Quick launcher
│   └── install.sh                ← Unix setup
├── agents/                       ← Example agents (shared)
│   └── README.md
├── templates/                    ← Project templates
│   └── *.json
├── LICENSE                       ← MIT License
└── .gitignore                    ← Excludes user data
```

### What DOESN'T Get Cloned (Your Private Data)

```
PersonalAI/                      ← NOT in git repo
├── P1/                          ← Your private projects
├── P2/                          ← Your private projects
├── shared-agents/              ← Your custom agents
├── shared-rules/               ← Your organization rules
├── memory/                      ← Your project memories
├── docs/                        ← Your documentation
├── admin/data/                  ← Your POPPY data
│   ├── daily-log.json
│   ├── projects.json
│   └── git-config.json
└── .env                         ← Your secrets
```

## Template vs Full Install

### For Users (Template Clone)

```bash
# User clones the template
git clone https://github.com/Maximt23/code-puppy-POPPY.git

# What they get:
# ✅ POPPY admin console
# ✅ Engine adapters
# ✅ Marketplace system
# ✅ Example agents
# ✅ Project templates

# What they DON'T get:
# ❌ Your projects (P1, P2, etc.)
# ❌ Your private agents
# ❌ Your API keys
# ❌ Your daily logs
# ❌ Your project data
```

### For You (Creator with Full Data)

```
PersonalAI/                      ← Your working directory
├── admin/                      ← Linked to git repo
│   └── (POPPY template files)
├── P1, P2, P3...              ← Your private projects
├── agents/                    ← Your agent library
└── data/                      ← Your POPPY data
```

## The .gitignore Strategy

Your root `.gitignore`:

```gitignore
# User projects (private)
P*/
projects/

# User data (private)
memory/
shared-agents/
shared-rules/
*.env
.env.*

# POPPY user data (private)
admin/data/
admin/.poppy/

# Dependencies
node_modules/

# Build outputs
dist/
build/

# IDE
.vscode/
.idea/
```

## Publishing New Versions

When you update POPPY:

```bash
# 1. Make changes to admin/
cd admin
# Edit files...

# 2. Commit (only admin/ goes to public repo)
git add admin/
git commit -m "feat: new feature"
git push

# 3. Tag a release
git tag v1.1.0
git push origin v1.1.0
```

## User Data Storage

Each user has their own `.poppy/` directory:

```
~/.poppy/                      ← User-specific (never shared)
├── config.json               ← User preferences
├── api-keys.enc              ← Encrypted API keys
├── installed-agents/         ← Downloaded agents
├── installed-skills/         ← Downloaded skills
├── my-agents/                ← User's custom agents
├── communication/            ← Agent messages
├── skills/                   ← User's skills
└── analytics/                ← Usage data
```

## The Clone Experience

### Step 1: User Clones Template

```bash
git clone https://github.com/Maximt23/code-puppy-POPPY.git my-poppy
cd my-poppy
```

### Step 2: User Sets Up POPPY

```bash
./SETUP_POPPY.cmd
# Installs dependencies
# Adds to PATH
# Creates ~/.poppy/ directory
```

### Step 3: User Launches POPPY

```bash
poppy
# Shows empty project list (they haven't created any)
# Shows marketplace with agents
# They install agents, create projects
```

### Step 4: User's Data Stays Local

```
~/.poppy/                     ← Their private data
├── Their API keys
├── Their installed agents
├── Their project list
└── Their usage metrics
```

## Admin Metrics (Creator Only)

As the creator, you get special access to:

```bash
poppy admin-metrics
```

Shows:
- Total agent downloads
- Popular agents
- Active users
- Engine usage stats
- Geographic distribution
- Revenue (if monetized)

## Multi-User Architecture

```
┌─────────────────────────────────────────┐
│           GitHub Repository             │
│     (Public POPPY Template)             │
│  ┌─────────────────────────────────┐    │
│  │ admin/                          │    │
│  │ ├── Core POPPY code            │    │
│  │ └── Marketplace agents         │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
           ↓ Clone ↓ Clone ↓ Clone
    ┌──────┴─────────┐ ┌──────────────┐
    │   User A       │ │   User B     │
    │ ~/.poppy/      │ │ ~/.poppy/    │
    │ - Their keys   │ │ - Their keys │
    │ - Their agents │ │ - Their data │
    │ - Their projects│ │ - Their proj │
    └────────────────┘ └──────────────┘
           ↓
    ┌──────────────┐
    │   You        │
    │ (Creator)    │
    │ View metrics │
    │ for all users│
    └──────────────┘
```

## Creating Project Templates

Templates are part of the public repo:

```javascript
// In lib/project-templates.js
export const ProjectTemplates = {
  'react-web': {
    name: 'React Web App',
    folders: [
      'src/',
      'src/components/',
      'src/hooks/',
      'tests/',
      'docs/'
    ],
    files: {
      'README.md': '...',
      '.gitignore': '...'
    },
    // These agents are suggested, not included
    recommendedAgents: ['react-expert', 'frontend-architect'],
    recommendedSkills: ['react-patterns', 'typescript']
  }
};
```

## Security Best Practices

1. **Never commit user data** - Use .gitignore
2. **Encrypt API keys** - Always use encryption
3. **Sanitize before share** - Remove keys from agents
4. **Separate concerns** - Template vs data
5. **Audit releases** - Check what's in the repo

## The Clone Command

What users run:

```bash
# 1. Clone (gets template only)
git clone https://github.com/Maximt23/code-puppy-POPPY.git

# 2. Setup (creates their own data)
cd code-puppy-POPPY
./SETUP_POPPY.cmd

# 3. Launch (their own instance)
poppy
```

What they have:
- ✅ Working POPPY admin
- ✅ Marketplace access
- ✅ Their own projects
- ✅ Their own API keys
- ✅ Their own data

What they don't have:
- ❌ Your projects
- ❌ Your keys
- ❌ Your private data

## Summary

**Template (Public)**: The POPPY system + Marketplace
**User Data (Private)**: Their projects, keys, agents
**Creator Access**: Metrics on all users

This creates a **platform** where:
1. You maintain the core POPPY system
2. Users get their own isolated instance
3. Community shares agents via marketplace
4. You get usage analytics
5. Everyone's private data stays private
