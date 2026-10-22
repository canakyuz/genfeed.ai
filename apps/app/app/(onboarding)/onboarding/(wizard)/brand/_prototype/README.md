# Throwaway onboarding UI prototype

Question: how should the first image, video, and social posts appear inside Genfeed's application layout, with useful recovery after refresh?

Three structurally different options share an onboarding mode of the application frame and the actual `packages/ui/web-tokens.css` tokens. The frame is a read-only replica, not the authenticated production shell. This runner intentionally avoids auth, API, generation, billing, connection, and publishing calls so exploration cannot spend credits or change an account.

- `?variant=A`: media gallery, with image and playable video leading the collection.
- `?variant=B`: one large asset at a time, editable caption, and a draft filmstrip.
- `?variant=C`: compact review queue with an adjacent media preview.

The floating controls and left/right keys switch variants. Arrow keys inside the caption editor keep their usual behavior. Platform avatars replace plain platform headings; accessible names and hover titles identify the platform.

## Run

With the repository's usual dependencies and development HTTPS setup available:

```sh
bun run prototype:onboarding
```

The runner prints its worktree-aware `/onboarding/brand?variant=A` URL. It serves only this prototype and its allowlisted assets, binds to loopback, and refuses to start with `NODE_ENV=production`. The production onboarding route is untouched.

A portable file can also be built, with the actual theme tokens, Satoshi font, SVG artwork, and 12-second H.264 video embedded:

```sh
bun 'apps/app/app/(onboarding)/onboarding/(wizard)/brand/_prototype/package-preview.mjs'
```

Open the resulting HTML file in a browser. It makes no external requests.

## Try

Keep a draft, edit a caption in B, then refresh. The same run, asset identities, choice, caption, and demo credit total return. Open **Scenarios** for brand input, in-progress generation, saved results, video failure, and reset. A failed-video retry reuses completed image/copy results and increments only the explicit demo retry. A refresh during that retry resumes the same job. Optional simulated account connection follows review.

Persistence is specifically being explored here. The prototype uses one clearly named localStorage fixture, `genfeed-onboarding-PROTOTYPE-wipe-me-v1`; **Reset demo** replaces only that fixture. Credit amounts, media, job progress, and account connections are examples, not live onboarding output or budget decisions. Generated media is represented by bundled motion-design fixtures. Nothing is published.

## Handoff to production

No winning variant has been selected. Preserve the complete prototype on its throwaway branch; do not merge it into the application. Implementation tracking: [onboarding media visibility #7775](https://github.com/genfeedai/genfeed.ai/issues/7775).

The production version needs the real shell components, existing social-icon helpers and media viewers, server-owned recovery of an organization/brand-scoped onboarding run and its saved results, and idempotent credit-bearing generation. Browser storage alone cannot prevent duplicate spending across tabs, cleared storage, devices, or concurrent requests. Restore the run before considering automatic generation, reconcile in-flight jobs, and retry only explicitly requested failed assets. Preserve normal onboarding auth and tenant boundaries.

## Navigation revision

The review headline, description, and repeated metadata block have been removed. The global app rail, onboarding side rail, organization/brand switchers, search, wallet, notifications, plugins, and agent controls are absent from the rendered onboarding shell. A compact, non-interactive progress indicator identifies the current step. The application frame, header, media styling, and spacing stay familiar. Relevant review controls remain available, and an explicit Open workspace exit avoids trapping the user. Disabled controls are reserved for genuinely temporary unavailability inside the task, not a full set of locked navigation.
