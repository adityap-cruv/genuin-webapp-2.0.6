# Foil Home Content Drawer Design

## Goal

Open the existing Foil article and athlete-profile experiences from `/home` without navigating away from the page. The selected content must slide in from the right while the shared site header and sidebar remain visible. The browser URL must stay `/home`.

## Scope

This behavior applies to:

- cards in **FROM THE SAILGP DESK**;
- the first three linked cards in **THE FLEET**.

The standalone `/foil/articles/[slug]` and `/foil/athletes/[slug]` routes remain available and unchanged. The final three Fleet cards keep their current “profile coming soon” behavior.

## Architecture

Drawer orchestration belongs in the webapp home client layer because the local article/profile data and page components are app-owned, while the reusable Home component lives in the shared components package.

The shared Home component will expose optional article and athlete selection callbacks. When callbacks are supplied, linked cards invoke them rather than navigating. When callbacks are absent, the existing links remain as the fallback behavior. This preserves the component’s existing reuse contract.

The home client layer will hold ephemeral drawer state containing the selected content type and slug. It will resolve the slug through the existing local Foil article or athlete data and render the same local content component already used by the standalone route.

No article/profile markup or data will be duplicated, and no external page will be fetched.

## Drawer Presentation

The drawer will:

- cover the full main-content region only;
- remain below the global header and to the right of the global sidebar;
- slide in from the right;
- leave the header and sidebar visible;
- provide a clearly labelled close control;
- scroll independently from the underlying home page;
- prevent pointer interaction and scrolling on the covered home content;
- render above placement content and other home-page elements;
- restore the prior home scroll position when closed.

The browser URL remains `/home`. Drawer state is intentionally session-only, so refreshing the page returns to the normal closed home view.

## Content Reuse

The article drawer renders the existing locally stored article content with the same hero, body, placements, sticky feed behavior, grid placement, and footer used by the standalone article route.

The athlete drawer renders the existing locally stored Fleet profile content with the same hero, statistics, biography, results, sticky feed placement, fan-reaction placement, and footer used by the standalone athlete route.

The content components may receive a presentation mode so page-only navigation chrome can be hidden inside the drawer. This mode must not change the actual article/profile content.

## Interaction and Accessibility

- Clicking an eligible card opens its corresponding content.
- The close button closes the drawer without navigation.
- Pressing Escape closes the drawer.
- Focus moves to the drawer when it opens and returns to the triggering card when it closes.
- The drawer is exposed as a labelled dialog or equivalent accessible overlay region.
- Background main content is inert while the drawer is open; the persistent header/sidebar remain visible but do not overlap it.
- Existing direct links continue working when JavaScript callbacks are not provided.

## Error Handling

Only known local slugs are selectable. If an invalid selection nevertheless reaches the drawer layer, the drawer displays a concise unavailable-content state with a close action rather than navigating or crashing.

## Responsive Behavior

The drawer always fills the available main-content region. It must not create page-level horizontal overflow. Existing responsive behavior inside the article/profile components remains authoritative; the drawer only supplies a correctly sized scrolling viewport.

## Verification

Automated tests will verify that:

1. clicking a SailGP Desk article opens its existing local content in the drawer;
2. clicking each linked Fleet profile opens its existing local content in the drawer;
3. the URL remains `/home` throughout;
4. the global header and sidebar remain visible;
5. the drawer closes through its close control and Escape;
6. the underlying home content cannot scroll while the drawer is open and its scroll position is restored after closing;
7. standalone article and athlete routes still render;
8. the final three Fleet cards retain the existing coming-soon message;
9. the drawer layout does not cause horizontal overflow at desktop, tablet, or mobile widths.
