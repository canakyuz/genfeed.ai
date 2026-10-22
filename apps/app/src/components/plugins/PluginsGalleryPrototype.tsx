'use client';

// Throwaway #7842: gallery / editorial rows / preview browser on /:org/~/plugins?variant=A|B|C.
import { ButtonSize, ButtonVariant, ComponentSize } from '@genfeedai/contracts';
import type {
  NativeAppAvailabilityState,
  NativeSecondaryAppId,
} from '@genfeedai/contracts/constants';
import { cn } from '@genfeedai/helpers';
import type { PluginAppEntry } from '@genfeedai/props/plugins/organization-plugins-page.props';
import type {
  PluginsGalleryPrototypeProps,
  PrototypeAppProps,
} from '@genfeedai/props/plugins/plugins-gallery-prototype.props';
import AdminPageShell from '@ui/layout/admin-page-shell/AdminPageShell';
import { Button } from '@ui/primitives/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@ui/primitives/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@ui/primitives/dropdown-menu';
import FormSearchbar from '@ui/primitives/searchbar';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  LockKeyhole,
  MoreHorizontal,
  Puzzle,
} from 'lucide-react';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import {
  PLUGIN_APP_CATALOG,
  PLUGIN_CATEGORY_IDS,
} from '@/components/plugins/plugin-app-catalog';

