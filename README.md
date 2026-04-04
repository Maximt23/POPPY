# 🐶 POPPY

**Universal AI Workspace Manager**

POPPY unifies your AI coding engines (Codex, Claude, Cursor), projects, agents, and workflows in one terminal-based interface.

```
┌─────────────────────────────────────────┐
│  🐶 POPPY Main Menu                     │
├─────────────────────────────────────────┤
│  ▶ Launch AI Engine                     │
│  ➕ New Project                          │
│  📁 Projects → 📁 My Projects            │
│  🤖 Agents  → 📁 My Agents               │
│  🎯 Skills  → 📁 My Skills               │
│  💬 Prompts                              │
│  🔐 API Keys                             │
│  🔀 Git                                  │
│  ⚙️  System                               │
└─────────────────────────────────────────┘
```

## 🚀 Quick Start

**Windows:**
```powershell
git clone https://github.com/Maximt23/POPPY.git
cd POPPY\admin
.\install.cmd
```

**Mac/Linux:**
```bash
git clone https://github.com/Maximt23/POPPY.git
cd POPPY/admin
chmod +x install.sh && ./install.sh
```

**Launch:**
```bash
poppy
```

## 📂 Architecture

```
POPPY (Management Layer)
    │
    ├── Projects → Agents → Skills → Prompts
    │
    ├── Engine Manager (detects & launches)
    │       ├── Codex (OpenAI)
    │       ├── Claude (Anthropic)
    │       └── Cursor (Editor)
    │
    └── Data Storage (~/.poppy/)
            ├── config.json
            ├── projects.json
            └── api-keys.enc
```

## 🛠️ Commands

| Command | Description |
|---------|-------------|
| `poppy` | Launch interactive menu |
| `poppy --version` | Show version |
| `poppy --help` | Show help |

## 📁 Project Structure

```
POPPY/
├── README.md           # This file
├── LICENSE             # MIT License
├── admin/              # Core system
│   ├── admin.js       # Main entry
│   ├── install.cmd    # Windows installer
│   ├── install.sh     # Mac/Linux installer
│   ├── lib/           # System libraries
│   └── README.md      # Admin docs
├── agents/            # Agent configurations
├── docs/              # Documentation
└── templates/         # Project templates
```

## 🔐 Security

- API keys encrypted with AES-256
- Local-only data storage
- No cloud dependencies

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development workflow.

## 📄 License

MIT License - See [LICENSE](LICENSE)

---

<p align="center">🐶 <strong>POPPY</strong> - Organize Your AI Workspace</p>
