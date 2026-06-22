/**
 * Hard-coded demo content for the `/websitev5` page. None of this is
 * loaded from an API — the page is a static demo of the Figma design
 * at node `4838-146779`. Replace these arrays with real data only when
 * the route grows beyond demo status.
 */

import type { LinkData } from "@genuin/components/react-query/api/linkouts/schema";

/**
 * Sidebar category nav items. Strings come straight from the Figma left
 * rail; `id` is a slug derived from the label for `useState` keying.
 */
export const SIDEBAR_CATEGORIES: { id: string; label: string }[] = [
  { id: "feed-parameters", label: "Feed Parameters" },
  { id: "challenges-brave", label: "Challenges Brave" },
  { id: "diverse-provocateurs", label: "Diverse Provocateurs" },
  { id: "data-evolves", label: "Data Evolves" },
  { id: "category-banking", label: "Category" },
  { id: "company-banking", label: "Company" },
  { id: "clearances", label: "Clearances" },
  { id: "premium-trade-up", label: "Premium Trade Up" },
  { id: "subscription-leads", label: "Subscription & Leads" },
  { id: "private-label-distinct", label: "Private Label Distinct" },
  { id: "full-funnel", label: "Full Funnel" },
  { id: "always-on", label: "Always On" },
  { id: "brand-products", label: "Brand & Products" },
  { id: "guided-purchase", label: "Guided Purchase" },
  { id: "incrementality", label: "Incrementality" },
  { id: "narratives", label: "Narratives" },
];

/**
 * Right-side meta panel rows from the Figma title block (node
 * `4840-149395`). Most rows are simple `label : value`; two are
 * special-cased in JSX:
 * - **Placement Owner** carries an avatar + verified badge, so it
 *   uses `avatarUrl` + `verified`.
 * - **Revenue Potential** has a bold numeric value + a `/mo` suffix
 *   in regular weight, expressed via `valueSuffix` + `emphasizeValue`.
 */
export interface MetaPanelEntry {
  label: string;
  value: string;
  /** When set, an Avatar is rendered before the value. */
  avatarUrl?: string;
  /** When `true`, a small "verified" check is appended after `value`. */
  verified?: boolean;
  /** When set, `value` renders in semi-bold and `valueSuffix` is
   *  appended in medium weight (used for "$58k-$142k" + "/mo"). */
  valueSuffix?: string;
  /** Pair with `valueSuffix` to bold the value side. */
  emphasizeValue?: boolean;
}

/**
 * Walmart spark logo (Figma node 4840:146992 / parent 4845:150657
 * "Ted" image fill), inlined as a base64 PNG so the page no longer
 * needs the `apps/webapp/public/websitev5/` directory of static
 * assets. The original PNG is 225×225, 2 KB on disk — small enough
 * that a data URI is cheaper than the extra HTTP round-trip.
 */
