# Issue tracker: GitHub & Local Markdown

Issues and specs for `ethenengine` live as GitHub issues (via `gh` CLI) and local markdown task files under `.scratch/` for offline/rapid iteration.

## Conventions

- **Create an issue**: `gh issue create --title "..." --body "..."`
- **Read an issue**: `gh issue view <number> --comments`
- **List issues**: `gh issue list --state open`
- **Local task tracking**: Files stored under `.scratch/<feature>/tasks.md`

## Pull requests as a triage surface

**PRs as a request surface: no.**

## When a skill says "publish to the issue tracker"

Create a GitHub issue or local markdown ticket in `.scratch/`.

## When a skill says "fetch the relevant ticket"

Run `gh issue view <number> --comments` or inspect `.scratch/` tickets.
