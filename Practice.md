# How we work on this project
Project: kivo-inventory-dashboard, an Inventory & Logistics dashboard. Source of truth: SPEC.md. Read SPEC.md before ANY change.

## 1. Every request: the same 4 steps
1. Review: Does the request fit SPEC.md? Name the feature and its priority (Must/Should/Later).
   If it is on the "IT IS NOT" list or contradicts the spec, say so and STOP.
   If anything is unclear, ask. Never fill a blank with a guess.
   Write a short plan (3–5 lines) and wait for my approval.
2. Build: Make only the approved change. Nothing extra and no "while I'm here" edits.
3. Test: Run ALL tests. Add at least one test for the new behaviour, taken from the
   "Done means" lines in SPEC.md. "It looks right" is not a test. Report pass/fail.
4. Commit: One request = one commit. Then push to origin.

## 2. Git and GitHub rules
- Always start with git status. Stage only the files for this change (no scratch files).
- Commit message: line 1 = what changed; body = why; last line = spec reference,
  e.g. "Spec: Features / Must / low-stock alerts". Add "Fixes #N" when it closes an issue.
- Commit and push automatically after every approved, tested change. Don't batch features
  and don't leave finished work unpushed.
- Print every gh CLI command you use.
- Never commit secrets, keys or .env files.
- For larger or risky changes, work on a branch (git switch -c <feature>) and open a PR (gh pr create).

## 3. README.md
- Keep README.md at the root with: the logo, what the dashboard is (one paragraph), a status line
  (e.g. "v1: all numbers are mock data, no backend"), the current feature list, "Not built yet",
  how to run it locally (e.g. python -m http.server 8765), the live GitHub Pages link, a table of
  files with their purpose, and a link to SPEC.md.
- If README.md does not exist yet, create it with the first feature.
- Update it in the SAME commit as the feature it describes.

## 4. Keep SPEC.md in sync
- If a change request changes design, colours, sizes or features, update SPEC.md in the SAME
  commit, so SPEC.md and the dashboard never disagree.
- The dashboard must never contain anything SPEC.md forbids.

## 5. Bugs outside the request
- Don't fix them silently and don't just mention them in chat. Open a GitHub Issue:
  gh issue create with Title, Steps, Expected, Actual, and "Found while: <request>".
- Then continue with the original request.

## 6. When something goes wrong
- To undo a commit: show the last commit id (git log --oneline), then git revert <id> and push.
- If Claude did the wrong thing, fix this file (Practice.md), not the chat, and commit it.

## 7. Skills
- Before planning or building, read the skills in .claude/skills/ (each SKILL.md) and use every skill
  whose description fits the task (e.g. ui-ux-design for any design, layout, colour, typography,
  chart or table work, and dataviz for charts if installed). Name the skills you used in your plan and in your final report.
- Order of authority: SPEC.md > Practice.md > skills. A skill may improve HOW something is built,
  but it never overrides the spec (e.g. a design skill must not add colours, fonts or features the spec
  does not allow). If a skill conflicts with the spec, follow the spec and tell me about the conflict.
