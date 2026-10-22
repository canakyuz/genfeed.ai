# Throwaway onboarding prototype — selected gallery A

Decision: use the media-first gallery inside the familiar application frame, with the existing left sidebar repurposed as non-clickable onboarding progress. Remove the decorative review heading and global application rail. Use the sub-topbar for Continue and Skip onboarding. Skipping asks for confirmation; reviewing brand context and posts improves output.

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

Keep or reject a draft, then refresh. The same run ID, choices, results, and demo credit total return. Content editing happens after onboarding. **Scenarios** offers brand input, generating, review, video failure, and reset. A refresh during generation resumes the same simulated job. An explicit failed-video retry increments only that retry. Account connection is optional and simulated.

All media, credit amounts, job progress, and account connections are fixtures. No API, generation, billing, publishing, or connection calls are made. Persistence is deliberately being explored with the isolated browser key `genfeed-onboarding-PROTOTYPE-wipe-me-shared-v1`; Reset demo touches only that fixture. This is not production persistence or a decision about production generation budgets.

## Production handoff

A is the selected direction; the complete throwaway source remains on its branch, outside master. [Implementation tracking: #7775](https://github.com/genfeedai/genfeed.ai/issues/7775).

Use the same shared React components in production, with the authenticated shell's onboarding mode. Restore the organization/brand-scoped server-owned run and saved outputs before considering generation; reconcile in-flight jobs and make credit-bearing requests idempotent. Retry only an explicitly requested failed asset. Local browser storage alone cannot protect credits across tabs, devices, cleared storage, or concurrent requests. Preserve onboarding authentication and tenant boundaries.

## Grouped preview and review feedback

The existing PlatformPreview now offers an opt-in account header: one avatar/name/handle group with its platform badge, without a repeated platform heading and author block. Existing callers retain their default presentation. Onboarding previews use two wider desktop columns with a single column on narrower screens. Not for me dims the preview to 35% opacity and shows an explicit Undo action. The rejected choice survives refresh; Undo restores the normal preview.

The sub-topbar owns the primary action across steps. The footer, repeated saved/restored notices, collection metadata, sidebar reminders, and explanatory demo copy are removed. Skip onboarding opens the shared dialog primitives with Keep reviewing as the primary action.

Review is read-only. Back returns to the previous screen without regenerating content. Connections compose the shared Card and brand icons. Brand entry uses the shared single-line Input with an inline submit; website/social URLs in this portable file are fixtures, not live imports.
