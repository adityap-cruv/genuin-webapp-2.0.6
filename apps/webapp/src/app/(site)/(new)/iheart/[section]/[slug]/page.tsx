import { Image } from "@genuin/ui/components/image";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";

import {
  fetchIHeartContent,
  type IHeartContentBlock,
  validateIHeartSource,
} from "@lib/iheart-content";

import { IHeartContestEmbed } from "./iheart-contest-embed";

type PageProps = {
  params: Promise<{ section: string; slug: string }>;
  searchParams: Promise<{ source?: string | string[]; title?: string | string[] }>;
};

const getContent = cache(fetchIHeartContent);

const richTextClassName =
  "gencl:text-body-1 gencl:leading-7 gencl:text-secondary-800 gencl:[&_a]:font-semibold gencl:[&_a]:text-primary-500 gencl:[&_a]:underline gencl:[&_a]:underline-offset-2";

function RichContentBlock({ block }: { block: IHeartContentBlock }) {
  if (block.type === "contest") {
    return <IHeartContestEmbed campaignId={block.campaignId} campaignType={block.campaignType} />;
  }

  if (block.type === "paragraph") {
    return <p className={richTextClassName} dangerouslySetInnerHTML={{ __html: block.html }} />;
  }

  if (block.type === "heading") {
    const className =
      "gencl:pt-3 gencl:text-heading-4 gencl:leading-tight gencl:text-secondary-900 gencl:[&_a]:text-primary-500 gencl:[&_a]:underline";
    if (block.level === 2) return <h2 className={className} dangerouslySetInnerHTML={{ __html: block.html }} />;
    if (block.level === 3) return <h3 className={className} dangerouslySetInnerHTML={{ __html: block.html }} />;
    if (block.level === 4) return <h4 className={className} dangerouslySetInnerHTML={{ __html: block.html }} />;
    if (block.level === 5) return <h5 className={className} dangerouslySetInnerHTML={{ __html: block.html }} />;
    return <h6 className={className} dangerouslySetInnerHTML={{ __html: block.html }} />;
  }

  if (block.type === "quote") {
    return (
      <blockquote
        className={`${richTextClassName} gencl:border-l-4 gencl:border-primary-500 gencl:py-2 gencl:pl-5 gencl:text-heading-5 gencl:italic`}
        dangerouslySetInnerHTML={{ __html: block.html }}
      />
    );
  }

  if (block.type === "list") {
    const List = block.ordered ? "ol" : "ul";
    return (
      <List
        className={`${richTextClassName} gencl:space-y-2 gencl:pl-6 ${
          block.ordered ? "gencl:list-decimal" : "gencl:list-disc"
        }`}>
        {block.items.map((item, index) => (
          <li key={`${index}-${item.slice(0, 24)}`} dangerouslySetInnerHTML={{ __html: item }} />
        ))}
      </List>
    );
  }

  if (block.type === "image") {
    return (
      <figure className="gencl:py-2">
        <Image
          src={block.src}
          alt={block.alt}
          width={1200}
          height={675}
          useWebp={false}
          className="gencl:max-h-[620px] gencl:w-full gencl:rounded-lg gencl:object-contain"
        />
        {block.alt && (
          <figcaption className="gencl:mt-2 gencl:text-center gencl:text-body-3 gencl:text-secondary-500">
            {block.alt}
          </figcaption>
        )}
      </figure>
    );
  }

  if (block.type === "embed") {
    return (
      <div className="gencl:aspect-video gencl:w-full gencl:overflow-hidden gencl:rounded-lg gencl:bg-secondary-100">
        <iframe
          src={block.src}
          title={block.title}
          loading="lazy"
          allow="autoplay; encrypted-media; picture-in-picture"
          sandbox="allow-forms allow-popups allow-same-origin allow-scripts"
          className="gencl:h-full gencl:w-full gencl:border-0"
        />
      </div>
    );
  }

  return (
    <Link
      href={block.href}
      className="gencl:inline-flex gencl:w-fit gencl:rounded-full gencl:bg-primary-500 gencl:px-5 gencl:py-2.5 gencl:text-body-2-bold gencl:text-white gencl:no-underline">
      {block.label}
    </Link>
  );
}

