# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Session Start

1. Read `tasks/lessons.md` — apply all lessons before touching anything
2. Read `tasks/todo.md` — understand the current state
3. If neither exists, create them before starting

## Workflow

### 1. Plan First
- Switch to plan mode for any non-trivial task (3+ steps)
- Write the plan in `tasks/todo.md` before implementing
- If something goes wrong, STOP and re-plan — never force through

### 2. Subagent Strategy
- Use subagents to keep the main context clean
- One task per subagent
- Invest more compute on hard problems

### 3. Self-Improvement Loop
- After any fix: update `tasks/lessons.md`
- Format: `[date] | what went wrong | rule to avoid it`
- Re-read lessons at every session start

### 4. Verification Standard
- Never mark as done without proof it works
- Run tests, check logs, compare behavior
- Ask: "Would a staff engineer approve this?"

### 5. Require Elegance
- For non-trivial changes: is there a more elegant solution?
- If a fix feels hacky: rebuild it cleanly
- Don't over-engineer simple things

### 6. Autonomous Bug Fixing
- When given a bug: fix it directly
- Go into the logs, find the root cause, resolve it
- No need to be guided step by step

## Core Principles

- Simplicity first — touch as little code as possible
- No laziness — root causes only, no temporary fixes
- Never assume — verify paths, APIs, variables before use
- Ask once — one upfront question if needed, never interrupt mid-task

## Task Management

1. Plan → `tasks/todo.md`
2. Verify → confirm before implementing
3. Track → mark as done incrementally
4. Explain → high-level summary at each step
5. Learn → `tasks/lessons.md` after fixes

## Repository Status

This repository is newly initialized. No build system or project structure has been set up yet. Update this file once the project is bootstrapped with build/test/lint commands and architecture notes.
