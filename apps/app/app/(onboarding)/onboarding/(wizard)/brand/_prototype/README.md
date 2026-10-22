# Throwaway onboarding prototype — selected gallery A

Decision: use the media-first gallery inside the familiar application frame, with the existing left sidebar repurposed as non-clickable onboarding progress. Remove the decorative review heading and global application rail. Keep an explicit Open workspace exit.

This version imports the real application components rather than reproducing their markup:

- `PlatformPreview` renders the existing Instagram, TikTok, X, and LinkedIn card layouts used by publishing.
- `VideoPlayer` is the shared media player. The supported `renderMedia` slot uses embedded images and this player because the portable file has no Next image server.
- `DesktopSidebar` contains the existing `OnboardingProgress`, arranged vertically. It has no navigation links or buttons.
- Buttons, caption fields, and dialogs use the existing UI primitives. Styling compiles from the shared application styles and tokens.

The only new React entry is this throwaway page composition. No new shared card, sidebar, button, or media-player component is introduced. The earlier A/B/C exploration remains captured in prior commits of the throwaway branch.

## Run or package

With the normal dependencies and development HTTPS setup available:

```sh
bun run prototype:onboarding
```

Build the self-contained, double-clickable HTML file:

```sh
bun 'apps/app/app/(onboarding)/onboarding/(wizard)/brand/_prototype/package-preview.mjs'
```

The package includes the React bundle, shared CSS, font, image, logo, and playable 12-second video. The standalone source server binds to loopback, serves allowlisted files, and refuses production mode. Generated bundles live outside the source tree in an isolated temporary output directory.

## Try

Keep a draft, edit its caption, then refresh. The same run ID, choices, caption, results, and demo credit total return. **Scenarios** offers brand input, generating, review, video failure, and reset. A refresh during generation resumes the same simulated job. An explicit failed-video retry increments only that retry. Account connection is optional and simulated.

All media, credit amounts, job progress, and account connections are fixtures. No API, generation, billing, publishing, or connection calls are made. Persistence is deliberately being explored with the isolated browser key `genfeed-onboarding-PROTOTYPE-wipe-me-shared-v1`; Reset demo touches only that fixture. This is not production persistence or a decision about production generation budgets.

## Production handoff

A is the selected direction; the complete throwaway source remains on its branch, outside master. [Implementation tracking: #7775](https://github.com/genfeedai/genfeed.ai/issues/7775).

Use the same shared React components in production, with the authenticated shell's onboarding mode. Restore the organization/brand-scoped server-owned run and saved outputs before considering generation; reconcile in-flight jobs and make credit-bearing requests idempotent. Retry only an explicitly requested failed asset. Local browser storage alone cannot protect credits across tabs, devices, cleared storage, or concurrent requests. Preserve onboarding authentication and tenant boundaries.
