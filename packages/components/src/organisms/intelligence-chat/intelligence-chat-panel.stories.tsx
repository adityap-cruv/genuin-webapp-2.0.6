import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { expect, fn, userEvent, within } from "storybook/test";

import {
  REFERENCE_LAYOUT,
  REFERENCE_UP_NEXT_ARTICLES,
  SAILGP_EVENTS,
  SAILGP_LEADERBOARD_VIEWS,
} from "@genuin/components/organisms/intelligence-panel/intelligence-panel.fixtures";

import { IntelligenceChatPanel } from "./intelligence-chat-panel";
import type {
  IntelligenceChatMessage,
  IntelligenceResponseBlock,
  IntelligenceTextBlockProps,
} from "./intelligence-chat.types";
import {
  createIntelligenceDefaultRegistry,
  INTELLIGENCE_BLOCK_TYPES,
  INTELLIGENCE_DEFAULT_REGISTRY,
} from "./intelligence-default-registry";
import { defineIntelligenceBlock, mergeIntelligenceRegistries } from "./intelligence-response-registry";

/* -------------------------------------------------------------------------- */
/* Fixtures                                                                    */
/* -------------------------------------------------------------------------- */

const PANEL_SIZE = { width: 550, height: 818 };
const ARTICLE_SELECT_ACTION = fn();

const GIFT_GUIDE_TEXT: IntelligenceTextBlockProps = {
  title: "🎁 Meaningful Holiday Gifts for Friends & Family This Season",
  sections: [
    {
      heading: "Personalized Gifts",
      items: [
        {
          text: "Personalized photo archive",
          link: { label: "Custom photo book & Albums", href: "https://example.com/photo-books" },
        },
        { text: "Personalized necklace or birth-flower jewelry" },
      ],
    },
    {
      heading: "Experience Gifts (Memories > Objects)",
      items: [
        { text: "Cooking class or pottery workshop" },
        {
          text: "Concert or theater tickets",
          link: { label: "Go to ticketmaster", href: "https://www.ticketmaster.com" },
        },
        { text: "Spa day or wellness class" },
      ],
    },
    {
      heading: "Cozy & Comfort Gifts",
      items: [
        { text: "Custom illustration of a family or pet", link: { label: "(Etsy)", href: "https://www.etsy.com" } },
        { text: "Soft blanket or cozy slippers" },
        {
          text: "Matching pajamas",
          link: { label: "Shop Matching Pajamas at Old Navy", href: "https://oldnavy.gap.com" },
        },
        { text: "Board games or card games" },
      ],
    },
  ],
};

function userMessage(id: string, text: string): IntelligenceChatMessage {
  return {
    id,
    role: "user",
    blocks: [{ id: `${id}-text`, type: INTELLIGENCE_BLOCK_TYPES.userText, props: { text } }],
  };
}

function assistantMessage(id: string, blocks: readonly IntelligenceResponseBlock[]): IntelligenceChatMessage {
  return { id, role: "assistant", blocks, status: "complete" };
}

const ARTICLES_BLOCK: IntelligenceResponseBlock = {
  id: "articles-1",
  type: INTELLIGENCE_BLOCK_TYPES.articles,
  props: { articles: REFERENCE_UP_NEXT_ARTICLES, layout: { ...REFERENCE_LAYOUT.articleCard, height: "auto" } },
};

const LEADERBOARD_BLOCK: IntelligenceResponseBlock = {
  id: "leaderboard-1",
  type: INTELLIGENCE_BLOCK_TYPES.leaderboard,
  props: {
    views: SAILGP_LEADERBOARD_VIEWS,
    defaultViewId: "season",
    sourceLabel: "The Foil",
    fullStandingsHref: "https://thefoil.com/series/sailgp/results/",
  },
};

const CALENDAR_BLOCK: IntelligenceResponseBlock = {
  id: "calendar-1",
  type: INTELLIGENCE_BLOCK_TYPES.calendar,
  props: {
    title: "Season 6 Event Calendar",
    year: 2026,
    events: SAILGP_EVENTS,
    sourceLabel: "The Foil",
    fullCalendarHref: "https://thefoil.com/series/sailgp/events/",
  },
};

const REFERENCE_MESSAGES: readonly IntelligenceChatMessage[] = [
  userMessage("u1", "Meaningful Holiday Gifts for Friends & Family For This Summer"),
  assistantMessage("a1", [
    ARTICLES_BLOCK,
    { id: "text-1", type: INTELLIGENCE_BLOCK_TYPES.text, props: GIFT_GUIDE_TEXT },
  ]),
];

/* -------------------------------------------------------------------------- */
/* Mock responder — swap for the real transport in the consumer               */
/* -------------------------------------------------------------------------- */

