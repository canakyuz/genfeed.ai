// Throwaway #7842. Read-only fixture server; never forwards to an API.
import { DEFAULT_PLATFORM_FLAGS } from '@genfeedai/contracts/constants';
import {
  buildProtectedAppBootstrapPayload,
  generateMockCreditsBreakdown,
} from '../../playwright/e2e/utils/api-interceptor';

const bootstrap = buildProtectedAppBootstrapPayload();
bootstrap.settings.moduleOverrides.editor = false;
bootstrap.settings.moduleOverrides.automation = false;
const installedAppIds = [
  'playground',
  'storyboard',
  'messages',
  'discovery',
  'turbo',
];
const organization = {
  id: bootstrap.access.organizationId,
  isActive: true,
  isOwner: true,
  label: 'Genfeed.Ai',
  name: 'Genfeed.Ai',
  slug: 'test-org',
};
const flags = {
  ...DEFAULT_PLATFORM_FLAGS,
  studio: true,
  storyboard: true,
  turbo: true,
  motion: true,
  clips: true,
  editor: true,
  messages: true,
  discovery: true,
  automation: true,
};
const resource = (type: string, attributes: unknown, id: string) => ({
  data: { type, id, attributes },
});
const server = Bun.serve({
  // biome-ignore lint/suspicious/noUndeclaredEnvVars: Portless injects PORT outside Turbo.
  port: Number(process.env.PORT),
  hostname: '127.0.0.1',
  fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/v1/, '');
    let body: unknown = { data: [] };
    if (request.method !== 'GET' && request.method !== 'OPTIONS')
      return Response.json(
        { message: 'Prototype: persistence is disabled.' },
        { status: 405 },
      );
    if (path === '/public/platform-flags') body = flags;
    else if (path === '/auth/get-session')
      body = {
        session: {
          id: 'prototype-session',
          userId: bootstrap.access.userId,
          activeOrganizationId: organization.id,
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
        },
        user: {
          id: bootstrap.access.userId,
          email: 'preview@example.com',
          name: 'Preview',
          publicMetadata: {
            isSuperAdmin: true,
            role: 'member',
            organization: organization.id,
            brand: 'brand-1',
          },
        },
      };
    else if (path === '/auth/token') body = { token: 'prototype-local-only' };
    else if (path === '/auth/jwks') body = { keys: [] };
    else if (path === '/auth/bootstrap' || path === '/bootstrap')
      body = bootstrap;
    else if (path === '/members/me/apps') body = { installedAppIds };
    else if (path === '/organizations' || path === '/users/me/organizations')
      body = [organization];
    else if (path.includes('/organizations/') && path.endsWith('/settings'))
      body = resource(
        'organization-settings',
        bootstrap.settings,
        bootstrap.settings.id,
      );
    else if (path.includes('/organizations/'))
      body = resource(
        'organization',
        { ...organization, settings: bootstrap.settings },
        organization.id,
      );
    else if (path === '/users/me/brands')
      body = {
        data: bootstrap.brands.map((brand) => ({
          id: brand.id,
          type: 'brand',
          attributes: brand,
        })),
      };
    else if (path === '/users/me' || path === '/users/me/settings')
      body = resource('user', bootstrap.currentUser, bootstrap.access.userId);
    else if (path.includes('credits'))
      body = path.includes('breakdown')
        ? generateMockCreditsBreakdown()
        : { balance: 500, modelCosts: {} };
    else if (path.includes('notifications'))
      body = { data: [], unreadCount: 0 };
    return Response.json(body, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store',
      },
    });
  },
});

export default server;
