# 🛒 POPPY Agent Marketplace

**The NPM of AI Agents**

POPPY isn't just a project manager - it's a **community-driven marketplace** where developers can share, discover, and install AI agents without exposing API keys.

## 🌟 Vision

Imagine having access to **hundreds of specialized AI agents**:
- React experts
- Database architects
- Security auditors
- Performance optimizers
- Documentation writers
- Test generators
- And thousands more...

**All without sharing your API keys.**

## 🔐 Security First

### What Gets Shared
- ✅ Agent behavior and instructions
- ✅ System prompts
- ✅ Knowledge patterns
- ✅ Configuration schemas
- ✅ Author attribution
- ✅ Ratings and reviews

### What NEVER Gets Shared
- ❌ API keys
- ❌ Tokens
- ❌ Credentials
- ❌ Personal project data
- ❌ Private repositories

**Your keys stay on your machine, encrypted.**

## 📦 Agent Structure

```json
{
  "id": "react-expert-v2",
  "name": "React Expert",
  "description": "Specialized in React, hooks, and modern patterns",
  "author": "@sarah_dev",
  "version": "2.1.0",
  "category": "development",
  "tags": ["react", "javascript", "frontend", "hooks"],
  "compatibleEngines": ["code-puppy", "code-ex", "cursor", "claude-code"],
  "requiresApiKey": true,
  "recommendedProvider": "anthropic",
  "recommendedModel": "claude-3-5-sonnet",
  "systemPrompt": "You are a React expert...",
  "instructions": [
    "Use functional components",
    "Prefer hooks over classes",
    "Follow React best practices"
  ],
  "behavior": {
    "style": "concise",
    "expertise": ["react", "javascript", "typescript"],
    "avoids": ["class components", "outdated patterns"]
  },
  "rating": 4.8,
  "downloads": 15420,
  "reviews": [...]
}
```

## 🚀 Getting Started

### 1. Install POPPY
```bash
git clone https://github.com/Maximt23/code-puppy-POPPY.git
./SETUP_POPPY.cmd  # Windows
./install.sh         # Mac/Linux
```

### 2. Configure Your API Keys (Locally)
```bash
poppy api add openai
poppy api add anthropic
poppy api add groq
```

### 3. Browse the Marketplace
```bash
poppy marketplace
```

### 4. Install an Agent
```bash
poppy install react-expert
poppy install security-auditor
poppy install database-architect
```

### 5. Use the Agent
```bash
poppy agent react-expert
# Or select from menu: poppy → Quick Agent Mode
```

## 🏪 Marketplace Features

### Browse & Search
- **Categories**: Development, Security, Testing, Architecture, etc.
- **Search**: Find agents by name, description, or tags
- **Filters**: Compatible engine, rating, downloads
- **Trending**: See what's popular this week

### Agent Details
- ⭐ Rating & reviews
- 📊 Download count
- 🏷️ Tags & categories
- 🔌 Compatible engines
- 💡 Recommended model
- 👤 Author profile
- 📜 Version history

### Publishing Your Own Agent
```bash
# 1. Create your agent locally
poppy agent create my-custom-agent

# 2. Edit the agent definition
# ~/.poppy/my-agents/my-custom-agent.json

# 3. Publish to marketplace (creates PR)
poppy publish my-custom-agent
```

## 🎯 Use Cases

### Team Standardization
Share standardized agents across your team:
```bash
# Lead developer creates company standards agent
poppy publish company-standards --org

# Team members install
poppy install company-standards --org acme-corp
```

### Specialized Workflows
```bash
# Frontend workflow
poppy install react-expert
poppy install css-architect
poppy install accessibility-reviewer

# Backend workflow
poppy install nodejs-expert
poppy install database-architect
poppy install api-designer

# DevOps workflow
poppy install docker-expert
poppy install ci-cd-architect
```

