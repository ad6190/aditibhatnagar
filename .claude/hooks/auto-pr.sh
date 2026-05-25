#!/bin/bash

# Auto-PR Hook
# Runs on Stop event (after an agent finishes)
# If the last commit in test-repo references a closing issue, creates a draft PR

set -e

# Navigate to test-repo (the actual codebase being worked on)
REPO_ROOT="/Users/aditibhatnagar/Documents/temp/rohit-ai-sdlc-session/test-repo"
cd "$REPO_ROOT" || exit 0

# Get the last commit message
LAST_MSG=$(git log -1 --pretty=%B 2>/dev/null || echo "")

# Check if it contains a closing keyword (Closes, Fixes, Resolves)
if ! echo "$LAST_MSG" | grep -qiE "closes #|fixes #|resolves #"; then
  exit 0  # Not a closing commit, don't create PR
fi

# Extract the issue number (e.g., "Closes #1" → "1")
ISSUE=$(echo "$LAST_MSG" | grep -oiE "#[0-9]+" | head -1 | tr -d '#')

if [ -z "$ISSUE" ]; then
  exit 0  # Couldn't extract issue number
fi

# Determine current branch — PRs must come from a feature branch, not main
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")

if [ -z "$BRANCH" ] || [ "$BRANCH" = "main" ] || [ "$BRANCH" = "HEAD" ]; then
  exit 0  # No branch, on main, or detached — nothing to PR
fi

# Make sure the branch is pushed to origin (gh pr create needs a remote ref)
git push -u origin "$BRANCH" 2>/dev/null || true

# Check if a PR already exists for this branch
EXISTING=$(gh pr list --repo ad6190/aditibhatnagar --head "$BRANCH" --json number -q '.[0].number' 2>/dev/null || echo "")

if [ -n "$EXISTING" ]; then
  exit 0  # PR already exists
fi

# Get the commit subject for the PR title
COMMIT_TITLE=$(git log -1 --pretty=%s 2>/dev/null || echo "Auto-created PR")

# Create a draft PR from current branch → main
gh pr create \
  --repo ad6190/aditibhatnagar \
  --base main \
  --head "$BRANCH" \
  --draft \
  --title "$COMMIT_TITLE" \
  --body "Closes #${ISSUE}

Auto-created by builder agent. Run \`/review-pr\` to review." \
  2>/dev/null || true

exit 0
