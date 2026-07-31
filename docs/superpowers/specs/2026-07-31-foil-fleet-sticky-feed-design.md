# Foil Fleet Sticky Feed Design

## Goal

Add the existing Foil feed placement to each local Fleet athlete profile in the same layout and behavior used by local Foil article pages.

## Layout

Immediately after the athlete hero and statistics, the profile content becomes a two-column region:

- The left column contains the athlete biography, quote, and recent-results table.
- The right column contains the live feed placement.
- The right column uses `position: sticky` and remains constrained to the profile-content region, stopping before the existing Fan Reactions placement.

The current athlete hero, statistics, Fan Reactions, Championship Outlook, Related Video, and footer remain unchanged.

## Placement Integration

Reuse the existing `ArticlePlacement` component and the same feed credentials already used by local Foil article pages:

- Style ID: `6a032db60ae65ee82495dd73`
- Placement ID: `6a032db60ae65ee82495dd72`
- API key remains managed by the shared placement component.

This avoids a second SDK implementation and keeps overlay behavior consistent across article and athlete pages.

## Responsive Behavior

On desktop, the profile and placement render side by side. At the existing tablet/mobile breakpoint, the layout becomes a single column and the placement loses sticky positioning so it participates normally in document flow.

## Testing

Extend the Foil Fleet Playwright coverage to verify:

1. The local profile contains the new feed placement.
2. The placement uses the expected placement ID.
3. The feed wrapper is sticky at desktop width.
4. The sticky region ends before the Fan Reactions section.
5. Existing local-profile and coming-soon behavior remains green.