function formatDate(value?: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

async function resolveContent(props: PageProps) {
  const [{ section }, searchParams] = await Promise.all([props.params, props.searchParams]);
  if (!["articles", "promotions"].includes(section)) notFound();

  const source = Array.isArray(searchParams.source) ? searchParams.source[0] : searchParams.source;
  const title = Array.isArray(searchParams.title) ? searchParams.title[0] : searchParams.title;
  if (!source || !validateIHeartSource(source)) notFound();

  return getContent(source, title);
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  try {
    const content = await resolveContent(props);
    return {
      title: content.title,
      description: content.description ?? content.paragraphs[0],
      openGraph: content.image ? { images: [{ url: content.image }] } : undefined,
    };
  } catch {
    return { title: "iHeart content" };
  }
}

export default async function IHeartContentPage(props: PageProps) {
  let content;
  try {
    content = await resolveContent(props);
  } catch {
    return (
      <main className="theme-iheart gencl:flex gencl:min-h-full gencl:items-center gencl:justify-center gencl:bg-white gencl:px-6 gencl:py-16">
        <div className="gencl:max-w-lg gencl:text-center">
          <h1 className="gencl:text-heading-3 gencl:text-secondary-900">Unable to load this content</h1>
          <p className="gencl:mt-3 gencl:text-body-2 gencl:text-secondary-600">
            The selected iHeart page is temporarily unavailable.
          </p>
          <Link
            href="/home"
            className="gencl:mt-6 gencl:inline-flex gencl:rounded-full gencl:bg-primary-500 gencl:px-5 gencl:py-2.5 gencl:text-body-2-bold gencl:text-white gencl:no-underline">
            Back to iHeart
          </Link>
        </div>
      </main>
    );
  }

  if (content.canEmbedOriginal && content.originalUrl) {
    return (
      <main className="theme-iheart gencl:flex gencl:h-full gencl:min-h-0 gencl:flex-col gencl:bg-white">
        <div className="gencl:flex gencl:h-12 gencl:shrink-0 gencl:items-center gencl:justify-between gencl:border-b gencl:border-secondary-150 gencl:px-4 gencl:sm:px-6">
          <Link
            href="/home"
            className="gencl:inline-flex gencl:items-center gencl:text-body-2-medium gencl:text-secondary-600 gencl:no-underline hover:gencl:text-secondary-900">
            ← Back to iHeart
          </Link>
          <p className="gencl:truncate gencl:pl-4 gencl:text-body-3 gencl:text-secondary-500">
            Original iHeart page
          </p>
        </div>
        <iframe
          src={content.originalUrl}
          title={content.title}
          allow="autoplay; encrypted-media; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts"
          className="gencl:min-h-0 gencl:w-full gencl:flex-1 gencl:border-0 gencl:bg-white"
        />
      </main>
    );
  }

  const publishedAt = formatDate(content.publishedAt);
  const startDate = formatDate(content.startDate);
  const endDate = formatDate(content.endDate);
  const hasContestExperience = content.blocks.some((block) => block.type === "contest");

  return (
    <main className="theme-iheart gencl:h-full gencl:overflow-y-auto gencl:bg-white">
      <article className="gencl:mx-auto gencl:w-full gencl:max-w-[860px] gencl:px-5 gencl:py-8 gencl:sm:px-8 gencl:lg:py-12">
        <Link
          href="/home"
          className="gencl:inline-flex gencl:items-center gencl:text-body-2-medium gencl:text-secondary-600 gencl:no-underline hover:gencl:text-secondary-900">
          ← Back to iHeart
        </Link>

        <header className="gencl:mt-8 gencl:border-b gencl:border-secondary-150 gencl:pb-6">
          <p className="gencl:text-label-2 gencl:font-bold gencl:uppercase gencl:tracking-wider gencl:text-primary-500">
            {content.kind === "promotion" ? "Contest & Promotion" : content.kind}
          </p>
          <h1 className="gencl:mt-3 gencl:text-heading-2 gencl:leading-tight gencl:text-secondary-900">
            {content.title}
          </h1>
          {(content.author || publishedAt || startDate || endDate) && (
            <div className="gencl:mt-4 gencl:flex gencl:flex-wrap gencl:gap-x-4 gencl:gap-y-1 gencl:text-body-3 gencl:text-secondary-600">
              {content.author && <span>By {content.author}</span>}
              {publishedAt && <time dateTime={content.publishedAt}>{publishedAt}</time>}
              {startDate && <span>Starts {startDate}</span>}
              {endDate && <span>Ends {endDate}</span>}
            </div>
          )}
        </header>

        {content.image && !hasContestExperience && (
          <Image
            src={content.image}
            alt=""
            width={1200}
            height={675}
            useWebp={false}
            className="gencl:mt-7 gencl:max-h-[520px] gencl:w-full gencl:rounded-lg gencl:object-cover"
          />
        )}

        <div className="gencl:mx-auto gencl:mt-8 gencl:max-w-[720px] gencl:space-y-5">
          {content.blocks.length > 0 ? (
            content.blocks.map((block, index) => (
              <RichContentBlock
                key={`${index}-${block.type === "image" || block.type === "embed" ? block.src : block.type}`}
                block={block}
              />
            ))
          ) : (
            <p className="gencl:text-body-1 gencl:text-secondary-700">
              This iHeart page does not provide any additional readable content.
            </p>
          )}
        </div>
      </article>
    </main>
  );
}
