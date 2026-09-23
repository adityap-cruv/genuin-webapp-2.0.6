"use client";

import { Image } from "@genuin/ui/components/image";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@genuin/ui/hover-card";
import { cn } from "@genuin/ui/lib/utils";
import { useMemo, useState, type ReactNode } from "react";
import { useMediaQuery } from "usehooks-ts";

import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { CommunityHoverCard } from "@genuin/components/molecules/feed-player/pills/community-hover-card";
import { GroupHoverCard } from "@genuin/components/molecules/feed-player/pills/group-hover-card";
import { Pills } from "@genuin/components/molecules/feed-player/pills/pills";
import { Link } from "@genuin/components/molecules/link";
import { useCategory } from "@genuin/components/react-query/api/category/category";
import {
  setQueryDataForCommunityRoleChange,
  useGetCommunityDetails,
} from "@genuin/components/react-query/api/community/details/details";
import {
  setQueryDataForJoinGroupInGroupDetails,
  setQueryDataForSubscribeGroupInGroupDetails,
  useGetGroupDetails,
} from "@genuin/components/react-query/api/group/details/details";
import { getTrendingGroups as useTrendingGroups } from "@genuin/components/react-query/api/group/trending/trending";
import type { CommunityUserRole } from "@genuin/components/types/post";
import type { GroupUserStatusType } from "@genuin/components/types/roles";

import type { Article, ArticleBlock } from "./article-data";

/**
 * Shared reader entrance motion; both route and inline compositions opt into it.
 *
 * Transform-only on purpose: animating from `opacity: 0` hid the headline/dek (the LCP element)
 * until the animation finished, which Chrome counts as a ~3s LCP render delay. A composited
 * translate keeps the entrance without delaying first contentful/largest paint.
 */
export const ARTICLE_READER_MOTION_CSS = `
.gen-article-reveal {
  animation: gen-article-rise 520ms cubic-bezier(0.22, 1, 0.36, 1) both;
}
.gen-article-reveal-delay-1 { animation-delay: 60ms; }
.gen-article-reveal-delay-2 { animation-delay: 120ms; }
.gen-article-reveal-delay-3 { animation-delay: 180ms; }
@keyframes gen-article-rise {
  from { transform: translateY(12px); }
  to { transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  .gen-article-reveal { animation: none; }
}
`;

/**
 * Editorial typography for the reader — a long-form reading scale (serif body on a ~680px
 * measure, sans headline/UI) rather than the app's product scale.
 *
 * Shipped as literal CSS in a `<style>` tag, NOT as `gencl:` utilities: the webapp consumes
 * `@genuin/components` as a prebuilt CSS bundle, so brand-new utility classes wouldn't be
 * compiled in (same reason as `ARTICLE_LAYOUT_CSS`).
 *
 * Two rules make this survive BOTH hosts. The reader also renders inside the Web SDK's shadow
 * root (the inline Feed View article), and the SDK compiles Tailwind with `important: true` —
 * `.gencl\:text-\[14px\]{font-size:14px !important}` — while it also resets every descendant
 * with `.gen-sdk-class *:not([data-koah]) { margin/padding: revert-layer }` (specificity 0,2,0).
 * So:
 *   1. The reader renders semantic elements, not the `Text`/`Heading` atoms, so no `!important`
 *      utility is emitted to fight in the first place (an `!important` declaration cannot be
 *      outranked by specificity).
 *   2. Every selector below is anchored on the scroller's two classes
 *      (`.gen-article-prose.gen-article-page …`, specificity 0,3,0) so it outranks the SDK's
 *      0,2,0 margin/padding reset.
 * Changing either of those without the other reintroduces the bug in the inline view only.
 */
