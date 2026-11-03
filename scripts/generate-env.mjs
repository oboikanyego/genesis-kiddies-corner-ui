import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

/** API_URL is preferred; NG_APP_API_URL is supported for compatibility. */
export function normalizeApiUrl(value) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error('Missing API_URL (or NG_APP_API_URL). Set it in Netlify → Environment variables (Builds).');
  }

  let url;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error('API_URL must be an absolute http(s) URL, e.g. https://your-api.onrender.com/api');
  }

  if (!['http:', 'https:'].includes(url.protocol) || !url.hostname || url.username || url.password || url.search || url.hash) {
    throw new Error('API_URL must be an http(s) URL without credentials, query parameters or fragments.');
  }

  return url.href.replace(/\/+$/, '');
}

export async function generateEnvironment(environment = process.env) {
  const apiUrl = normalizeApiUrl(environment.API_URL?.trim() || environment.NG_APP_API_URL?.trim());
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const target = join(root, 'src/environments/generated-environment.production.ts');
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, '// Generated at build time from Netlify API_URL. Do not commit.\n' + 'export const productionApiUrl = ' + JSON.stringify(apiUrl) + ';\n', 'utf8');
  console.log('Generated production API configuration from environment variable.');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  generateEnvironment().catch((error) => {
    console.error('Production configuration error: ' + error.message);
    process.exitCode = 1;
  });
}
