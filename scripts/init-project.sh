#!/bin/bash
#
# Initialize a new project from the multi-agent-orchestration template.
# Usage: ./scripts/init-project.sh "My Project Name"
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}  Multi-Agent Orchestration${NC}"
echo -e "${BLUE}  Project Initialization${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Get project name from argument or prompt
if [ -z "$1" ]; then
    read -p "Enter project name: " PROJECT_NAME
else
    PROJECT_NAME="$1"
fi

if [ -z "$PROJECT_NAME" ]; then
    echo -e "${RED}Error: Project name is required${NC}"
    exit 1
fi

# Generate slug from project name (lowercase, hyphens instead of spaces)
PROJECT_SLUG=$(echo "$PROJECT_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd '[:alnum:]-')

echo ""
echo -e "${YELLOW}Project Name:${NC} $PROJECT_NAME"
echo -e "${YELLOW}Project Slug:${NC} $PROJECT_SLUG"
echo ""

# Confirm
read -p "Continue with these settings? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

echo ""
echo -e "${GREEN}Step 1:${NC} Updating configuration files..."

# Update placeholders in files
find . -type f \( -name "*.md" -o -name "*.json" -o -name "*.ts" -o -name "*.sh" \) \
    -not -path "./node_modules/*" \
    -not -path "./.git/*" \
    -exec sed -i '' "s/\\\$PROJECT_NAME/$PROJECT_NAME/g" {} \; 2>/dev/null || \
find . -type f \( -name "*.md" -o -name "*.json" -o -name "*.ts" -o -name "*.sh" \) \
    -not -path "./node_modules/*" \
    -not -path "./.git/*" \
    -exec sed -i "s/\\\$PROJECT_NAME/$PROJECT_NAME/g" {} \;

find . -type f \( -name "*.md" -o -name "*.json" -o -name "*.ts" -o -name "*.sh" \) \
    -not -path "./node_modules/*" \
    -not -path "./.git/*" \
    -exec sed -i '' "s/\\\$PROJECT_SLUG/$PROJECT_SLUG/g" {} \; 2>/dev/null || \
find . -type f \( -name "*.md" -o -name "*.json" -o -name "*.ts" -o -name "*.sh" \) \
    -not -path "./node_modules/*" \
    -not -path "./.git/*" \
    -exec sed -i "s/\\\$PROJECT_SLUG/$PROJECT_SLUG/g" {} \;

echo -e "  ${GREEN}✓${NC} Updated placeholders"

echo ""
echo -e "${GREEN}Step 2:${NC} Setting up configuration files..."

# Copy template files to actual files
if [ -f ".claude/settings.local.json.template" ]; then
    cp .claude/settings.local.json.template .claude/settings.local.json
    echo -e "  ${GREEN}✓${NC} Created .claude/settings.local.json"
fi

if [ -f "CLAUDE.local.md.template" ]; then
    cp CLAUDE.local.md.template CLAUDE.local.md
    echo -e "  ${GREEN}✓${NC} Created CLAUDE.local.md"
fi

echo ""
echo -e "${GREEN}Step 2b:${NC} Creating project profile..."

# Copy project profile template
if [ -f "docs/project-profile.md.template" ]; then
    cp docs/project-profile.md.template docs/project-profile.md
    echo -e "  ${GREEN}✓${NC} Created docs/project-profile.md (customize during /setup-project)"
else
    echo -e "  ${YELLOW}⚠${NC} project-profile.md.template not found, skipping"
fi

# Create .env from example if it doesn't exist
if [ -f ".env.example" ] && [ ! -f ".env" ]; then
    cp .env.example .env
    # Update with project settings
    sed -i '' "s/PROJECT_NAME=.*/PROJECT_NAME=$PROJECT_NAME/" .env 2>/dev/null || \
    sed -i "s/PROJECT_NAME=.*/PROJECT_NAME=$PROJECT_NAME/" .env
    sed -i '' "s/PROJECT_SLUG=.*/PROJECT_SLUG=$PROJECT_SLUG/" .env 2>/dev/null || \
    sed -i "s/PROJECT_SLUG=.*/PROJECT_SLUG=$PROJECT_SLUG/" .env
    echo -e "  ${GREEN}✓${NC} Created .env (remember to add your OPENAI_API_KEY)"
fi

echo ""
echo -e "${GREEN}Step 3:${NC} Installing dependencies..."

# Install npm dependencies
if command -v npm &> /dev/null; then
    npm install
    echo -e "  ${GREEN}✓${NC} Dependencies installed"
else
    echo -e "  ${YELLOW}⚠${NC} npm not found, skipping dependency installation"
fi

echo ""
echo -e "${GREEN}Step 4:${NC} Creating VectorDB directory..."

# Create VectorDB directory
VECTORDB_DIR="$HOME/.$PROJECT_SLUG/context/lancedb"
mkdir -p "$VECTORDB_DIR"
echo -e "  ${GREEN}✓${NC} Created $VECTORDB_DIR"

echo ""
echo -e "${GREEN}Step 5:${NC} Initializing git (if not already initialized)..."

# Initialize git if not already
if [ ! -d ".git" ]; then
    git init
    echo -e "  ${GREEN}✓${NC} Git repository initialized"
else
    echo -e "  ${YELLOW}⚠${NC} Git already initialized, skipping"
fi

echo ""
echo -e "${BLUE}================================${NC}"
echo -e "${GREEN}  Initialization Complete!${NC}"
echo -e "${BLUE}================================${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo ""
echo "1. Add your OpenAI API key to .env:"
echo -e "   ${BLUE}OPENAI_API_KEY=sk-...${NC}"
echo ""
echo "2. Run /setup-project to configure your project profile"
echo "   This will ask about your tech stack and customize rules"
echo ""
echo "3. Define your tasks in todo/tasks.md"
echo ""
echo "4. Seed the VectorDB with your context:"
echo -e "   ${BLUE}npm run seed-context${NC}"
echo ""
echo "5. Start Claude Code and use the commands:"
echo -e "   ${BLUE}/develop <section>${NC} - Develop features"
echo -e "   ${BLUE}/qa <section>${NC} - Run QA review"
echo -e "   ${BLUE}/journal${NC} - Record session notes"
echo -e "   ${BLUE}/sync${NC} - Sync with git remote"
echo ""
echo "6. For up-to-date library docs, include 'use context7' in prompts"
echo ""