export const ARTICLE_READER_TYPOGRAPHY_CSS = `
.gen-article-prose.gen-article-page {
  /* Fluid type below sizes off THIS column's width (cqi), not the viewport: the reader also
     renders inside the narrow inline Feed View panel, where vw-based clamps blew the headline
     up to full-page size. The scroller declares the container (see ARTICLE_LAYOUT_CSS). */
  --gen-article-serif: Charter, "Bitstream Charter", "Sitka Text", Cambria, Georgia, "Times New Roman", serif;
  --gen-article-ink: #1a1a1a;
  --gen-article-ink-soft: #5c5c5c;
  --gen-article-measure: 44rem;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

/* --- headline block ---------------------------------------------------- */
.gen-article-prose.gen-article-page .gen-article-kicker {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 0.875rem;
}
.gen-article-prose.gen-article-page .gen-article-title {
  font-size: 2.25rem;
  font-size: clamp(2rem, 1.35rem + 2.6cqi, 3.125rem);
  line-height: 1.15;
  letter-spacing: -0.022em;
  font-weight: 700;
  color: var(--gen-article-ink);
  max-width: 52rem;
  text-wrap: balance;
}
.gen-article-prose.gen-article-page .gen-article-dek {
  font-family: var(--gen-article-serif);
  font-size: 1.25rem;
  font-size: clamp(1.125rem, 1.02rem + 0.6cqi, 1.375rem);
  line-height: 1.5;
  letter-spacing: -0.003em;
  color: var(--gen-article-ink-soft);
  margin-top: 1rem;
  max-width: var(--gen-article-measure);
}
/* Narrow: the author and the date stack, and the separator goes with them. A wrapping flex row
   left the bullet stranded at the end of the author's line — a separator only means something
   between two things ON THE SAME LINE. The row (with the bullet) returns once both fit. */
.gen-article-prose.gen-article-page .gen-article-byline {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
  margin-top: 1.75rem;
  padding-top: 1.25rem;
  padding-bottom: 1.25rem;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  font-size: 0.875rem;
  line-height: 1.4;
  color: var(--gen-article-ink-soft);
}
.gen-article-prose.gen-article-page .gen-article-byline-author { font-weight: 600; color: var(--gen-article-ink); }
.gen-article-prose.gen-article-page .gen-article-byline-dot { display: none; color: rgba(0, 0, 0, 0.25); }
.gen-article-prose.gen-article-page .gen-article-event-meta {
  margin-top: 1.25rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  color: var(--gen-article-ink-soft);
}
.gen-article-prose.gen-article-page .gen-article-event-date { font-weight: 600; color: var(--gen-article-ink); }

/* --- body -------------------------------------------------------------- */
.gen-article-prose.gen-article-page .gen-article-body { max-width: var(--gen-article-measure); }
.gen-article-prose.gen-article-page .gen-article-p {
  font-family: var(--gen-article-serif);
  font-size: 1.25rem;
  line-height: 1.75;
  letter-spacing: -0.003em;
  color: #292929;
  margin: 0 0 1.6rem;
}
.gen-article-prose.gen-article-page .gen-article-body > .gen-article-p:first-child { margin-top: 0; }
.gen-article-prose.gen-article-page .gen-article-h2 {
  font-size: 1.5rem;
  font-size: clamp(1.375rem, 1.18rem + 1.1cqi, 1.75rem);
  line-height: 1.3;
  letter-spacing: -0.016em;
  font-weight: 700;
  color: var(--gen-article-ink);
  margin: 2.75rem 0 0.75rem;
  text-wrap: balance;
}
.gen-article-prose.gen-article-page .gen-article-figure { margin: 2.5rem 0; }
.gen-article-prose.gen-article-page .gen-article-media {
  overflow: hidden;
  border-radius: 12px;
  background: #f1f1f1;
}
.gen-article-prose.gen-article-page .gen-article-figcaption {
  margin-top: 0.75rem;
  text-align: center;
  font-size: 0.8125rem;
  line-height: 1.5;
  color: #757575;
}
.gen-article-prose.gen-article-page .gen-article-hero { margin-bottom: 2.5rem; }
.gen-article-prose.gen-article-page a { color: inherit; text-underline-offset: 3px; }
.gen-article-prose.gen-article-page .gen-article-keyword { text-decoration: underline; text-underline-offset: 3px; }

@container gen-article (min-width: 560px) {
  .gen-article-prose.gen-article-page .gen-article-byline {
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
  }
  .gen-article-prose.gen-article-page .gen-article-byline-dot { display: inline; }
}
@container gen-article (min-width: 700px) {
  /* Images breathe past the text measure without leaving the column. */
  .gen-article-prose.gen-article-page .gen-article-figure,
  .gen-article-prose.gen-article-page .gen-article-hero { max-width: min(100%, 52rem); }
}
`;

