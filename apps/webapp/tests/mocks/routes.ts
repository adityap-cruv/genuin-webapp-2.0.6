/**
 * @fileoverview Default route registration.
 *
 * Imported as a side-effect from `global-setup.ts` so all base routes register
 * before the first test runs. Add new domains by importing their handler array
 * and adding it to `allHandlers`.
 */
import { registerRoute } from './server';
import { homeHandlers } from './handlers/home';

const allHandlers = [...homeHandlers];

for (const { key, handler } of allHandlers) {
  registerRoute(key, handler);
}