### Multi-Model Strategies
```bash
# Quick tasks - use fast/cheap model
poppy config groq set-default llama-3-70b

# Complex architecture - use smart model
poppy config anthropic set-default claude-3-opus

# Image generation
poppy config openai set-default gpt-4o
```

## 🔧 API Key Management

### Add Keys Securely
```bash
# Interactive prompt (secure, hidden input)
poppy api add openai

# Or pass directly (not recommended)
poppy api add openai sk-xxx --model gpt-4
```

### List Configured Keys (Masked)
```bash
poppy api list
# Output:
# openai: sk-****xxxx (GPT-4)
# anthropic: sk-ant****yyyy (Claude 3.5)
```

### Test Keys
```bash
poppy api test openai
# ✅ Key valid. 47 models available.
```

### Set Default Models
```bash
poppy api set-model openai gpt-4-turbo
poppy api set-model anthropic claude-3-5-sonnet
```

## 🌐 Public Registry

The POPPY registry is a GitHub repository where all public agents live:

**Registry URL**: `https://github.com/Maximt23/poppy-registry`

### How Publishing Works
1. You run `poppy publish my-agent`
2. POPPY creates a JSON file with your agent (no API keys)
3. POPPY opens a Pull Request to the registry
4. Community reviews your agent
5. Once merged, everyone can install it

### Registry Structure
```
poppy-registry/
├── agents/
│   ├── react-expert.json
│   ├── security-auditor.json
│   └── ...
├── categories.json
└── README.md
```

## 🏷️ Agent Categories

- **💻 Development**: Code writing, refactoring, review
- **🐛 Debugging**: Error analysis, troubleshooting
- **📚 Documentation**: README, comments, docs
- **🧪 Testing**: Test generation, QA
- **🏗️ Architecture**: System design, patterns
- **🔀 Git & DevOps**: CI/CD, deployment
- **👀 Code Review**: PR review, standards
- **📋 Product**: PM, user stories
- **🎨 UI/UX**: Design, accessibility
- **🗄️ Database**: Schema, queries, optimization
- **🔒 Security**: Auditing, best practices
- **⚡ Performance**: Optimization, profiling
- **🔧 General**: Utilities, helpers

## 💰 Monetization (Future)

Premium agents could be:
- **Free**: Community-created agents
- **Paid**: Expert-crafted specialized agents
- **Subscription**: Access to premium agent library
- **Enterprise**: Custom agents for organizations

**Revenue share with agent creators.**

## 🤝 Contributing Agents

### Best Practices
1. **Clear Description**: What does this agent do?
2. **Specific Instructions**: Detailed system prompts
3. **Tested Behavior**: Verify it works as expected
4. **Version Control**: Update with improvements
5. **Documentation**: Usage examples, limitations

### Quality Guidelines
- Agents should have a clear, single purpose
- Instructions should be specific and actionable
- Should work consistently across supported engines
- Include examples in the agent definition
- Respond well to the intended use cases

## 📊 Analytics

For agent creators:
- Download counts
- Usage statistics
- Rating trends
- Popular engine combinations
- Most-used instructions

## 🔮 Future Features

- **Agent Chaining**: Combine multiple agents
- **Auto-Improvement**: Agents learn from usage
- **A/B Testing**: Test agent variations
- **Custom Training**: Fine-tune agents on your codebase
- **Agent SDK**: Build agents programmatically
- **Team Workspaces**: Shared team agent libraries

## 🛡️ Privacy & Security

### Your Data Stays Yours
- Agents run locally on your machine
- API keys are encrypted with machine-specific keys
- Project data never leaves your computer
- No telemetry or tracking
- Open source, auditable code

### Agent Verification
- Community reviews for public agents
- Digital signatures for verified authors
- Sandbox testing for new agents
- Report system for malicious agents

---

**POPPY Marketplace** - Share expertise, not credentials.

Join the community: https://github.com/Maximt23/code-puppy-POPPY