const VARIANTS = ['A', 'B', 'C'];
const VARIANT_NAMES: Record<string, string> = {
  A: 'Visual gallery',
  B: 'By purpose',
  C: 'Preview browser',
};
const CATEGORY_NAMES = {
  create: 'Create',
  publish: 'Publish',
  automate: 'Automate',
};
const CATEGORY_COPY = {
  create: 'From the first idea to the final frame.',
  publish: 'Understand what works. Stay close to your audience.',
  automate: 'Turn repeatable work into a workflow.',
};
const PREVIEW_CAPTIONS: Record<NativeSecondaryAppId, string> = {
  playground: 'Prompt, generate, compare',
  storyboard: 'Scenes, shots, story',
  turbo: 'One brief, many assets',
  motion: 'Design in motion',
  clips: 'Long video to short clips',
  editor: 'Arrange, trim, finish',
  messages: 'Your audience, one inbox',
  discovery: 'Signals worth exploring',
  automation: 'Connect steps into workflows',
};
const STATE_LABELS: Record<NativeAppAvailabilityState, string> = {
  installed: 'Installed',
  pinned: 'Pinned',
  'not-installed': 'Available',
  'organization-disabled': 'Hidden by organization',
  'subscription-required': 'Subscription required',
  unavailable: 'Access unavailable',
  unreleased: 'Not released',
};
function canOpen(app: PluginAppEntry) {
  return app.state === 'installed' || app.state === 'pinned';
}
function restriction(app: PluginAppEntry) {
  if (app.state === 'organization-disabled')
    return 'Your organization has hidden this app. An organization owner can change its visibility in Settings → Modules.';
  if (app.state === 'subscription-required')
    return 'Your organization needs a paid module subscription to use this app. Review the organization subscription.';
  if (app.state === 'unavailable')
    return 'Access could not be confirmed. This app cannot be added or opened until access is available.';
  if (app.state === 'unreleased')
    return 'This app has not been released to your organization.';
  return '';
}
function Preview({
  app,
  className,
}: {
  app: PluginAppEntry;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'relative aspect-video overflow-hidden bg-muted',
        className,
      )}
    >
      <Image
        src={PLUGIN_APP_CATALOG[app.appId].thumbnailSrc ?? ''}
        alt={`${app.label} product preview — ${PREVIEW_CAPTIONS[app.appId]}`}
        fill
        sizes="(min-width: 1280px) 40vw, (min-width: 768px) 45vw, 90vw"
        className="object-contain transition-transform duration-300 group-hover:scale-[1.025]"
        unoptimized
      />
    </div>
  );
}
function State({ app }: { app: PluginAppEntry }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
      data-app-state={app.state}
    >
      {canOpen(app) ? (
        <Check className="size-3" aria-hidden />
      ) : restriction(app) ? (
        <LockKeyhole className="size-3" aria-hidden />
      ) : (
        <span className="size-1 rounded-full bg-current" />
      )}
      {STATE_LABELS[app.state]}
    </span>
  );
}
function Actions({
  app,
  onAction,
  onDetails,
  onPreference,
}: PrototypeAppProps) {
  const locked = Boolean(restriction(app));
  return (
    <div className="flex items-center gap-1">
      <Button
        size={ButtonSize.SM}
        variant={canOpen(app) ? ButtonVariant.SECONDARY : ButtonVariant.DEFAULT}
        isDisabled={locked}
        aria-label={`${canOpen(app) ? 'Open' : 'Add'} ${app.label}`}
        onClick={() => onAction(app)}
      >
        {canOpen(app) ? 'Open' : 'Add'}
        {canOpen(app) ? (
          <ArrowUpRight className="ml-1 size-3" aria-hidden />
        ) : null}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            withWrapper={false}
            size={ButtonSize.ICON}
            variant={ButtonVariant.GHOST}
            ariaLabel={`${app.label} menu`}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => onDetails(app)}>
            View details
          </DropdownMenuItem>
          {canOpen(app) ? (
            <>
              <DropdownMenuItem onSelect={() => onPreference(app, 'pin')}>
                {app.state === 'pinned' ? 'Unpin' : 'Pin to navigation'}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onPreference(app, 'remove')}>
                Remove from my apps
              </DropdownMenuItem>
            </>
          ) : null}
          {locked ? (
            <DropdownMenuItem onSelect={() => onAction(app)}>
              {app.state === 'subscription-required'
                ? 'View subscription requirement'
                : 'Why is this unavailable?'}
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
function AppCard(props: PrototypeAppProps) {
  const { app, onDetails } = props;
  return (
    <article
      className="group overflow-hidden rounded-lg border border-border bg-card"
      data-testid={`prototype-app-${app.appId}`}
    >
      <Button
        withWrapper={false}
        variant={ButtonVariant.UNSTYLED}
        onClick={() => onDetails(app)}
        ariaLabel={`Details for ${app.label}`}
        className="block w-full text-left"
      >
        <Preview app={app} />
      </Button>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold">{app.label}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {app.description}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <State app={app} />
          <Actions {...props} />
        </div>
        {restriction(app) ? (
          <p className="border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
            {restriction(app)}
          </p>
        ) : null}
      </div>
    </article>
  );
}
function VariantA({
  apps,
  ...actions
}: PluginsGalleryPrototypeProps & Omit<PrototypeAppProps, 'app'>) {
  return (
    <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
      {apps.map((app) => (
        <AppCard key={app.appId} app={app} {...actions} />
      ))}
    </div>
  );
}
function VariantB({
  apps,
  ...actions
}: PluginsGalleryPrototypeProps & Omit<PrototypeAppProps, 'app'>) {
  return (
    <div className="space-y-10">
      {PLUGIN_CATEGORY_IDS.map((category) => {
        const entries = apps.filter(
          (app) => PLUGIN_APP_CATALOG[app.appId].category === category,
        );
        if (!entries.length) return null;
        return (
          <section
            key={category}
            className="grid gap-4 border-t border-border pt-5 xl:grid-cols-[180px_1fr]"
          >
            <div>
              <h2 className="text-lg font-semibold">
                {CATEGORY_NAMES[category]}
              </h2>
              <p className="mt-2 max-w-64 text-sm text-muted-foreground">
                {CATEGORY_COPY[category]}
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                {entries.length} apps
              </p>
            </div>
            <div className="divide-y divide-border">
              {entries.map((app) => (
                <article
                  key={app.appId}
                  className="grid items-center gap-4 py-4 first:pt-0 sm:grid-cols-[minmax(180px,34%)_1fr]"
                  data-testid={`prototype-app-${app.appId}`}
                >
                  <Button
                    withWrapper={false}
                    variant={ButtonVariant.UNSTYLED}
                    className="group w-full overflow-hidden rounded-lg border border-border"
                    onClick={() => actions.onDetails(app)}
                    ariaLabel={`Details for ${app.label}`}
                  >
                    <Preview app={app} />
                  </Button>
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <app.icon
                        className="size-4 text-muted-foreground"
                        aria-hidden
                      />
                      <h3 className="text-base font-semibold">{app.label}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {app.description}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {PREVIEW_CAPTIONS[app.appId]}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                      <State app={app} />
                      <Actions app={app} {...actions} />
                    </div>
                    {restriction(app) ? (
                      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                        {restriction(app)}
                      </p>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
function VariantC({
  apps,
  ...actions
}: PluginsGalleryPrototypeProps & Omit<PrototypeAppProps, 'app'>) {
  const [selectedId, setSelectedId] =
    useState<NativeSecondaryAppId>('playground');
  const app = apps.find((item) => item.appId === selectedId) ?? apps[0];
  if (!app) return null;
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[280px_1fr]">
      <div
        className="max-h-60 space-y-1 overflow-y-auto lg:sticky lg:top-4 lg:max-h-none"
        role="group"
        aria-label="Choose an app"
      >
        {apps.map((item) => (
          <Button
            key={item.appId}
            withWrapper={false}
            variant={ButtonVariant.UNSTYLED}
            onClick={() => setSelectedId(item.appId)}
            aria-pressed={item.appId === app.appId}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted',
              item.appId === app.appId && 'bg-muted',
            )}
          >
            <item.icon
              className="size-5 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">{item.label}</span>
              <State app={item} />
            </span>
            <ChevronRight className="size-4 shrink-0" aria-hidden />
          </Button>
        ))}
      </div>
      <article
        className="min-w-0 overflow-hidden rounded-lg border border-border bg-card"
        data-testid={`prototype-app-${app.appId}`}
      >
        <Preview app={app} />
        <div className="space-y-5 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="mb-2 text-xs text-muted-foreground">
                {CATEGORY_NAMES[PLUGIN_APP_CATALOG[app.appId].category]}
              </p>
              <h2 className="text-2xl font-semibold">{app.label}</h2>
              <p className="mt-2 text-base text-muted-foreground">
                {app.description}
              </p>
            </div>
            <Actions app={app} {...actions} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-y border-border py-4">
            <State app={app} />
            <span className="text-sm text-muted-foreground">
              {PREVIEW_CAPTIONS[app.appId]}
            </span>
          </div>
          {restriction(app) ? (
            <p className="text-sm text-muted-foreground">{restriction(app)}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {canOpen(app)
                ? 'Already in your apps. Open it when you are ready to work.'
                : 'Add this app to your personal setup. Your organization’s access rules still apply.'}
            </p>
          )}
          <Button
            variant={ButtonVariant.GHOST}
            size={ButtonSize.SM}
            onClick={() => actions.onDetails(app)}
          >
            View app details <ArrowRight className="ml-2 size-3" />
          </Button>
        </div>
      </article>
    </div>
  );
}
export default function PluginsGalleryPrototype({
  apps,
  isLoading,
}: PluginsGalleryPrototypeProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const requested = params.get('variant') ?? 'A';
  const variant = VARIANTS.includes(requested) ? requested : 'A';
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [details, setDetails] = useState<NativeSecondaryAppId | null>(null);
  const [overrides, setOverrides] = useState<
    Partial<Record<NativeSecondaryAppId, NativeAppAvailabilityState>>
  >({});
  const [notice, setNotice] = useState(
    'Preview only. App actions change this page in memory.',
  );
  const cycle = useCallback(
    (direction: number) => {
      const next = new URLSearchParams(params.toString());
      next.set(
        'variant',
        VARIANTS[(VARIANTS.indexOf(variant) + direction + 3) % 3] ?? 'A',
      );
      router.replace(`${pathname}?${next}`, { scroll: false });
    },
    [params, pathname, router, variant],
  );
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.altKey ||
        event.metaKey ||
        event.ctrlKey ||
        (event.target instanceof HTMLElement &&
          event.target.closest(
            'input,textarea,select,[contenteditable], [role="dialog"], [role="menu"]',
          ))
      )
        return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        cycle(event.key === 'ArrowRight' ? 1 : -1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cycle]);
  const resolved = apps.map((app) => ({
    ...app,
    state: overrides[app.appId] ?? app.state,
  }));
  const visible = resolved.filter(
    (app) =>
      (category === 'all' ||
        PLUGIN_APP_CATALOG[app.appId].category === category) &&
      (status === 'all' ||
        (status === 'installed'
          ? canOpen(app)
          : status === 'available'
            ? app.state === 'not-installed'
            : Boolean(restriction(app)))) &&
      `${app.label} ${app.description} ${PREVIEW_CAPTIONS[app.appId]}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const active = resolved.find((app) => app.appId === details);
  const onAction = (app: PluginAppEntry) => {
    const reason = restriction(app);
    if (reason) {
      setNotice(reason);
      return;
    }
    if (canOpen(app)) {
      setNotice(
        `Open ${app.label} — preview destination: ${app.openHref}. No navigation or work was started.`,
      );
    } else {
      setOverrides((previous) => ({ ...previous, [app.appId]: 'installed' }));
      setNotice(`${app.label} added in this preview only. Reload to reset.`);
    }
  };
  const onPreference = (app: PluginAppEntry, action: 'pin' | 'remove') => {
    setOverrides((previous) => ({
      ...previous,
      [app.appId]:
        action === 'remove'
          ? 'not-installed'
          : app.state === 'pinned'
            ? 'installed'
            : 'pinned',
    }));
    setNotice(
      `${app.label}: ${action === 'remove' ? 'removed' : app.state === 'pinned' ? 'unpinned' : 'pinned'} in this preview only.`,
    );
  };
  const actions = {
    onAction,
    onDetails: (app: PluginAppEntry) => setDetails(app.appId),
    onPreference,
  };
  return (
    <>
      <AdminPageShell
        title="Plugins"
        icon={Puzzle}
        search={
          <FormSearchbar
            ariaLabel="Search plugins"
            placeholder="Search plugins…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-52 sm:w-64"
            size={ComponentSize.SM}
          />
        }
        filters={
          <div className="flex flex-wrap items-center gap-1">
            {['all', 'installed', 'available', 'restricted'].map((value) => (
              <Button
                key={value}
                size={ButtonSize.SM}
                variant={
                  status === value
                    ? ButtonVariant.SECONDARY
                    : ButtonVariant.GHOST
                }
                aria-pressed={status === value}
                onClick={() => setStatus(value)}
              >
                {value === 'all'
                  ? 'All apps'
                  : value[0]?.toUpperCase() + value.slice(1)}
              </Button>
            ))}
          </div>
        }
      >
        <div
          className="mx-auto w-full max-w-[1440px] space-y-5 pb-28"
          data-testid="plugins-prototype"
          data-variant={variant}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">
                Your organization’s apps for creating, publishing and
                automating.
              </p>
            </div>
            <span className="text-xs text-muted-foreground" aria-live="polite">
              {visible.length} of {apps.length} apps ·{' '}
              {resolved.filter(canOpen).length} installed
            </span>
          </div>
          <div
            className="flex flex-wrap items-center gap-1"
            role="group"
            aria-label="App category"
          >
            {['all', ...PLUGIN_CATEGORY_IDS].map((value) => (
              <Button
                key={value}
                size={ButtonSize.SM}
                variant={
                  category === value
                    ? ButtonVariant.SECONDARY
                    : ButtonVariant.GHOST
                }
                aria-pressed={category === value}
                onClick={() => setCategory(value)}
              >
                {value === 'all'
                  ? 'All categories'
                  : value === 'create'
                    ? 'Create'
                    : value === 'publish'
                      ? 'Publish'
                      : 'Automate'}
              </Button>
            ))}
          </div>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">
              Loading your organization’s catalog…
            </p>
          ) : visible.length ? (
            variant === 'B' ? (
              <VariantB apps={visible} isLoading={false} {...actions} />
            ) : variant === 'C' ? (
              <VariantC apps={visible} isLoading={false} {...actions} />
            ) : (
              <VariantA apps={visible} isLoading={false} {...actions} />
            )
          ) : (
            <div className="py-16 text-center">
              <p>No apps match these filters.</p>
              <Button
                className="mt-3"
                variant={ButtonVariant.SECONDARY}
                size={ButtonSize.SM}
                onClick={() => {
                  setSearch('');
                  setCategory('all');
                  setStatus('all');
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </AdminPageShell>
      <Dialog
        open={Boolean(active)}
        onOpenChange={(open) => {
          if (!open) setDetails(null);
        }}
      >
        <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto">
          {active ? (
            <>
              <DialogTitle className="text-xl font-semibold">
                {active.label}
              </DialogTitle>
              <DialogDescription>{active.description}</DialogDescription>
              <Preview
                app={active}
                className="rounded-lg border border-border"
              />
              <State app={active} />
              <p className="text-sm text-muted-foreground">
                {PREVIEW_CAPTIONS[active.appId]}
              </p>
              <p className="text-sm text-muted-foreground">
                {restriction(active) ||
                  'Installation adds the app to your personal setup. Organization visibility, subscription and release access continue to apply.'}
              </p>
              <Actions app={active} {...actions} />
              {canOpen(active) ? (
                <p className="break-all text-xs text-muted-foreground">
                  Opens at {active.openHref}
                </p>
              ) : null}
            </>
          ) : null}
        </DialogContent>
      </Dialog>
      {process.env.NODE_ENV !== 'production' ? (
        <aside
          aria-label="Prototype controls"
          className="fixed bottom-4 left-1/2 z-40 w-[min(560px,calc(100%-24px))] -translate-x-1/2 rounded-xl border border-border bg-foreground p-2 text-background shadow-lg"
        >
          <div className="flex items-center justify-between gap-2">
            <Button
              withWrapper={false}
              variant={ButtonVariant.UNSTYLED}
              className="flex size-9 shrink-0 items-center justify-center rounded-md hover:opacity-60"
              ariaLabel="Previous prototype variant"
              onClick={() => cycle(-1)}
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div className="min-w-0 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-widest opacity-60">
                Design prototype · {VARIANTS.indexOf(variant) + 1} / 3 · ← →
              </p>
              <p className="text-sm font-semibold">
                {variant} · {VARIANT_NAMES[variant]}
              </p>
            </div>
            <Button
              withWrapper={false}
              variant={ButtonVariant.UNSTYLED}
              className="flex size-9 shrink-0 items-center justify-center rounded-md hover:opacity-60"
              ariaLabel="Next prototype variant"
              onClick={() => cycle(1)}
            >
              <ArrowRight className="size-4" />
            </Button>
          </div>
          <p
            className="mt-1 border-t border-current/20 px-2 pt-2 text-center text-[10px] leading-4 opacity-70"
            role="status"
          >
            {notice}
          </p>
        </aside>
      ) : null}
    </>
  );
}
