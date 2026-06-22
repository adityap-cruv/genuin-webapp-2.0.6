/**
 * Lightweight axios mock factory. Designed to be plugged into a test via
 *   `vi.mock('axios', () => axiosMockFactory());`
 *
 * Tests register per-URL responses with `setAxiosResponse`. A request whose
 * URL has no registered matcher resolves to `{ status: 200, data: {} }` so
 * tests fail-loud on missed mocks via assertions, not throws.
 */
import { vi, type Mock } from "vitest";

export interface AxiosResponseLike<T = unknown> {
  status: number;
  data: T;
  headers?: Record<string, string>;
}

export type AxiosMatcher = string | RegExp | ((url: string) => boolean);

interface Rule<T = unknown> {
  matcher: AxiosMatcher;
  response: AxiosResponseLike<T>;
}

const rules: Array<Rule> = [];

function matches(matcher: AxiosMatcher, url: string): boolean {
  if (typeof matcher === "string") return url === matcher;
  if (matcher instanceof RegExp) return matcher.test(url);
  return matcher(url);
}

export function setAxiosResponse<T>(matcher: AxiosMatcher, response: AxiosResponseLike<T>): void {
  rules.push({ matcher, response });
}

export function resetAxiosMock(): void {
  rules.length = 0;
}

async function resolveFor(url: string): Promise<AxiosResponseLike> {
  for (let i = rules.length - 1; i >= 0; i -= 1) {
    const rule = rules[i];
    if (rule && matches(rule.matcher, url)) {
      return rule.response;
    }
  }
  return { status: 200, data: {} };
}

export interface AxiosLike {
  get: Mock<(url: string, config?: unknown) => Promise<AxiosResponseLike>>;
  post: Mock<(url: string, body?: unknown, config?: unknown) => Promise<AxiosResponseLike>>;
  put: Mock<(url: string, body?: unknown, config?: unknown) => Promise<AxiosResponseLike>>;
  delete: Mock<(url: string, config?: unknown) => Promise<AxiosResponseLike>>;
  request: Mock<(cfg: { url?: string }) => Promise<AxiosResponseLike>>;
  create: Mock<() => AxiosLike>;
}

function buildClient(): AxiosLike {
  const client: Partial<AxiosLike> = {};
  client.get = vi.fn((url: string) => resolveFor(url));
  client.post = vi.fn((url: string) => resolveFor(url));
  client.put = vi.fn((url: string) => resolveFor(url));
  client.delete = vi.fn((url: string) => resolveFor(url));
  client.request = vi.fn((cfg: { url?: string }) => resolveFor(cfg.url ?? ""));
  client.create = vi.fn(() => buildClient());
  return client as AxiosLike;
}

export function axiosMockFactory(): { default: AxiosLike } {
  return { default: buildClient() };
}
