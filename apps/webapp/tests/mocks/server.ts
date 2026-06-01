/**
 * @fileoverview Local HTTP mock server for webapp Playwright tests.
 *
 * Replaces the goservices/API backend during E2E by listening on a fixed port
 * and returning fixture JSON for registered routes. Activated via env-var URL
 * swap in `playwright.config.ts` (`webServer.env`).
 *
 * Architecture: `docs/superpowers/specs/2026-05-27-webapp-mocking-architecture-design.md`.
 */
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Resolve fixture root relative to this file. Playwright compiles tests under
// CommonJS so `__dirname` is available — we don't reach for `import.meta.url`.
const DATA_ROOT = resolve(__dirname, 'data');

/** HTTP methods supported by the mock server. */
export type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/** Route key combining method and path pattern, e.g. `GET /api/v3/feed`. */
export type RouteKey = `${Method} ${string}`;

/** Shape of a mocked response. */
export interface MockResponse {
  status?: number;
  headers?: Record<string, string>;
  body: unknown;
}

/** Handler function — only usable for routes registered in-process (does not survive JSON). */
export type RouteHandlerFn = (
  req: IncomingMessage,
  params: Record<string, string>,
) => Promise<MockResponse> | MockResponse;

/** Route handler — fixture path, static response, or in-process function. */
export type RouteHandler = { fixture: string } | { response: MockResponse } | { handler: RouteHandlerFn };

interface CompiledRoute {
  method: Method;
  pattern: RegExp;
  paramNames: string[];
  handler: RouteHandler;
}

const defaultRoutes: CompiledRoute[] = [];
// Per-test override stack — uncomment alongside useOverride/resetOverrides and the /__use__/__reset__ blocks below.
// const overrideRoutes: CompiledRoute[] = [];
let started = false;

/** Convert `/api/v3/community/:id` into a RegExp plus captured param names. */
function compile(key: RouteKey, handler: RouteHandler): CompiledRoute {
  const spaceIdx = key.indexOf(' ');
  if (spaceIdx === -1) throw new Error(`Invalid RouteKey: "${key}"`);
  const method = key.slice(0, spaceIdx) as Method;
  const pattern = key.slice(spaceIdx + 1);

  const paramNames: string[] = [];
  const regexBody = pattern
    .split('/')
    .map((segment) => {
      if (segment.startsWith(':')) {
        paramNames.push(segment.slice(1));
        return '([^/]+)';
      }
      return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    })
    .join('/');

  return { method, pattern: new RegExp(`^${regexBody}$`), paramNames, handler };
}

/** Register a default route. Survives `resetOverrides()`. Called once from `routes.ts`. */
export function registerRoute(key: RouteKey, handler: RouteHandler): void {
  defaultRoutes.push(compile(key, handler));
}

// Uncomment to enable per-test overrides (also restore overrideRoutes array above and /__use__/__reset__ blocks below).
// export function useOverride(key: RouteKey, handler: RouteHandler): void {
//   overrideRoutes.push(compile(key, handler));
// }
// export function resetOverrides(): void {
//   overrideRoutes.length = 0;
// }

function matchRoute(method: string, pathname: string): { handler: RouteHandler; params: Record<string, string> } | null {
  // When per-test overrides are active, check overrideRoutes first: [...overrideRoutes, ...defaultRoutes]
  for (const route of defaultRoutes) {
    if (route.method !== method) continue;
    const match = route.pattern.exec(pathname);
    if (!match) continue;
    const params: Record<string, string> = {};
    route.paramNames.forEach((name, i) => {
      params[name] = match[i + 1] ?? '';
    });
    return { handler: route.handler, params };
  }
  return null;
}

async function resolveResponse(
  handler: RouteHandler,
  req: IncomingMessage,
  params: Record<string, string>,
): Promise<MockResponse> {
  if ('fixture' in handler) {
    const body = await readFile(resolve(DATA_ROOT, handler.fixture), 'utf8');
    return { body: JSON.parse(body) };
  }
  if ('response' in handler) return handler.response;
  return handler.handler(req, params);
}

// Used by /__use__ — uncomment when per-test overrides are restored.
// async function readBody(req: IncomingMessage): Promise<string> {
//   const chunks: Buffer[] = [];
//   for await (const chunk of req) chunks.push(chunk as Buffer);
//   return Buffer.concat(chunks).toString('utf8');
// }

const DEFAULT_HEADERS = {
  'content-type': 'application/json',
  'access-control-allow-origin': '*',
  'access-control-allow-headers': '*',
  'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
} as const;

function send(res: ServerResponse, response: MockResponse): void {
  res.writeHead(response.status ?? 200, { ...DEFAULT_HEADERS, ...(response.headers ?? {}) });
  res.end(typeof response.body === 'string' ? response.body : JSON.stringify(response.body));
}

async function handleRequest(req: IncomingMessage, res: ServerResponse, port: number): Promise<void> {
  if (req.method === 'OPTIONS') {
    send(res, { status: 204, body: '' });
    return;
  }

  const url = new URL(req.url ?? '/', `http://localhost:${port}`);

  // Uncomment to enable per-test override control endpoints (also restore overrideRoutes, useOverride, resetOverrides).
  // if (req.method === 'POST' && url.pathname === '/__reset__') {
  //   resetOverrides();
  //   send(res, { body: { ok: true } });
  //   return;
  // }
  // if (req.method === 'POST' && url.pathname === '/__use__') {
  //   const parsed = JSON.parse(await readBody(req)) as { key: RouteKey; handler: RouteHandler };
  //   useOverride(parsed.key, parsed.handler);
  //   send(res, { body: { ok: true } });
  //   return;
  // }

  const matched = matchRoute(req.method ?? 'GET', url.pathname);
  if (!matched) {
    process.stderr.write(`[mock] unhandled ${req.method} ${url.pathname}\n`);
    send(res, { status: 404, body: { error: 'mock_not_found', method: req.method, path: url.pathname } });
    return;
  }

  send(res, await resolveResponse(matched.handler, req, matched.params));
}

/** Start the mock server on the given port. Resolves once listening. */
export async function startMockServer(port: number): Promise<void> {
  if (started) throw new Error('Mock server already running');

  const server = createServer((req, res) => {
    handleRequest(req, res, port).catch((error) => {
      process.stderr.write(`[mock] handler error: ${error instanceof Error ? error.message : String(error)}\n`);
      send(res, { status: 500, body: { error: 'mock_internal_error' } });
    });
  });

  await new Promise<void>((resolveListen, reject) => {
    server.once('error', reject);
    server.listen(port, () => {
      server.off('error', reject);
      resolveListen();
    });
  });

  started = true;
}
