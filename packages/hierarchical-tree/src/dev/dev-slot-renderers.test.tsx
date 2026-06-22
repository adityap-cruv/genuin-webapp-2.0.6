import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { SlotNode } from '../schema';

// `@genuin/ui`'s animated octo icon loads `lottie-web`, which reads a 2D
// canvas context at import time. jsdom returns `null` from `getContext`,
// so lottie throws ("Cannot set properties of null"). Stub the context
// before the module graph is imported (vi.hoisted runs first).
vi.hoisted(() => {
  if (typeof HTMLCanvasElement !== 'undefined') {
    const ctx = new Proxy(
      {},
      { get: (t: Record<string, unknown>, p: string) => (p in t ? t[p] : () => {}) },
    );
    // Permissive jsdom stub; TS's getContext overload set doesn't unify
    // with a single returned shape, so cast via `unknown`.
    HTMLCanvasElement.prototype.getContext =
      (() => ctx) as unknown as typeof HTMLCanvasElement.prototype.getContext;
  }
});

import { devSlotRenderers } from './dev-slot-renderers';

const SDK_PROPS = {
  styleId: 'style-x',
  placementId: 'placement-x',
  apiKey: 'key-x',
};

/** Render the dev video slot renderer and return the embed frame (the
 *  parent of the `gen-sdk-<name>` target div). */
function renderVideo(slot: SlotNode) {
  const { container } = render(<>{devSlotRenderers.video!({ slot, props: SDK_PROPS })}</>);
  const target = container.querySelector(`#gen-sdk-${slot.name}`);
  return { container, target, frame: target?.parentElement ?? null };
}

describe('DevVideoSlotRenderer — SDK mount height handling', () => {
  it('fills an explicit size-driven height when no aspect is set (no clip)', () => {
    const slot: SlotNode = {
      type: 'slot',
      name: 'topvids',
      kind: 'video',
      style: 'carousel',
      cols: 3,
      size: 'default',
    };
    const { container, frame } = renderVideo(slot);

    // Outer wrapper carries an explicit height + overflow clip.
    const wrapper = container.querySelector('[data-slot-sdk-mount]');
    expect(wrapper?.getAttribute('style')).toMatch(/height/);
    expect(wrapper?.className).toContain('gencl:overflow-hidden');

    // Embed frame fills the wrapper height rather than imposing its own
    // aspect-ratio height.
    expect(frame?.className).toContain('gencl:h-full');
  });

  it('uses the aspect-ratio frame (no fill) when aspect is set', () => {
    const slot: SlotNode = {
      type: 'slot',
      name: 'hero',
      kind: 'video',
      style: 'feed',
      aspect: 'video',
      size: 'lg',
    };
    const { container, frame } = renderVideo(slot);

    // aspect drives geometry — no explicit height on the wrapper.
    const wrapper = container.querySelector('[data-slot-sdk-mount]');
    expect(wrapper?.getAttribute('style') ?? '').not.toMatch(/height/);

    // Frame is width-driven via the aspect class, not h-full.
    expect(frame?.className).not.toContain('gencl:h-full');
  });
});
