// biome-ignore-all lint/performance/noImgElement: This portable file embeds media and has no Next image server.
'use client';

// Throwaway composition of the real application components. A is the selected direction.
import OnboardingProgress from '@app/(onboarding)/onboarding/components/onboarding-progress';
import { loadClientMessages } from '@app-i18n/client-messages';
import { ButtonSize, ButtonVariant } from '@genfeedai/contracts';
import VideoPlayer from '@ui/display/video-player/VideoPlayer';
import DesktopSidebar from '@ui/layouts/app/DesktopSidebar';
import PlatformPreview, {
  type PlatformPreviewTarget,
} from '@ui/posts/platform-preview/PlatformPreview';
import { Button } from '@ui/primitives/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@ui/primitives/dialog';
import { Textarea } from '@ui/primitives/textarea';
import { ArrowRight, Check, CloudCheck, Pencil, RefreshCw } from 'lucide-react';
import { NextIntlClientProvider } from 'next-intl';
import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { z } from 'zod';

const storageKey = 'genfeed-onboarding-PROTOTYPE-wipe-me-shared-v1';
const steps = [
  'Your brand',
  'Create content',
  'Review drafts',
  'Connect accounts',
];
const snapshotSchema = z.object({
  fixture: z.literal('PROTOTYPE — wipe me'),
  runId: z.literal('starter-demo-001'),
  phase: z.enum(['brand', 'generating', 'review', 'connect']),
  verdicts: z.record(z.string(), z.enum(['keep', 'skip'])),
  edits: z.record(z.string(), z.string()),
  video: z.enum(['complete', 'running', 'failed']),
  generationRequests: z.number().int().nonnegative(),
  creditsSpent: z.number().int().nonnegative(),
  connected: z.array(z.string()),
});
type Snapshot = z.infer<typeof snapshotSchema>;
const fresh = (): Snapshot => ({
  fixture: 'PROTOTYPE — wipe me',
  runId: 'starter-demo-001',
  phase: 'review',
  verdicts: {},
  edits: {},
  video: 'complete',
  generationRequests: 1,
  creditsSpent: 12,
  connected: [],
});
function restore() {
  try {
    const result = snapshotSchema.safeParse(
      JSON.parse(localStorage.getItem(storageKey) || 'null'),
    );
    if (result.success) return { snapshot: result.data, restored: true };
  } catch {}
  return { snapshot: fresh(), restored: false };
}
const initial = restore();
const drafts: PlatformPreviewTarget[] = [
  {
    id: 'post-instagram-01',
    platform: 'instagram',
    caption:
      'Your next post shouldn’t start with a blank page.\n\nGive Genfeed your brand. Get images, videos, and words that sound like you.\n\nLess busywork. More you.',
    author: {
      name: 'Genfeed',
      handle: 'genfeedai',
      avatarUrl: '/prototype-assets/avatar.svg',
    },
    media: [
      {
        id: 'starter-image-01',
        kind: 'image',
        url: '/prototype-assets/poster.svg',
        alt: 'Demo brand image: Your ideas. Your voice. Everywhere.',
      },
    ],
  },
  {
    id: 'post-tiktok-01',
    platform: 'tiktok',
    caption:
      'Your brand already has a voice. Let’s put it to work.\n\nOne idea. Your images, your video, your next post. All in one place.\n\nMade with Genfeed.',
    author: {
      name: 'Genfeed',
      handle: 'genfeedai',
      avatarUrl: '/prototype-assets/avatar.svg',
    },
    media: [
      {
        id: 'starter-video-01',
        kind: 'short_video',
        url: '/prototype-assets/first-video.mp4',
        thumbnailUrl: '/prototype-assets/video-poster.svg',
        alt: 'Demo onboarding video',
        durationLabel: '0:12',
      },
    ],
  },
  {
    id: 'post-x-01',
    platform: 'twitter',
    caption:
      'You built the brand. We’ll help you tell its story.\n\nGenfeed turns one idea into images, videos, and posts in your voice.\n\nLess blank-page staring. More putting your work out there.',
    author: {
      name: 'Genfeed',
      handle: 'genfeedai',
      avatarUrl: '/prototype-assets/avatar.svg',
    },
    media: [
      {
        id: 'starter-image-01',
        kind: 'image',
        url: '/prototype-assets/poster.svg',
        alt: 'Saved demo brand image',
      },
    ],
  },
  {
    id: 'post-linkedin-01',
    platform: 'linkedin',
    caption:
      'The best part of your brand isn’t how often you post. It’s what you have to say.\n\nGenfeed brings your brand context, ideas, and content into one workspace. Start with what you know. Leave with something worth sharing.\n\nYour voice stays yours. The busywork gets smaller.',
    author: {
      name: 'Genfeed',
      handle: 'genfeedai',
      avatarUrl: '/prototype-assets/avatar.svg',
    },
    media: [],
  },
];

