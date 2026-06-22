import type { Page } from '../../schema';

/**
 * Shape of a dev-surface fixture. Each fixture pairs a static `Page`
 * artifact with the slot-data map the dev app's `resolveSlotProps`
 * callback consults to materialise slot props.
 *
 * Fixtures are dev-only — they never ship with the library.
 */
export interface Fixture {
  /** Static `Page` artifact under test. */
  page: Page;
  /** Slot-name → renderer-ready props. Keyed by `SlotNode.name`. */
  slotData: Record<string, Record<string, unknown>>;
}