function mockRespond(prompt: string, seq: number): IntelligenceResponseBlock[] {
  const lower = prompt.toLowerCase();
  const intro: IntelligenceResponseBlock = {
    id: `text-${seq}`,
    type: INTELLIGENCE_BLOCK_TYPES.text,
    props: { paragraphs: [`Here's what I found for "${prompt}".`] } satisfies IntelligenceTextBlockProps,
  };
  if (lower.includes("standing") || lower.includes("leaderboard")) {
    return [intro, { ...LEADERBOARD_BLOCK, id: `leaderboard-${seq}` }];
  }
  if (lower.includes("calendar") || lower.includes("schedule") || lower.includes("event")) {
    return [intro, { ...CALENDAR_BLOCK, id: `calendar-${seq}` }];
  }
  if (lower.includes("news") || lower.includes("article")) {
    return [intro, { ...ARTICLES_BLOCK, id: `articles-${seq}` }];
  }
  if (lower.includes("gift")) {
    return [{ id: `text-${seq}`, type: INTELLIGENCE_BLOCK_TYPES.text, props: GIFT_GUIDE_TEXT }];
  }
  return [
    {
      id: `text-${seq}`,
      type: INTELLIGENCE_BLOCK_TYPES.text,
      props: {
        paragraphs: [
          `I don't have a specific module for "${prompt}" yet.`,
          "Try asking about standings, the event calendar, latest news, or gift ideas.",
        ],
      } satisfies IntelligenceTextBlockProps,
    },
  ];
}

type InteractiveProps = {
  initialMessages?: readonly IntelligenceChatMessage[];
  registry?: typeof INTELLIGENCE_DEFAULT_REGISTRY;
  responseDelayMs?: number;
  onClose: () => void;
};

function InteractiveChat({
  initialMessages = [],
  registry = INTELLIGENCE_DEFAULT_REGISTRY,
  responseDelayMs = 600,
  onClose,
}: InteractiveProps) {
  const [messages, setMessages] = React.useState<readonly IntelligenceChatMessage[]>(initialMessages);
  const [isResponding, setIsResponding] = React.useState(false);
  const seq = React.useRef(0);

  const handleSend = (text: string) => {
    const n = ++seq.current;
    setMessages((prev) => [...prev, userMessage(`u-${n}`, text)]);
    setIsResponding(true);
    window.setTimeout(() => {
      setMessages((prev) => [...prev, assistantMessage(`a-${n}`, mockRespond(text, n))]);
      setIsResponding(false);
    }, responseDelayMs);
  };

  return (
    <IntelligenceChatPanel
      size={PANEL_SIZE}
      registry={registry}
      messages={messages}
      isResponding={isResponding}
      onSend={handleSend}
      onClose={onClose}
      emptyState={
        <p className="gencl:m-auto gencl:max-w-xs gencl:text-center gencl:text-body-1-medium gencl:text-secondary-600">
          Ask about standings, the event calendar, latest news, or gift ideas.
        </p>
      }
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Meta                                                                        */
/* -------------------------------------------------------------------------- */

const meta = {
  title: "Organisms/IntelligenceChatPanel",
  component: IntelligenceChatPanel,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: {
    size: PANEL_SIZE,
    registry: INTELLIGENCE_DEFAULT_REGISTRY,
    messages: REFERENCE_MESSAGES,
    onSend: fn(),
    onClose: fn(),
  },
  argTypes: {
    messages: { control: "object" },
    autoPromptCountdown: { control: "object" },
    isResponding: { control: "boolean" },
    inputDisabled: { control: "boolean" },
    placeholder: { control: "text" },
    onSend: { action: "send" },
    onClose: { action: "close" },
  },
} satisfies Meta<typeof IntelligenceChatPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/* -------------------------------------------------------------------------- */
/* Stories                                                                     */
/* -------------------------------------------------------------------------- */

/** The Figma reference: user prompt, article carousel, and a rich-text answer. */
export const ReferenceResponse: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "Intelligence" })).toBeInTheDocument();
    await expect(canvasElement.querySelectorAll('[data-slot="intelligence-chat-message"]')).toHaveLength(2);
    await expect(canvas.getByRole("heading", { name: GIFT_GUIDE_TEXT.title! })).toBeInTheDocument();

    const sendButton = canvas.getByRole("button", { name: "Send" });
    await expect(sendButton).toBeDisabled();

    await userEvent.type(canvas.getByLabelText("Ask Intelligence"), "Show me the standings");
    await expect(sendButton).toBeEnabled();
    await userEvent.keyboard("{Enter}");
    await expect(args.onSend).toHaveBeenCalledWith("Show me the standings");
    await expect(canvas.getByLabelText("Ask Intelligence")).toHaveValue("");
  },
};

/** Runtime card actions are injected by the host, not serialized into response props. */
export const ArticleSelectionAction: Story = {
  args: {
    registry: createIntelligenceDefaultRegistry({ onArticleSelect: ARTICLE_SELECT_ACTION }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const article = REFERENCE_UP_NEXT_ARTICLES[0]!;
    const firstArticleLink = canvas.getByRole("link", { name: article.title });

    ARTICLE_SELECT_ACTION.mockClear();
    await userEvent.click(firstArticleLink);
    await expect(ARTICLE_SELECT_ACTION).toHaveBeenCalledWith(article);
    await expect(firstArticleLink).toHaveAttribute("href", article.href);
  },
};

/** Type a prompt — "standings", "calendar", "news", or "gift" — and the mock responder picks a block. */
export const Interactive: Story = {
  render: ({ onClose }) => <InteractiveChat onClose={onClose} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText("Ask Intelligence"), "Show me the season standings{Enter}");
    await expect(await canvas.findByRole("status")).toBeInTheDocument();
    await expect(await canvas.findByRole("tab", { name: "Season standings" }, { timeout: 3000 })).toBeInTheDocument();
    await expect(canvas.getByLabelText("Ask Intelligence")).not.toBeDisabled();
  },
};

