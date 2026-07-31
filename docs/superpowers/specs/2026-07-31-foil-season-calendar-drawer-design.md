# Foil Season Calendar Drawer Design

## Goal

Make every Season Calendar card open useful event information without leaving `/home`, using the same right-side drawer and sticky live-feed experience already used by Foil articles and athlete profiles.

## Interaction

- Sydney, Auckland, Saint-Tropez, Plymouth, and Halifax cards are keyboard- and pointer-accessible.
- Selecting a card opens the existing animated content drawer while the home header and sidebar remain visible.
- Closing the drawer restores the unchanged home view and focus to the selected card.
- The URL remains `/home`.

## Content

Each event uses local structured data containing its venue, dates, country, status, headline, summary, race-week context, course notes, and schedule highlights. The content is generated for this demo and does not depend on a live external fetch.

## Layout

The drawer uses the established Foil detail-page visual language: a centered heading block followed by a two-column reading layout. Event copy occupies the left column, while the existing Foil feed placement is sticky in the right column. Narrow screens stack the feed below the event copy.

## Implementation Boundaries

- Extend the Home callback contract with a calendar-event selection callback.
- Add a local calendar-event data module and a focused calendar detail component.
- Extend the existing Home drawer selection union rather than introducing a second drawer or route.
- Reuse the existing Genuin feed credentials and placement wrapper used by article and fleet details.
- Preserve all existing article, fleet, championship, placement, header, sidebar, and home-page behavior.

## Error Handling

If an event identifier is unavailable, the existing drawer fallback displays the content-unavailable state. SDK placement failures remain handled by the existing placement component.

## Verification

Use targeted static checks for the touched files and manually verify that each of the five cards opens the correct event in the drawer, the sticky feed renders, Escape/close returns to `/home`, and keyboard focus is restored.
