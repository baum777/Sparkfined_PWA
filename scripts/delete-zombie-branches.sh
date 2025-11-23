#!/bin/bash
# Batch-Delete Script für 28 ZOMBIE Branches
# Datum: 2025-11-23
# SAFE TO RUN: Alle branches sind bereits gemerged (0 ahead)

echo "🧟 Starting Zombie Branch Batch-Delete..."
echo "Total zombies to delete: 28"
echo ""

ZOMBIES=(
  "claude/ci-diagnostics-stabilize-01NRRLWGEJWX71DQi8XnAe2f"
  "claude/eslint-cleanup-0128Z1pU2YiCuEEK6BJ8WtjE"
  "claude/refactor-root-readme-01MjYFvbqzv8KiuiGMmpi52q"
  "claude/remove-nft-functionality-01B3ptcRnj6gvSWcrnkGZiAi"
  "claude/review-legacy-components-01USZDBAKbCLmeG1Y7shdjPx"
  "claude/review-phase-2-release-01Q21ExSsrSfApc9ZxT4LYQh"
  "claude/review-todo-fixme-hygiene-01Ngr3wzwnKThZEbk6wsAdLA"
  "claude/review-todo-fixme-hygiene-01RwkrKeDKn9t8S1r1p88kyM"
  "claude/ui-review-errors-01QZfyon9oJhEWUHaN3HcH6U"
  "claude/zombie-code-sweep-01Ctsx13oxtxfbPyEGbRn4eT"
  "codex/implement-api-runtime-fixes-for-node/edge"
  "codex/implement-dexscreener-and-birdeye-adapters"
  "codex/implement-grok-pulse-api-integration"
  "codex/implement-heavy-ci-steps-for-phase-3"
  "codex/integrate-real-adapters-and-context-builder"
  "codex/perform-final-zombie-code-sweep"
  "codex/perform-todo/fixme-hygiene-cleanup"
  "cursor/apply-sparkfined-ci-fix-patch-6e6c"
  "cursor/audit-and-iterate-production-readiness-f061"
  "cursor/configure-moralis-api-key-env-handling-17be"
  "cursor/describe-sparkfined-in-english-1cd1"
  "cursor/design-grok-event-integration-for-sparkfined-d279"
  "cursor/fetch-market-prices-for-watchlist-v2-9950"
  "cursor/fix-ci-errors-and-workflow-issues-0f5a"
  "cursor/fix-type-errors-and-linter-issues-7086"
  "cursor/generate-markdown-mindmap-structure-bb20"
  "cursor/implement-sparkfined-ta-pwa-beta-v0-1-features-8f74"
  "cursor/set-up-multi-tool-prompt-system-964c"
)

SUCCESS=0
FAILED=0

for branch in "${ZOMBIES[@]}"; do
  echo "Deleting: $branch"

  if gh api repos/baum777/Sparkfined_PWA/git/refs/heads/$branch -X DELETE 2>/dev/null; then
    echo "  ✅ Deleted successfully"
    ((SUCCESS++))
  else
    echo "  ❌ Failed to delete (might already be deleted or no permissions)"
    ((FAILED++))
  fi

  sleep 0.5  # Be nice to the API
done

echo ""
echo "=========================================="
echo "Batch-Delete Complete!"
echo "✅ Successful: $SUCCESS"
echo "❌ Failed: $FAILED"
echo "=========================================="
echo ""
echo "Next: Verify on GitHub:"
echo "https://github.com/baum777/Sparkfined_PWA/branches"