const WALMART_LOGO_DATA_URI =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAw1BMVEUBUuL/xCAAUeP/yAAAUOQAT+UATecATuYAS+n/xwAATOj/xR3/ygAASur/xhj/xw4AR+wAUt/quTmKiJoAVddKasShlIo+Zcr0vySnl4WCgqgAVN1Ub7zIqGKRi5iJhp6vmnseWtZacrovXNedkYzjtUhuea1VbsDdski5nX90fqdTacwwYc/2vzDmtkDNqVW3oXCqlI1qfKq2nXeVkJCYjZNqebLbslNkdba9omsXXNI4ZsfEpmdnd68xYsyvmn/Nq1wO81ELAAAHFUlEQVR4nO2cW3faOBCAsWTLF8kSGHNJaUhIuKQNoWnZQJIWmv//q4ppgmVbctg95CC88z3kIcfmaDyj0cxopFoNAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACgDITQsYfwkaDAHVwPSGAfeyAfBYmHI0tYo2FMjj2UjyEcc8GpRTd/x96xB/MReBfMeoM1g2MP5/A4E99K8SfOsQd0cLwbLklIbypnp3YLWzJ+q2pKDPpZCUW/av7U+yIyEvIvVTPTvISichIG33MSfq/aeuE2cxJWbh46X3Oe5qt77CEdGOeKZSRkV1VbLezb3Hp4W7UEw5nyjIR8WjUJUWxROWqz4splwuQuI+Fd1RzNJjucZSSchcce0MEJv8kTkX+rWkizCdvuZQnF/emFNMhxXbvEewRtOagR30tCGmS7rmOaI0JBPPmxukWBdmDkIiPhhVZCRBqd1Y9J7Bm1nJDneZdhhqN/Gjof6a7kJV+sdM/ZtYcIb36qO782KHL1FlRsPSXF0UTjJJ2WHLZhTYqPwkmE//6UoAtjvBF5xLuVgLK22rzs60wl6ln9EGkz6aceDdGiHXN5qfNnHZUaUdxNn6JdVUiDvM5INmXKe2b4G+8sm/pR3vQUI7MjScJIoUI7bPJs8CrOzIh8SJdaWRHxS1wcWrhMh8+XRTWT+CWbfiSqNsJM0TOz8nDrsZ5/znuSJHzKOxFUX1FR+B32bIKZOp/zn36rxrmb85ZkmEoghrmQxiHz4nfauNyJCYui/VM1NktEnawU7qdUQvwpa8XeOlJ8po0Of5ogIWr4qsFZfBO3yONzJqkQLKMb5F3kXMwbfsMEK60FS/XwLPxLjnBQL/0Sfk9632n8UiowcUhmxOdkoTTTZIR3LclnBi9vZsrPJUcTtrpFF/Oq6pUh5ar6uW6IFPdTWeyp/7qs4LRIg4Imppq3xbkpaTJqLDVmllhqb6cH98oSnHJMr3bLnN071796Y8YsTLDRpa9To4imu8noDdqju5v2YPcPdx3p3uP+JTLBkb6CwvU904yVi7Vkk2E9THNItBYaJyXY0zQ0RoNbUDj4LYRyRvFI5y/cSC2gEL8HoUEKfAV58bCr9BrsUS2i86iagxR3h7Fh+nsDkV4z8otqEWfqZS04Kxo296NmQ5WaGAIi7niE8zLyuTpZ9+aFJ/3R2CXmypeASP3zOculefk4+5VgmNEh5ez8c92MjLAcJ5xeUtnpYE38nInZKeaX0/AU5Euww7gf7YxVFJLBN8jTLo5jUd+w+uE7oMBZLLerB2dLWz/yZVJ4osL/9mgbPv2KICfstLuMzfS131pSJ54x1m2v68bVuPfCDkIShqWlFkRCz6mfcsPpPpo5Se0BAAAA" +
  "h8IO6q5XL996cEMvONH1ELn1ztk2ptHvfG8W/L8xTSc8uZgGBeg1LqVsqS16IrSLSxe2e0oy2p6cW+AnnaEGaW6BTym3SPJDLueHrKPJDztyfugn+aEhNe5S3CTHzxbd9s3xBU5yfLONFREyHrG96zT3hSfxbGwbse+rBnmNi6hQh/oPtbYS73tMbG29FC/U08tVblpt66XmydhA4fNvrqt56+yOqGveVIhL02reKJw+Ma7eJeMidaU2Cev1VD/2WvMOTfYtTKoL27XSvaedCp1k72nUHuz+4U61e0/CpL2nPfcPG+TKwpxyYaX7h05Pt8Od7B8a0hJVq4Vle8BpkXC3B0ylPWDb65fsAReaco6Du9CpQXRb0jrhvbz5Ff4i/btkHx8vzKiBE00vBmW5Xoz0Q/iy/bmNXxo18qUR/ZeooW7F4Lk+YGcinXTO99No9oKxEaVG+6fSSEW0zi6D7qf0uUJPVEftU30jeqLkXifp68+dXCAjt7KLdi4IcJw5U1gqM+LINxqoehMXhVaYMNObWIhUw0eraKlm9CbWgkJ/KXtR3Avxbn9p7yX/qWjXjK6vfIpAeV8VODvv9Qgjry/yPcJG+NLNMpCJLvGs4zUUT73f571xOLPMnDalz7tGVlKDPd6vV/9a/VAg9+pjU3r1k/MWr4kTZVFrr/MWrKVZBoJWet7CpBtQyPW8ywT2o4fafmdmfO2ZGafxEPnGnZlJehN6rR+r25LN+Py5J33ESdDteNzqhWXnxI7Bvz27VrIOGHl27X28eUbCe1OaYw9H9c+Q1nPngA1Jbg8HqvxZ7kxIow1qThk7d6cCrdydCsV7oqomYf5uE1y5u03y99Pgyt1PQyp/x1D174n6H9z1VXkJyUPV52H1702skczdl/ymairMlcZpFe8vrXnNXRmNVvIO2uQe4b/H95J7hKuX4W/Z3gXNu6NhXEkNJqCAxNcxMa9Z5pBU/E52AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOwB/haHLwdYzsPgAAAABJRU5ErkJggg==";

export const META_PANEL_ENTRIES: MetaPanelEntry[] = [
  {
    label: "Placement Owner",
    value: "Walmart",
    avatarUrl: WALMART_LOGO_DATA_URI,
    verified: true,
  },
  { label: "Placement Style", value: "Carousel" },
  { label: "Partners", value: "Activated" },
  { label: "Octo", value: "Enabled" },
  { label: "In-Stream", value: "Pre/Mid/End Roll" },
  { label: "In-Feed", value: "Sponsored Post" },
  {
    label: "Revenue Potential",
    value: "$58k-$142k",
    valueSuffix: "/mo",
    emphasizeValue: true,
  },
];

