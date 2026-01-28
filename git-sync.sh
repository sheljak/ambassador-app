#!/bin/bash
# ------------------------------------------
# Git auto-commit, pull, push workflow
# ------------------------------------------

BRANCH=${1:-main}   # Default branch is 'main', can pass another branch as first argument

# 1. Configure Git identity (once per Replit workspace)
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"

# 2. Stash local changes (if any) to safely pull
STASHED=$(git status --porcelain)
if [ -n "$STASHED" ]; then
  echo "Stashing local changes..."
  git stash -u
fi

# 3. Pull latest changes from remote
echo "Pulling latest changes from $BRANCH..."
git pull origin $BRANCH --no-rebase || { echo "Pull failed"; exit 1; }

# 4. Apply stashed changes (if any)
if [ -n "$STASHED" ]; then
  echo "Applying stashed changes..."
  git stash pop || echo "Resolve conflicts manually"
fi

# 5. Commit any local changes
if [ -n "$(git status --porcelain)" ]; then
  echo "Committing local changes..."
  git add .
  git commit -m "Replit auto-commit: $(date +'%Y-%m-%d %H:%M:%S')"
else
  echo "No changes to commit"
fi

# 6. Push to remote branch
echo "Pushing changes to $BRANCH..."
git push origin $BRANCH || echo "Push failed. Check authentication/token."

echo "✅ Git sync complete"