/** Leaderboard and calendar components rendered as chat response blocks. */
export const LeaderboardAndCalendarBlocks: Story = {
  args: {
    messages: [
      userMessage("u1", "Who's leading the season and when is the next race?"),
      assistantMessage("a1", [
        {
          id: "t1",
          type: INTELLIGENCE_BLOCK_TYPES.text,
          props: { paragraphs: ["Here are the current standings and the calendar."] },
        },
        LEADERBOARD_BLOCK,
        CALENDAR_BLOCK,
      ]),
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("tab", { name: "Season standings" })).toBeInTheDocument();
    await expect(canvas.getByRole("heading", { name: "Season 6 Event Calendar" })).toBeInTheDocument();
  },
};

/** Pending assistant response: composer is disabled and a status indicator shows. */
export const Responding: Story = {
  args: {
    messages: [userMessage("u1", "What's new?")],
    isResponding: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status")).toHaveTextContent("Thinking…");
    await expect(canvasElement.querySelectorAll('[data-slot="intelligence-chat-thinking-line"]')).toHaveLength(3);
    await expect(canvas.getByLabelText("Ask Intelligence")).toBeDisabled();
  },
};

/** Transient prompt preview shown only while an automatic send counts down. */
export const AutoPromptCountdown: Story = {
  args: {
    messages: [],
    autoPromptCountdown: {
      prompt: "Tell me more about this video.",
      remainingSeconds: 2,
    },
    inputDisabled: true,
    emptyState: null,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const status = canvas.getByRole("status");
    await expect(status).toHaveTextContent("Tell me more about this video.");
    await expect(status).toHaveTextContent("Prompting in...");
    await expect(status).toHaveTextContent("2");
    await expect(canvas.getByLabelText("Ask Intelligence")).toBeDisabled();
  },
};

/**
 * Responsive check: no `size` → the panel fills its parent. Wrap it in a
 * viewport-sized frame (how a mobile sheet or a page column would mount it).
 */
export const FullViewport: Story = {
  parameters: { layout: "fullscreen" },
  args: { size: undefined, messages: REFERENCE_MESSAGES },
  render: (args) => (
    <div style={{ height: "100dvh", width: "100vw", padding: 8, boxSizing: "border-box" }}>
      <IntelligenceChatPanel {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const panel = canvasElement.querySelector<HTMLElement>('[data-slot="intelligence-chat-panel"]');
    await expect(panel).not.toBeNull();
    await expect(panel!.getBoundingClientRect().width).toBeLessThanOrEqual(window.innerWidth);
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  },
};

/** Empty thread with the consumer-provided empty state. */
export const Empty: Story = {
  args: {
    messages: [],
    emptyState: (
      <p className="gencl:m-auto gencl:text-center gencl:text-body-1-medium gencl:text-secondary-600">
        Ask anything to get started.
      </p>
    ),
  },
};

/* Custom block: any component can be registered under a new type key. */
type ScoreCardProps = { team: string; score: number; note?: string };
const ScoreCard = defineIntelligenceBlock<ScoreCardProps>(function ScoreCard({ team, score, note }) {
  return (
    <div
      data-slot="story-score-card"
      className="gencl:flex gencl:items-center gencl:justify-between gencl:rounded-lg gencl:bg-primary-50 gencl:p-3">
      <span className="gencl:text-body-0-semi-bold gencl:text-secondary-900">{team}</span>
      <span className="gencl:text-headline-4 gencl:font-semibold gencl:text-primary">{score}</span>
      {note && <span className="gencl:text-body-2-medium gencl:text-secondary-600">{note}</span>}
    </div>
  );
});

const CUSTOM_REGISTRY = mergeIntelligenceRegistries(INTELLIGENCE_DEFAULT_REGISTRY, { "score-card": ScoreCard });

/** Registering a consumer component (`score-card`) and an unknown type's graceful fallback. */
export const CustomRegisteredBlock: Story = {
  args: {
    registry: CUSTOM_REGISTRY,
    messages: [
      userMessage("u1", "Australia's score?"),
      assistantMessage("a1", [
        { id: "s1", type: "score-card", props: { team: "Australia", score: 94, note: "after Portsmouth" } },
        { id: "x1", type: "hologram", props: {} },
      ]),
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvasElement.querySelector('[data-slot="story-score-card"]')).not.toBeNull();
    await expect(canvas.getByRole("note")).toHaveTextContent("hologram");
  },
};