const KIND_LABEL: Record<Article["kind"], string> = {
  news: "News",
  interview: "Interview",
  podcast: "Podcast",
  event: "Event",
};

/**
 * One route-neutral body block shared by full-page and inline article readers.
 *
 * Deliberately plain semantic elements rather than the `Text`/`Heading` atoms: the reader runs its
 * own editorial type scale (see {@link ARTICLE_READER_TYPOGRAPHY_CSS}), and inside the Web SDK the
 * atoms' utilities are compiled `!important`, which no amount of specificity can override.
 */
function ArticleBodyBlock({ block, children }: { block: ArticleBlock; children?: ReactNode }) {
  if (block.type === "heading") {
    return <h2 className="gen-article-h2">{children ?? block.text}</h2>;
  }

  if (block.type === "image") {
    return (
      <figure className="gen-article-figure">
        <div className="gen-article-media">
          <Image src={block.src} alt={block.alt ?? ""} handleError className="gencl:w-full gencl:object-cover" />
        </div>
        {block.caption ? <figcaption className="gen-article-figcaption">{block.caption}</figcaption> : null}
      </figure>
    );
  }

  return <p className="gen-article-p">{children ?? block.text}</p>;
}

/** The community / group pills above the byline, from the article's own attribution. */
function ArticleHeaderPills({ article }: { article: Article }) {
  const { data: communityDetails } = useGetCommunityDetails(
    article.community?.slug ?? "",
    Boolean(article.community?.slug)
  );
  const { data: groupDetails } = useGetGroupDetails(article.group?.slug ?? "", Boolean(article.group?.slug));

  const [communityRoleOverride, setCommunityRoleOverride] = useState<CommunityUserRole | null>(null);
  const [groupSubscriptionOverride, setGroupSubscriptionOverride] = useState<boolean | null>(null);
  const [groupRoleOverride, setGroupRoleOverride] = useState<GroupUserStatusType | null>(null);

  const mergedCommunity = useMemo(() => {
    if (!article.community) return undefined;
    return {
      ...article.community,
      userRole: communityRoleOverride ?? communityDetails?.logged_in_user_role ?? article.community.userRole,
      membersCount: communityDetails?.no_of_members ?? article.community.membersCount,
      groupsCount: communityDetails?.no_of_loops ?? article.community.groupsCount,
      postsCount: communityDetails?.no_of_videos ?? article.community.postsCount,
    };
  }, [article.community, communityDetails, communityRoleOverride]);

  const mergedGroup = useMemo(() => {
    if (!article.group) return undefined;
    return {
      ...article.group,
      isSubscribed: groupSubscriptionOverride ?? groupDetails?.isSubscriber ?? article.group.isSubscribed,
      role: groupRoleOverride ?? groupDetails?.role ?? article.group.role,
    };
  }, [article.group, groupDetails, groupSubscriptionOverride, groupRoleOverride]);

  if (!mergedCommunity) return null;

  return (
    <div className="gencl:mt-4 gencl:flex gencl:items-center gencl:gap-2">
      <Pills
        communityDetails={mergedCommunity}
        groupDetails={mergedGroup}
        isHoverable
        variant="light"
        onCommunityJoinStatusChange={(newRole) => {
          setCommunityRoleOverride(newRole);
          if (article.community?.slug) {
            setQueryDataForCommunityRoleChange(article.community.slug, newRole);
          }
        }}
        onGroupSubscriptionChange={(isSubscribed) => {
          setGroupSubscriptionOverride(isSubscribed);
          if (article.group?.slug) {
            setQueryDataForSubscribeGroupInGroupDetails(article.group.slug, isSubscribed);
          }
        }}
        onGroupJoinStatusChange={(newRole) => {
          setGroupRoleOverride(newRole);
          if (article.group?.slug) {
            setQueryDataForJoinGroupInGroupDetails(article.group.slug, newRole);
          }
        }}
      />
    </div>
  );
}

