#!/bin/bash

# =============================================================================
# git-pull.sh - Fetch and reset local branch to match remote
# =============================================================================
# This script forcefully syncs your local repository with the remote,
# discarding ALL local changes (both staged and unstaged) and untracked files.
#
# Usage: ./git-pull.sh [branch_name]
# Example: ./git-pull.sh main
#          ./git-pull.sh develop
# =============================================================================

set -e  # Exit immediately if a command exits with a non-zero status

# -----------------------------------------------------------------------------
# Configuration
# -----------------------------------------------------------------------------
BRANCH="${1:-main}"  # Use first argument or default to 'main'
REMOTE="origin"

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
echo "  Git Pull - Force Sync with Remote"
echo "=============================================="
echo ""

print_step "Target branch: ${BRANCH}"
print_step "Remote: ${REMOTE}"
echo ""

# Step 1: Fetch latest changes from remote
print_step "Fetching latest changes from ${REMOTE}..."
if git fetch "${REMOTE}" "${BRANCH}"; then
    print_success "Fetched latest changes from ${REMOTE}/${BRANCH}"
else
    print_error "Failed to fetch from ${REMOTE}/${BRANCH}"
    exit 1
fi

# Step 2: Reset local branch to match remote (discards all local changes)
print_step "Resetting local branch to match ${REMOTE}/${BRANCH}..."
if git reset --hard "${REMOTE}/${BRANCH}"; then
    print_success "Local branch reset to ${REMOTE}/${BRANCH}"
else
    print_error "Failed to reset local branch"
    exit 1
fi

# Step 3: Clean untracked files and directories
print_step "Cleaning untracked files and directories..."
if git clean -fd; then
    print_success "Cleaned untracked files and directories"
else
    print_warning "No untracked files to clean or clean failed"
fi

# Step 4: Show current status
echo ""
print_step "Current repository status:"
git log --oneline -1
echo ""

print_success "Local repository is now in sync with ${REMOTE}/${BRANCH}"
echo ""
