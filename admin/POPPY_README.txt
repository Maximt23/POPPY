POPPY - Code-Puppy Project Admin
=================================

POPPY is the admin console for managing Code-Puppy projects and agents.
It tracks changes, manages your monorepo, and keeps everything organized.

FEATURES
--------
- Project Management: Create, track, and launch projects
- Agent Inventory: Manage all your Code-Puppy agents
- Git Integration: See repo changes, commit, and sync
- Daily Focus: Set and track daily objectives
- Monorepo Support: Works across all your projects

SETUP
-----
1. RUN SETUP (one time only):
   .\setup.cmd
   
   This adds the admin folder to your system PATH.

2. RESTART YOUR TERMINAL:
   Close VS Code terminal or CMD, then reopen it.

3. NOW YOU CAN RUN POPPY FROM ANYWHERE:
   poppy              - Launch the admin console
   poppy --help       - Show help
   poppy --version    - Show version


COMMANDS
--------
In the interactive menu:
- Start New Project     : Scaffold a new Code-Puppy project
- Quick Agent Mode      : Work with agents directly
- Set Today's Focus     : Track daily objectives
- View Today's Log      : See what you worked on
- Manage Projects       : List and manage all projects
- Quick Launch Project  : Open a project in your editor
- View All Agents       : Browse your agent inventory
- Add New Agent         : Create a new agent
- Share Agent           : Export agents for sharing
- Commit Changes        : Commit monorepo changes to Git
- View Git Status       : See all pending changes
- System Settings       : Configure POPPY


GIT INTEGRATION
---------------
POPPY tracks all changes in your Code-Puppy monorepo:
- Shows modified files
- Shows untracked files
- Quick commit with meaningful messages
- Syncs with GitHub


QUICK START
-----------
After setup, just type:

   poppy

The admin console will show your current git status and available actions.


  ██████╗  ██████╗ ██████╗ ██████╗ ██╗   ██╗
  ██╔══██╗██╔═══██╗██╔══██╗██╔══██╗██║   ██║
  ██████╔╝██║   ██║██████╔╝██████╔╝╚██████╔╝
  ██╔═══╝ ██║   ██║██╔═══╝ ██╔═══╝  ╚═══██║
  ██║     ╚██████╔╝██║     ██║         ██║
  ╚═╝      ╚══════╝╚═╝     ╚═╝         ╚═╝

Code-Puppy Project Management Admin
