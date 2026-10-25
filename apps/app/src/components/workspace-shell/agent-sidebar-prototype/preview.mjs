// Throwaway: three contextual agent-sidebar designs on the Library URL, ?variant=A/B/C.
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../../../../../..');
const exportPath = process.argv[2] === '--export' ? process.argv[3] : null;
if (process.env.NODE_ENV === 'production') {
  throw new Error('This throwaway prototype is available only in development.');
}
if (!process.env.PORTLESS_URL && !exportPath) {
  const child = Bun.spawn(
    [
      process.execPath,
      resolve(root, 'scripts/dev/run-portless.ts'),
      'app',
      '--',
      process.execPath,
      import.meta.path,
    ],
    {
      cwd: root,
      env: process.env,
      stdin: 'inherit',
      stdout: 'inherit',
      stderr: 'inherit',
    },
  );
  process.exit(await child.exited);
}

const route = '/genfeed/genfeedai/library/assets';
const standalone = `
<style>
  :root { color-scheme: light dark; }
  body { margin:0; padding:20px 20px 94px; background:light-dark(#f5f5f5,#0a0a0a); font-family:Arial,sans-serif; }
  [hidden] { display:none !important; }
  .viz-carousel { max-width:1400px; margin:auto; }
  #prototype-navigation { position:fixed; bottom:16px; left:50%; transform:translateX(-50%); display:flex; align-items:center; gap:10px; max-width:calc(100% - 32px); padding:8px; background:light-dark(#ededed,#ededed); color:#0a0a0a; border:1px solid #949494; border-radius:999px; box-shadow:0 8px 32px #0003; z-index:2000; }
  #prototype-navigation button,#prototype-navigation select { border:0; background:transparent; color:inherit; font:500 13px Arial,sans-serif; padding:8px; min-height:36px; }
  #prototype-navigation select { max-width:230px; }
  #prototype-navigation button { cursor:pointer; }
  #prototype-navigation small { padding:0 4px; white-space:nowrap; }
  @media(max-width:500px) { body { padding:8px 8px 86px; } #prototype-navigation { gap:0; } #prototype-navigation select { max-width:190px; } }
</style>
<nav id="prototype-navigation" aria-label="Prototype designs">
  <button type="button" data-prototype-previous aria-label="Previous design">←</button>
  <select aria-label="Design variant"></select>
  <small data-prototype-count></small>
  <button type="button" data-prototype-next aria-label="Next design">→</button>
</nav>
<script>
(() => {
  const carousel = document.querySelector('.viz-carousel');
  const variants = [...carousel.querySelectorAll(':scope > [data-variant]')];
  const navigation = document.getElementById('prototype-navigation');
  const select = navigation.querySelector('select');
  const count = navigation.querySelector('[data-prototype-count]');
  variants.forEach((variant, index) => {
    const option = document.createElement('option');
    option.value = String(index);
    option.textContent = String.fromCharCode(65 + index) + ' · ' + variant.dataset.variant;
    select.append(option);
  });
  let index = Math.max(0, 'ABC'.indexOf(new URL(location.href).searchParams.get('variant') || 'A'));
  const show = (next, updateUrl = true) => {
    index = (next + variants.length) % variants.length;
    variants.forEach((variant, position) => { variant.hidden = position !== index; });
    select.value = String(index);
    count.textContent = (index + 1) + '/' + variants.length;
    if (updateUrl) {
      const url = new URL(location.href);
      url.searchParams.set('variant', String.fromCharCode(65 + index));
      history.replaceState(null, '', url);
    }
    console.info('Prototype state', { variant: String.fromCharCode(65 + index), name: variants[index].dataset.variant });
  };
  navigation.querySelector('[data-prototype-previous]').addEventListener('click', () => show(index - 1));
  navigation.querySelector('[data-prototype-next]').addEventListener('click', () => show(index + 1));
  select.addEventListener('change', () => show(Number(select.value)));
  document.addEventListener('keydown', event => {
    if (event.target.closest('input,textarea,select,[contenteditable="true"],[role="tablist"]')) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      show(index + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  addEventListener('popstate', () => show(Math.max(0, 'ABC'.indexOf(new URL(location.href).searchParams.get('variant') || 'A')), false));
  show(index, false);
})();
</script>`;

async function documentHtml() {
  const fragment = await Bun.file(
    resolve(import.meta.dirname, 'index.html'),
  ).text();
  return (
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Agent sidebar · throwaway prototype</title></head><body>' +
    fragment +
    standalone +
    '</body></html>'
  );
}
if (exportPath) {
  await Bun.write(exportPath, await documentHtml());
  console.info('Exported throwaway prototype: ' + exportPath);
  process.exit(0);
}

Bun.serve({
  hostname: '127.0.0.1',
  port: Number(process.env.PORT),
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === '/')
      return Response.redirect(
        new URL(route + '?variant=A', process.env.PORTLESS_URL),
      );
    if (url.pathname !== route)
      return new Response('Prototype route not found', { status: 404 });
    return new Response(await documentHtml(), {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  },
});
console.info(
  'Throwaway sidebar prototype: ' +
    process.env.PORTLESS_URL +
    route +
    '?variant=A',
);
