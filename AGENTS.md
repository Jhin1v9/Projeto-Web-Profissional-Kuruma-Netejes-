# Codex Project Instructions

## Working style
- Keep changes focused and small.
- Prefer pragmatic fixes over big rewrites.
- Explain tradeoffs before major architecture changes.

## Code quality
- Keep TypeScript strict and avoid `any` when possible.
- Add/update tests for behavior changes.
- Do not break existing APIs without explicit approval.

## Safety rules
- Never run destructive git commands (`reset --hard`, force-push) without approval.
- Do not touch secrets in `.env` files.
- If requirements are unclear, state assumptions first.

## Delivery
- Always report:
  - files changed
  - what was implemented
  - how it was validated
  - next steps (if any)