/** Canonical article headline and metadata, independent of route/navigation chrome. */
export function ArticleReaderHeader({ article, className }: { article: Article; className?: string }) {
  const isEvent = article.kind === "event";

  return (
    <header className={cn("gen-article-reveal", className)}>
      <p className="gen-article-kicker">{KIND_LABEL[article.kind]}</p>

      <h1 className="gen-article-title">{article.title}</h1>

      {article.standfirst ? <p className="gen-article-dek">{article.standfirst}</p> : null}

      {isEvent && (article.eventDate || article.location) ? (
        <div className="gen-article-event-meta">
          {article.eventDate ? <span className="gen-article-event-date">{article.eventDate}</span> : null}
          {article.eventDate && article.location ? (
            <span aria-hidden className="gen-article-byline-dot">
              •
            </span>
          ) : null}
          {article.location ? <span>{article.location}</span> : null}
        </div>
      ) : null}

      {/* Community & group pills — same affordance as the feed player's. */}
      <ArticleHeaderPills article={article} />

      {article.author || article.publishedAt ? (
        <div className="gen-article-byline">
          {article.author ? <span className="gen-article-byline-author">{article.author}</span> : null}
          {article.author && article.publishedAt ? (
            <span aria-hidden className="gen-article-byline-dot">
              •
            </span>
          ) : null}
          {article.publishedAt ? <span>{article.publishedAt}</span> : null}
        </div>
      ) : null}
    </header>
  );
}

