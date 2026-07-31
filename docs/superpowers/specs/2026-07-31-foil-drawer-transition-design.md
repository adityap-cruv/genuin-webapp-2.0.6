# Foil Drawer Transition Design

## Goal

Make the `/home` Foil content drawer open and close at a readable, polished pace while preserving the current same-page behavior, visible application header/sidebar, keyboard controls, and focus restoration.

## Design

- Keep the existing drawer mounted while it transitions out.
- Represent the visible drawer as `opening`, `open`, or `closing` through a `data-state` attribute.
- Mount at the off-screen `opening` position before transitioning to `open`, preventing a final-position flash while article content initializes.
- Use a 450ms eased horizontal transition in both directions.
- Ignore repeated close requests while the exit transition is running.
- Remove the drawer and restore focus to its trigger after the exit duration completes.
- Complete closing immediately when reduced motion is requested.
- Keep all current article/profile rendering and standalone routes unchanged.

## Verification

- An E2E test must observe the `closing` state before the drawer disappears.
- Existing drawer, article, profile, URL, focus, and keyboard tests must continue to pass.
- Type checking, formatting, and whitespace validation must pass.
