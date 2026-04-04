# POPPY API Reference

## CLI Commands

```bash
poppy [options]
```

### Options

| Option | Description |
|--------|-------------|
| `--help`, `-h` | Show help message |
| `--version`, `-v` | Show version |
| (none) | Start interactive menu |

## Menu System

### Main Menu Categories

- **▶ Launch AI Engine** - Start Codex, Claude, or Cursor with context
- **➕ New Project** - Create project wizard
- **📁 Projects** - Manage all projects
- **🤖 Agents** - Manage AI agents
- **🎯 Skills** - Manage reusable skills
- **💬 Prompts** - Manage prompts
- **🔐 API Keys** - Secure key management
- **🔀 Git** - Git operations
- **⚙️ System** - Settings and analytics

### Data Flow

```
User Input → Menu Handler → Entity Manager → File System
```

## Configuration Files

### ~/.poppy/config.json

```json
{
  "engine": "code-puppy",
  "paths": {
    "projects": "~/Projects",
    "agents": "~/.poppy/agents"
  },
  "features": {
    "dailyLog": true,
    "gitIntegration": true
  }
}
```

### ~/.poppy/projects.json

```json
{
  "projects": [
    {
      "id": "uuid",
      "name": "Project Name",
      "path": "P1/",
      "type": "react-native",
      "created": "2025-01-01"
    }
  ]
}
```