/**
 * Status chip shown at the top of the title block. Green pill in
 * Figma (#E4F5D1 / #30520A).
 */
export const TITLE_TAG = "For Reach & Frequency" as const;

/**
 * Body-0 medium description rendered under the page title.
 */
export const TITLE_DESCRIPTION =
  "A strong price-driven CTA accelerates sell-through and protects margin before forced markdowns" as const;

/**
 * Three stat-shaped linkouts that replace the Figma's static
 * "99+ / Impressions / $20" cards. The numeric label is baked into
 * the linkout's `image` URL (a placeholder service that renders the
 * text as an image); the title and CTA carry the surrounding copy.
 *
 * Position is required by `LinkData`; we use 0/1/2 so the schema is
 * satisfied and the cards render in declaration order.
 */
export const STAT_LINKOUTS: LinkData[] = [
  {
    position: 0,
    link: "https://genuin.example/stats/brands",
    title: "Number of brands to include",
    // No image: each Row 2 cell shows the square video above and the
    // linkout card below, so the linkout's own thumbnail is redundant.
    // Omitting `image` also avoids the previous placeholder fetch
    // (`placehold.co/…`). Page CSS (`THUMBLESS_LINKOUT_STYLE`)
    // additionally suppresses the BaseContext `brandDetails.logo`
    // fallback when overrideStyles is on.
    description: "Brands in result",
    // Suppress the brand/website meta chip in `<ResponsiveChips>` —
    // explicit empty strings short-circuit the `?? brandDetails.name`
    // fallback in `linkout-item.tsx` so the dev brand ("Coldplay")
    // doesn't leak onto these demo cards.
    brand: "",
    website: "",
  },
  {
    position: 1,
    link: "https://genuin.example/stats/impressions",
    title: "Estimated impressions",
    description: "Across selected brands",
    brand: "",
    website: "",
  },
  {
    position: 2,
    link: "https://genuin.example/stats/cpm",
    title: "Effective CPM",
    description: "Per 1k impressions",
    brand: "",
    website: "",
  },
];

export const STAT_LINKOUT_CTA = "Get Started" as const;

/**
 * Row 1's right-rail stacked mini-cards rendered by `<MiniLinkoutCard>`.
 * Title + subtitle match the Figma reference (4845-149889):
 * "Advertiser Content" + ordinal placement. `description` doubles as
 * the body-3 subtitle. Images cycle different picsum seeds so each
 * card has a visually distinct thumbnail.
 */
export const STACKED_LINKOUTS: LinkData[] = [
  {
    position: 0,
    link: "https://genuin.example/stacked/1",
    title: "Advertiser Content",
    description: "1st Place",
    image: "https://picsum.photos/seed/stack-1/120/162",
  },
  {
    position: 1,
    link: "https://genuin.example/stacked/2",
    title: "Advertiser Content",
    description: "2nd Place",
    image: "https://picsum.photos/seed/stack-2/120/162",
  },
  {
    position: 2,
    link: "https://genuin.example/stacked/3",
    title: "Advertiser Content",
    description: "3rd Place",
    image: "https://picsum.photos/seed/stack-3/120/162",
  },
  {
    position: 3,
    link: "https://genuin.example/stacked/4",
    title: "Advertiser Content",
    description: "4th Place",
    image: "https://picsum.photos/seed/stack-4/120/162",
  },
  {
    position: 4,
    link: "https://genuin.example/stacked/5",
    title: "Advertiser Content",
    description: "5th Place",
    image: "https://picsum.photos/seed/stack-5/120/162",
  },
];

/**
 * Captions for the three "Based on your environment" video cells in
 * Row 4. Plain strings overlaid via JSX, not part of the video data.
 */
export const ENVIRONMENT_CAPTIONS: string[] = ["Mobile App", "Desktop Web", "Mobile Web"];

/**
 * "More styles to discover" Row 5 — three styles with image labels.
 * Same shape as `STAT_LINKOUTS`. Image fields are omitted because
 * Row 5 renders each linkout below its square `<ManagedVideo>` cell
 * — the video supplies the visual, so a sibling thumbnail in the
 * card body is redundant. Descriptions come verbatim from the Figma
 * card text nodes (4842:148212 / 4842:148403 / 4842:148594).
 */
export const MORE_STYLES_LINKOUTS: LinkData[] = [
  {
    position: 0,
    link: "https://genuin.example/styles/carousel",
    title: "Carousel",
    description: "Place above the fold to display your content",
    brand: "",
    website: "",
  },
  {
    position: 1,
    link: "https://genuin.example/styles/grid",
    title: "Grid",
    description: "Place below the fold to explore more",
    brand: "",
    website: "",
  },
  {
    position: 2,
    link: "https://genuin.example/styles/feed",
    title: "Feed",
    description: "You can enable the floater when user scroll up",
    brand: "",
    website: "",
  },
];

export const MORE_STYLES_CTA = "Get Started" as const;