/** Canonical article hero and body, shared without mounting any SDK placements. */
export function ArticleReaderBody({ article, className }: { article: Article; className?: string }) {
  const { data: categories } = useCategory();
  const { data: groups } = useTrendingGroups();
  const [active, setActive] = useState<{ key: string; kind: "community" | "group"; slug: string } | null>(null);
  const canHover = useMediaQuery("(hover: hover) and (pointer: fine)", { initializeWithValue: false });
  const { data: community } = useGetCommunityDetails(
    active?.kind === "community" ? active.slug : "",
    active?.kind === "community"
  );
  const { data: group } = useGetGroupDetails(active?.kind === "group" ? active.slug : "", active?.kind === "group");

  const keywords = useMemo(() => {
    type Target = { kind: "community" | "group"; slug: string };
    const names = new Map<string, Target | null>();
    const add = (name: string | null | undefined, target: Target) => {
      const normalized = (name ?? "").trim().replace(/\s+/gu, " ").toLowerCase();
      if (!normalized || !target.slug) return;
      const previous = names.get(normalized);
      // Shared names are ambiguous; don't link to an arbitrary community/group.
      names.set(
        normalized,
        previous === null || (previous && (previous.kind !== target.kind || previous.slug !== target.slug))
          ? null
          : target
      );
    };
    categories?.categories.forEach((category) =>
      category.communities.forEach((item) => add(item.community_name, { kind: "community", slug: item.slug }))
    );
    groups?.groups?.forEach((item: { slug: string; group: { group_name: string } }) =>
      add(item.group.group_name, { kind: "group", slug: item.slug })
    );
    const alternatives = [...names]
      .filter(([, target]) => target)
      .map(([name]) => name)
      .sort((a, b) => b.length - a.length)
      .map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/ /g, "\\s+"));
    return {
      names,
      pattern: alternatives.length
        ? new RegExp(`(?<![\\p{L}\\p{N}\\p{M}_])(${alternatives.join("|")})(?![\\p{L}\\p{N}\\p{M}_])`, "giu")
        : null,
    };
  }, [categories, groups]);

  const preview =
    active?.kind === "community" && community ? (
      <CommunityHoverCard
        communityDetails={{
          id: community.community_id,
          slug: community.slug,
          name: community.name,
          handle: community.handle,
          profileImage: community.dp_s ?? community.dp_m ?? community.dp,
          isPrivate: community.type === "PRIVATE",
          shareUrl: community.share_url,
          userRole: community.logged_in_user_role,
          membersCount: community.no_of_members,
          groupsCount: community.no_of_loops,
          postsCount: community.no_of_videos,
          brand: community.brand && {
            id: community.brand.brand_id,
            name: community.brand.name,
            logo: community.brand.logo,
            webLogo: community.brand.brand_web_logo,
            slug: community.brand.brand_slug,
            userLogo: community.brand.brand_user_logo,
            handle: community.brand.brand_handle,
          },
        }}
        onCommunityJoinStatusChange={(role) => setQueryDataForCommunityRoleChange(community.slug, role)}
      />
    ) : active?.kind === "group" && group ? (
      <GroupHoverCard
        groupDetails={{ ...group, description: group.description ?? "", isSubscribed: group.isSubscriber }}
        communityDetails={{
          name: group.community.name,
          slug: group.community.slug,
          profileImage: group.community.dpM ?? group.community.dp,
        }}
        onGroupJoinStatusChange={(role) => setQueryDataForJoinGroupInGroupDetails(group.slug, role)}
        onGroupSubscriptionChange={(subscribed) => setQueryDataForSubscribeGroupInGroupDetails(group.slug, subscribed)}
      />
    ) : null;

  const renderText = (text: string, blockIndex: number) => {
    const linkedEntities = new Set<string>();
    return !keywords.pattern
      ? text
      : text.split(keywords.pattern).map((part, index) => {
          const entity = index % 2 ? keywords.names.get(part.trim().replace(/\s+/gu, " ").toLowerCase()) : null;
          if (!entity) return part;
          const entityKey = `${entity.kind}:${entity.slug}`;
          if (linkedEntities.has(entityKey)) return part;
          linkedEntities.add(entityKey);
          const key = `${article.slug}:${blockIndex}:${index}`;
          const link = (
            <Link
              key={key}
              className="gen-article-keyword"
              href={buildPageUrl({ type: entity.kind, slug: encodeURIComponent(entity.slug) })}>
              {part}
            </Link>
          );
          if (!canHover) return link;
          return (
            <HoverCard
              key={key}
              open={active?.key === key}
              openDelay={300}
              closeDelay={200}
              onOpenChange={(open) =>
                setActive((current) => (open ? { key, ...entity } : current?.key === key ? null : current))
              }>
              <HoverCardTrigger asChild>{link}</HoverCardTrigger>
              <HoverCardContent align="start" className="gencl:max-w-md! gencl:min-w-80">
                {active?.key === key && preview}
              </HoverCardContent>
            </HoverCard>
          );
        });
  };

  return (
    <article className={cn("gen-article-main gen-article-reveal gen-article-reveal-delay-2", className)}>
      <div className="gen-article-hero gen-article-media">
        <Image
          src={article.heroImage.src}
          alt={article.heroImage.alt}
          handleError
          className="gencl:w-full gencl:object-cover"
        />
      </div>

      <div data-slot="article-body" className="gen-article-body">
        {article.body.map((block, index) => (
          <ArticleBodyBlock key={index} block={block}>
            {block.type !== "image" ? renderText(block.text, index) : null}
          </ArticleBodyBlock>
        ))}
      </div>
    </article>
  );
}
