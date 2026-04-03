/**
 * POPPY Project Templates with Subfolder Support
 * 
 * Define project structures with nested folders.
 * Templates are shareable and customizable.
 */

import fs from 'fs/promises';
import path from 'path';

/**
 * Project Template Structure
 */
export const ProjectTemplates = {
  'react-web': {
    name: 'React Web App',
    description: 'Modern React application with best practices',
    folders: [
      'src/',
      'src/components/',
      'src/components/ui/',
      'src/components/layout/',
      'src/hooks/',
      'src/contexts/',
      'src/services/',
      'src/utils/',
      'src/styles/',
      'src/assets/',
      'src/types/',
      'public/',
      'tests/',
      'tests/unit/',
      'tests/integration/',
      'docs/',
      'scripts/',
      '.github/workflows/'
    ],
    files: {
      'README.md': `# {{projectName}}

{{description}}

## Structure

\`\`\`
src/
├── components/     # React components
│   ├── ui/        # Reusable UI components
│   └── layout/    # Layout components
├── hooks/         # Custom React hooks
├── contexts/      # React contexts
├── services/      # API services
├── utils/         # Utility functions
├── styles/        # Global styles
├── assets/        # Static assets
└── types/         # TypeScript types
\`\`\`

## Getting Started

\`\`\`bash
npm install
npm start
\`\`\`
`,
      '.gitignore': `node_modules/
dist/
build/
.env
.env.local
.DS_Store
*.log
coverage/
.idea/
.vscode/
`,
      'src/components/ui/README.md': '# UI Components\n\nReusable, composable UI components.\n'
    },
    recommendedAgents: ['react-expert', 'frontend-architect'],
    recommendedSkills: ['react-patterns', 'typescript', 'testing']
  },

  'node-api': {
    name: 'Node.js API',
    description: 'RESTful API with Express and best practices',
    folders: [
      'src/',
      'src/routes/',
      'src/controllers/',
      'src/models/',
      'src/middleware/',
      'src/services/',
      'src/utils/',
      'src/config/',
      'src/types/',
      'tests/',
      'tests/unit/',
      'tests/integration/',
      'tests/e2e/',
      'scripts/',
      'docs/',
      'logs/',
      '.github/workflows/'
    ],
    files: {
      'README.md': `# {{projectName}}

{{description}}

## API Structure

\`\`\`
src/
├── routes/        # API route definitions
├── controllers/   # Request handlers
├── models/        # Data models
├── middleware/    # Express middleware
├── services/      # Business logic
├── utils/         # Utilities
└── config/        # Configuration
\`\`\`
`,
      '.gitignore': `node_modules/
.env
.env.*
dist/
build/
*.log
logs/
coverage/
.DS_Store
`,
      'src/routes/README.md': '# Routes\n\nAPI endpoint definitions.\n'
    },
    recommendedAgents: ['backend-expert', 'api-designer'],
    recommendedSkills: ['node-patterns', 'api-design', 'security']
  },

  'react-native': {
    name: 'React Native App',
    description: 'Mobile app with React Native',
    folders: [
      'src/',
      'src/components/',
      'src/components/ui/',
      'src/components/screens/',
      'src/components/navigation/',
      'src/hooks/',
      'src/contexts/',
      'src/services/',
      'src/utils/',
      'src/assets/',
      'src/assets/images/',
      'src/assets/fonts/',
      'src/constants/',
      'src/types/',
      'tests/',
      'tests/unit/',
      'tests/e2e/',
      'docs/',
      'android/',
      'ios/',
      'scripts/'
    ],
    files: {
      'README.md': `# {{projectName}}

{{description}}

## Mobile App Structure

\`\`\`
src/
├── components/
│   ├── ui/           # Reusable UI
│   ├── screens/      # Screen components
│   └── navigation/   # Navigation
├── hooks/
├── services/         # API & storage
├── assets/
└── constants/        # App constants
\`\`\`
`,
      '.gitignore': `node_modules/
.env
.env.*
.DS_Store
*.log
android/build/
ios/build/
ios/Pods/
*.xcworkspace
*.xcodeproj/xcuserdata/
*.xcuserdatad/
.expo/
`.expo-shared/`
    },
    recommendedAgents: ['mobile-expert', 'react-native-pro'],
    recommendedSkills: ['mobile-patterns', 'navigation', 'performance']
  },

  'python-api': {
    name: 'Python API',
    description: 'FastAPI or Flask REST API',
    folders: [
      'app/',
      'app/api/',
      'app/api/v1/',
      'app/api/v1/endpoints/',
      'app/core/',
      'app/models/',
      'app/schemas/',
      'app/services/',
      'app/utils/',
      'app/db/',
      'tests/',
      'tests/unit/',
      'tests/integration/',
      'scripts/',
      'docs/',
      'logs/',
      '.github/workflows/'
    ],
    files: {
      'README.md': `# {{projectName}}

{{description}}

## Python API Structure

\`\`\`
app/
├── api/
│   └── v1/
│       └── endpoints/    # API routes
├── core/                  # Core config
├── models/                # DB models
├── schemas/               # Pydantic schemas
├── services/              # Business logic
└── utils/                 # Utilities
\`\`\`
`,
      '.gitignore': `__pycache__/
*.py[cod]
*$py.class
*.so
.env
.venv
venv/
ENV/
dist/
build/
*.egg-info/
.pytest_cache/
.coverage
htmlcov/
*.log
`
    },
    recommendedAgents: ['python-expert', 'backend-architect'],
    recommendedSkills: ['python-patterns', 'fastapi', 'sqlalchemy']
  },

  'fullstack': {
    name: 'Full Stack App',
    description: 'Frontend + Backend + Database',
    folders: [
      'frontend/',
      'frontend/src/',
      'frontend/src/components/',
      'frontend/src/services/',
      'frontend/src/utils/',
      'frontend/public/',
      'backend/',
      'backend/src/',
      'backend/src/routes/',
      'backend/src/models/',
      'backend/src/services/',
      'shared/',
      'shared/types/',
      'shared/constants/',
      'database/',
      'database/migrations/',
      'database/seeds/',
      'docs/',
      'scripts/',
      'scripts/dev/',
      'scripts/deploy/',
      'tests/',
      'tests/e2e/',
      '.github/workflows/'
    ],
    files: {
      'README.md': `# {{projectName}}

{{description}}

## Full Stack Structure

\`\`\`
├── frontend/      # React/Vue/Angular app
├── backend/       # API server
├── shared/        # Shared code
├── database/      # DB migrations & seeds
├── docs/          # Documentation
└── scripts/       # Automation scripts
\`\`\`

## Development

\`\`\`bash
# Start everything
npm run dev:all

# Or separately
npm run dev:frontend
npm run dev:backend
\`\`\`
`,
      '.gitignore': `# Frontend
frontend/node_modules/
frontend/dist/
frontend/build/
frontend/.env

# Backend
backend/node_modules/
backend/dist/
backend/build/
backend/.env

# Database
database/*.db

# General
.env
.env.*
.DS_Store
*.log
node_modules/
`,
      'shared/README.md': '# Shared Code\n\nCode shared between frontend and backend:\n- TypeScript types\n- Constants\n- Utilities\n'
    },
    recommendedAgents: ['fullstack-expert', 'frontend-architect', 'backend-architect'],
    recommendedSkills: ['fullstack-patterns', 'api-integration', 'deployment']
  }
};