function OnboardingPrototype() {
  const [snapshot, setSnapshot] = useState(initial.snapshot);
  const [skipConfirm, setSkipConfirm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [scenarios, setScenarios] = useState(false);
  const [notice, setNotice] = useState('');
  const [website, setWebsite] = useState('https://genfeed.ai');
  const phaseIndex = { brand: 0, generating: 1, review: 2, connect: 3 }[
    snapshot.phase
  ];
  const kept = Object.values(snapshot.verdicts).filter(
    (value) => value === 'keep',
  ).length;
  const editingDraft = drafts.find((draft) => draft.id === editing);
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(snapshot));
    } catch {
      setNotice(
        'Browser storage is unavailable. Refresh recovery cannot be demonstrated.',
      );
    }
  }, [snapshot]);
  useEffect(() => {
    if (snapshot.phase !== 'generating') return;
    const timer = window.setTimeout(
      () =>
        setSnapshot((current) => ({
          ...current,
          phase: 'review',
          video: 'complete',
        })),
      4500,
    );
    return () => window.clearTimeout(timer);
  }, [snapshot.phase]);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 5000);
    return () => window.clearTimeout(timer);
  }, [notice]);
  const rate = (id: string, value: 'keep' | 'skip') =>
    setSnapshot((current) => ({
      ...current,
      verdicts: { ...current.verdicts, [id]: value },
    }));
  const exit = () => setNotice('Workspace preview · Drafts saved');
  return (
    <NextIntlClientProvider locale="en" messages={loadClientMessages('en')}>
      <div className="prototype-shell gf-app">
        <header className="prototype-topbar">
          <span className="prototype-brand">
            <img src="/prototype-assets/logo.svg" alt="" />
            Genfeed
          </span>
          <span className="prototype-breadcrumb">
            <span>Getting started</span>
            <span>/</span>
            <strong>{steps[phaseIndex]}</strong>
          </span>
          <span
            className="prototype-save"
            role="status"
            aria-label="Progress saved"
            title="Progress saved"
          >
            <CloudCheck className="size-3.5" />
          </span>
        </header>
        <div className="prototype-frame">
          <DesktopSidebar
            embedded
            isCollapsed={false}
            width={220}
            ariaLabel="Onboarding progress"
          >
            <div className="flex h-full flex-col p-3">
              <p className="px-2.5 pb-5 pt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Getting started
              </p>
              <div
                className="prototype-vertical-progress"
                data-step={phaseIndex}
              >
                <OnboardingProgress
                  currentStep={phaseIndex}
                  totalSteps={steps.length}
                  stepLabels={steps}
                />
              </div>
            </div>
          </DesktopSidebar>
          <div className="flex min-w-0 flex-1 flex-col">
            <div
              className="prototype-subtopbar"
              role="toolbar"
              aria-label="Onboarding actions"
            >
              <Button
                size={ButtonSize.SM}
                variant={ButtonVariant.GHOST}
                onClick={() => setSkipConfirm(true)}
                label="Skip onboarding"
              />
              {snapshot.phase !== 'generating' && (
                <Button
                  size={ButtonSize.SM}
                  data-action="continue"
                  isDisabled={snapshot.phase === 'review' && kept === 0}
                  onClick={() => {
                    if (snapshot.phase === 'brand') {
                      setSnapshot((current) => ({
                        ...current,
                        phase: 'generating',
                        video: 'running',
                      }));
                    } else if (snapshot.phase === 'review') {
                      setSnapshot((current) => ({
                        ...current,
                        phase: 'connect',
                      }));
                    } else {
                      exit();
                    }
                  }}
                >
                  {snapshot.phase === 'brand'
                    ? 'Create posts'
                    : snapshot.phase === 'connect'
                      ? 'Finish'
                      : 'Continue'}
                  <ArrowRight className="size-4" />
                </Button>
              )}
            </div>
            <main className="prototype-main" aria-label="Onboarding content">
              {snapshot.phase === 'review' && (
                <div className="prototype-gallery">
                  {drafts.map((draft) => {
                    const id = draft.id || draft.platform;
                    const isRejected = snapshot.verdicts[id] === 'skip';
                    const isFailed =
                      draft.platform === 'tiktok' &&
                      snapshot.video === 'failed';
                    return (
                      <div
                        className="prototype-draft min-w-0"
                        key={id}
                        data-draft-id={id}
                        data-verdict={snapshot.verdicts[id] || 'review'}
                      >
                        <div className="prototype-card-content">
                          {isFailed ? (
                            <div className="rounded-lg border border-border bg-card p-5">
                              <p className="text-sm font-semibold">
                                Video failed
                              </p>
                              <Button
                                className="mt-4"
                                variant={ButtonVariant.SECONDARY}
                                label="Retry · 4 GEN"
                                onClick={() =>
                                  setSnapshot((current) => ({
                                    ...current,
                                    phase: 'generating',
                                    video: 'running',
                                    generationRequests:
                                      current.generationRequests + 1,
                                    creditsSpent: current.creditsSpent + 4,
                                  }))
                                }
                              />
                            </div>
                          ) : (
                            <PlatformPreview
                              target={{
                                ...draft,
                                caption: snapshot.edits[id] ?? draft.caption,
                              }}
                              headerPresentation="account"
                              statusLabel={
                                isRejected
                                  ? 'Not for me'
                                  : snapshot.verdicts[id] === 'keep'
                                    ? 'Kept'
                                    : 'Saved'
                              }
                              showValidation={false}
                              renderMedia={(item) =>
                                item.kind === 'video' ||
                                item.kind === 'short_video' ? (
                                  <VideoPlayer
                                    src={item.url || ''}
                                    mediaClassName="object-cover"
                                    mediaProps={{ poster: item.thumbnailUrl }}
                                    ariaLabel={item.alt}
                                  />
                                ) : (
                                  <img
                                    src={item.url}
                                    alt={item.alt || 'Brand image'}
                                    className="absolute inset-0 size-full object-contain"
                                  />
                                )
                              }
                            />
                          )}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2 px-1 pb-4">
                          {isRejected ? (
                            <div
                              className="flex items-center gap-2"
                              role="status"
                            >
                              <span className="text-xs text-muted-foreground">
                                Not for me
                              </span>
                              <Button
                                size={ButtonSize.SM}
                                variant={ButtonVariant.SECONDARY}
                                ariaLabel={`Undo rejection for ${draft.platform}`}
                                onClick={() =>
                                  setSnapshot((current) => {
                                    const { [id]: _removed, ...verdicts } =
                                      current.verdicts;
                                    return { ...current, verdicts };
                                  })
                                }
                                label="Undo"
                              />
                            </div>
                          ) : (
                            <>
                              <Button
                                size={ButtonSize.SM}
                                variant={
                                  snapshot.verdicts[id] === 'keep'
                                    ? ButtonVariant.DEFAULT
                                    : ButtonVariant.SECONDARY
                                }
                                aria-pressed={snapshot.verdicts[id] === 'keep'}
                                data-action={`keep:${id}`}
                                onClick={() => rate(id, 'keep')}
                              >
                                <Check className="size-3.5" />
                                {snapshot.verdicts[id] === 'keep'
                                  ? 'Keep this'
                                  : 'I’d post this'}
                              </Button>
                              <Button
                                size={ButtonSize.SM}
                                variant={ButtonVariant.GHOST}
                                aria-pressed={snapshot.verdicts[id] === 'skip'}
                                onClick={() => rate(id, 'skip')}
                                data-action={`skip:${id}`}
                                label="Not for me"
                              />
                              <Button
                                size={ButtonSize.SM}
                                variant={ButtonVariant.GHOST}
                                ariaLabel={`Edit ${draft.platform} caption`}
                                onClick={() => setEditing(id)}
                              >
                                <Pencil className="size-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {snapshot.phase === 'brand' && (
                <div className="mx-auto mt-10 max-w-xl">
                  <h1 className="text-2xl font-semibold">
                    Start with your website
                  </h1>
                  <label
                    htmlFor="website"
                    className="mt-6 block text-xs text-muted-foreground"
                  >
                    Website
                  </label>
                  <Textarea
                    id="website"
                    className="mt-2 min-h-10"
                    value={website}
                    onChange={(event) => setWebsite(event.target.value)}
                  />
                </div>
              )}
              {snapshot.phase === 'generating' && (
                <div className="mx-auto mt-20 max-w-md text-center">
                  <RefreshCw className="mx-auto size-6 animate-spin" />
                  <p className="mt-5 text-lg font-semibold">
                    Creating your posts…
                  </p>
                </div>
              )}
              {snapshot.phase === 'connect' && (
                <div className="mx-auto mt-8 max-w-xl">
                  <h1 className="text-2xl font-semibold">Connect accounts</h1>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Publish when you’re ready.
                  </p>
                  <div className="mt-6 grid gap-3">
                    {drafts.map((draft) => (
                      <div
                        className="flex items-center justify-between gap-3 border-b border-border py-3"
                        key={draft.platform}
                      >
                        <span className="text-sm capitalize">
                          {draft.platform === 'twitter' ? 'X' : draft.platform}
                        </span>
                        <Button
                          size={ButtonSize.SM}
                          variant={ButtonVariant.SECONDARY}
                          label={
                            snapshot.connected.includes(draft.platform)
                              ? 'Connected'
                              : 'Connect'
                          }
                          onClick={() => {
                            setSnapshot((current) => ({
                              ...current,
                              connected: [
                                ...new Set([
                                  ...current.connected,
                                  draft.platform,
                                ]),
                              ],
                            }));
                            setNotice('Demo account connected');
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
        <div className="prototype-lab">
          <span>Prototype</span>
          <Button
            size={ButtonSize.SM}
            variant={ButtonVariant.GHOST}
            onClick={() => location.reload()}
          >
            <RefreshCw className="size-3" />
            Refresh
          </Button>
          <Button
            size={ButtonSize.SM}
            variant={ButtonVariant.GHOST}
            onClick={() => setScenarios(true)}
            label="Scenarios"
          />
        </div>
        {notice && (
          <output className="prototype-notice" aria-live="polite">
            {notice}
          </output>
        )}
        <Dialog
          open={Boolean(editing)}
          onOpenChange={(open) => {
            if (!open) setEditing(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit caption</DialogTitle>
            </DialogHeader>
            {editingDraft && (
              <Textarea
                aria-label="Caption"
                className="min-h-52"
                value={
                  snapshot.edits[editingDraft.id || editingDraft.platform] ??
                  editingDraft.caption
                }
                onChange={(event) => {
                  const id = editingDraft.id || editingDraft.platform;
                  setSnapshot((current) => ({
                    ...current,
                    edits: { ...current.edits, [id]: event.target.value },
                  }));
                }}
              />
            )}
            <Button onClick={() => setEditing(null)} label="Done" />
          </DialogContent>
        </Dialog>
        <Dialog open={skipConfirm} onOpenChange={setSkipConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Skip onboarding?</DialogTitle>
              <DialogDescription>
                Confirming your brand and reviewing these posts helps Genfeed
                create better content for you.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant={ButtonVariant.SECONDARY}
                onClick={() => {
                  setSkipConfirm(false);
                  exit();
                }}
                label="Skip onboarding"
              />
              <Button
                onClick={() => setSkipConfirm(false)}
                label="Keep reviewing"
              />
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={scenarios} onOpenChange={setScenarios}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Try the onboarding flow</DialogTitle>
              <DialogDescription>
                Demo only. No real credits or publishing.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-wrap gap-2">
              {(
                ['brand', 'generating', 'review'] satisfies Snapshot['phase'][]
              ).map((phase) => (
                <Button
                  key={phase}
                  size={ButtonSize.SM}
                  variant={ButtonVariant.SECONDARY}
                  label={phase}
                  onClick={() => {
                    setSnapshot((current) => ({ ...current, phase }));
                    setScenarios(false);
                  }}
                />
              ))}
              <Button
                size={ButtonSize.SM}
                variant={ButtonVariant.SECONDARY}
                label="Video failed"
                onClick={() => {
                  setSnapshot((current) => ({
                    ...current,
                    phase: 'review',
                    video: 'failed',
                  }));
                  setScenarios(false);
                }}
              />
              <Button
                size={ButtonSize.SM}
                variant={ButtonVariant.SECONDARY}
                label="Reset demo"
                onClick={() => {
                  setSnapshot(fresh());
                  setScenarios(false);
                }}
              />
            </div>
            <pre className="max-h-72 overflow-auto text-xs text-muted-foreground">
              {JSON.stringify(snapshot, null, 2)}
            </pre>
          </DialogContent>
        </Dialog>
      </div>
    </NextIntlClientProvider>
  );
}
const root = document.getElementById('app');
if (!root) throw new Error('Missing prototype mount');
createRoot(root).render(<OnboardingPrototype />);
