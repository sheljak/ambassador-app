#!/bin/bash

# =============================================================================
# git-push.sh - Commit and push local changes to remote
# =============================================================================
# This script stages all changes, commits with a timestamped message,
# and pushes to the remote repository.
#
# Usage: ./git-push.sh [branch_name]
# Example: ./git-push.sh main
#          ./git-push.sh develop
# =============================================================================

set -e  # Exit immediately if a command exits with a non-zero status

# -----------------------------------------------------------------------------
# Configuration
# -----------------------------------------------------------------------------
BRANCH="${1:-main}"  # Use first argument or default to 'main'
REMOTE="origin"
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
COMMIT_MESSAGE="Auto-commit: ${TIMESTAMP}"

# Default Git user config (used if not already set)
DEFAULT_GIT_USER="Replit User"
DEFAULT_GIT_EMAIL="replit@users.noreply.github.com"

# -----------------------------------------------------------------------------
# Color codes for console output
# -----------------------------------------------------------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# -----------------------------------------------------------------------------
# Helper functions
# -----------------------------------------------------------------------------
print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# -----------------------------------------------------------------------------
# Main script
# -----------------------------------------------------------------------------
echo ""
echo "=============================================="
echo "  Git Push - Commit and Push Changes"
echo "=============================================="
echo ""

print_step "Target branch: ${BRANCH}"
print_step "Remote: ${REMOTE}"
echo ""

# Step 1: Configure Git user if not set
print_step "Checking Git user configuration..."

if [ -z "$(git config user.name)" ]; then
    print_warning "Git user.name not set. Setting to: ${DEFAULT_GIT_USER}"
    git config user.name "${DEFAULT_GIT_USER}"
fi

if [ -z "$(git config user.email)" ]; then
    print_warning "Git user.email not set. Setting to: ${DEFAULT_GIT_EMAIL}"
    git config user.email "${DEFAULT_GIT_EMAIL}"
fi

print_success "Git user: $(git config user.name) <$(git config user.email)>"

# Step 2: Check if there are any changes to commit
print_step "Checking for changes..."
if git diff --quiet && git diff --cached --quiet && [ -z "$(git ls-files --others --exclude-standard)" ]; then
    print_warning "No changes to commit. Repository is clean."
    echo ""
    exit 0
fi

# Step 3: Show what will be committed
print_step "Changes to be committed:"
git status --short
echo ""

# Step 4: Stage all changes
print_step "Staging all changes..."
if git add -A; then
    print_success "All changes staged"
else
    print_error "Failed to stage changes"
    exit 1
fi

# Step 5: Commit with timestamped message
print_step "Committing changes with message: '${COMMIT_MESSAGE}'"
if git commit -m "${COMMIT_MESSAGE}"; then
    print_success "Changes committed"
else
    print_error "Failed to commit changes"
    exit 1
fi

# Step 6: Push to remote
print_step "Pushing to ${REMOTE}/${BRANCH}..."
if git push "${REMOTE}" "${BRANCH}"; then
    print_success "Changes pushed to ${REMOTE}/${BRANCH}"
else
    print_warning "Push failed. Trying to set upstream..."
    if git push -u "${REMOTE}" "${BRANCH}"; then
        print_success "Changes pushed to ${REMOTE}/${BRANCH} (upstream set)"
    else
        print_error "Failed to push changes"
        exit 1
    fi
fi

# Step 7: Show latest commit
echo ""
print_step "Latest commit:"
git log --oneline -1
echo ""

print_success "All changes have been pushed to ${REMOTE}/${BRANCH}"
echo ""