/**
 * Project Scaffolder
 */
export class ProjectScaffolder {
  constructor() {}

  /**
   * Scaffold a project from template
   */
  async scaffold(templateId, projectPath, variables = {}) {
    const template = ProjectTemplates[templateId];
    if (!template) {
      throw new Error(`Unknown template: ${templateId}`);
    }

    // Create all folders
    for (const folder of template.folders) {
      const folderPath = path.join(projectPath, folder);
      await fs.mkdir(folderPath, { recursive: true });
    }

    // Create all files with variable substitution
    for (const [filePath, content] of Object.entries(template.files)) {
      const fullPath = path.join(projectPath, filePath);
      
      // Ensure directory exists
      const dir = path.dirname(fullPath);
      await fs.mkdir(dir, { recursive: true });
      
      // Substitute variables
      let processedContent = content;
      for (const [key, value] of Object.entries(variables)) {
        processedContent = processedContent.replace(
          new RegExp(`{{${key}}}`, 'g'),
          value
        );
      }
      
      await fs.writeFile(fullPath, processedContent);
    }

    return {
      success: true,
      template: templateId,
      path: projectPath,
      foldersCreated: template.folders.length,
      filesCreated: Object.keys(template.files).length,
      recommendedAgents: template.recommendedAgents,
      recommendedSkills: template.recommendedSkills
    };
  }

  /**
   * Add custom subfolder to project
   */
  async addSubfolder(projectPath, folderPath, readme = '') {
    const fullPath = path.join(projectPath, folderPath);
    await fs.mkdir(fullPath, { recursive: true });
    
    if (readme) {
      await fs.writeFile(
        path.join(fullPath, 'README.md'),
        `# ${path.basename(folderPath)}\n\n${readme}\n`
      );
    }
    
    return { path: fullPath };
  }

  /**
   * Create custom template
   */
  async createTemplate(templateId, templateData) {
    // Save to user's templates
    const templatesDir = path.join(process.cwd(), '..', 'templates');
    await fs.mkdir(templatesDir, { recursive: true });
    
    const templatePath = path.join(templatesDir, `${templateId}.json`);
    await fs.writeFile(templatePath, JSON.stringify(templateData, null, 2));
    
    return { success: true, path: templatePath };
  }

  /**
   * List available templates
   */
  listTemplates() {
    return Object.entries(ProjectTemplates).map(([id, template]) => ({
      id,
      name: template.name,
      description: template.description,
      folders: template.folders.length,
      recommendedAgents: template.recommendedAgents,
      recommendedSkills: template.recommendedSkills
    }));
  }

  /**
   * Get template details
   */
  getTemplate(templateId) {
    return ProjectTemplates[templateId] || null;
  }
}

export default ProjectScaffolder;
