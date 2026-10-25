---
name: agent sidebar prototype fidelity
description: Agent sidebar prototypes use real shared controls, one header, and standalone HTML delivery
type: feedback
last_verified: 2026-10-25
---

# Agent sidebar prototype fidelity

UI prototypes must use the actual shared components and design tokens. A contextual agent sidebar has one unified header; its tabs and panel actions share that header.

**Why:** Vincent rejected a prototype that recreated controls, fabricated the surrounding Library page, and added an extra agent header above the tabs.

**How to apply:** Use real shared Tabs, Button, Card and PromptBarComposer components. Mount the prototype in place of the entire inspector header and body when previewing inside the app, preserving the current app shell and page. For a requested standalone HTML preview, bundle those actual components and styles into an offline HTML file focused on the sidebar, with fixture scenario controls outside it. Keep the full-page agent unchanged unless separately requested.
