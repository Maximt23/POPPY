# 🤖 Shared Agents

This folder contains agent configurations that can be shared across all projects in the monorepo.

Each agent is stored as a separate JSON file for easy tracking and version control.

## Structure

```
agents/
├── README.md
├── agent-{id}.json       # Individual agent configs
├── agent-{id}.json
└── ...
```

## Agent Schema

```json
{
  "id": "agent-{timestamp}",
  "name": "Agent Name",
  "description": "What this agent does",
  "projects": ["all"] | ["p1", "p2"],
  "shared": true,
  "settings": {},
  "createdAt": "ISO timestamp",
  "lastUsed": "ISO timestamp | null",
  "usageCount": 0
}
```

## Usage

Agents in this folder are automatically available to all projects via the Admin Console.

---
*Part of the Code-Puppy Monorepo*
