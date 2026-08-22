import type { ComponentPropsWithoutRef, ComponentType, ReactNode } from "react";

import type { IntelligencePanelShellProps } from "@genuin/components/organisms/intelligence-panel/intelligence-panel.types";

/** Who authored a message in the Intelligence thread. */
export type IntelligenceChatRole = "user" | "assistant";

/** Lifecycle of an individual message. */
export type IntelligenceChatMessageStatus = "streaming" | "complete" | "error";

/**
 * One renderable unit inside an assistant (or user) message.
 *
 * Blocks are type-keyed and JSON-safe so a backend can drive them directly.
 * `type` is resolved against the registry supplied to the panel — the panel
 * itself never imports response components.
 */
export type IntelligenceResponseBlock<TProps = unknown> = {
  /** Stable identity for React keys and incremental updates. */
  id: string;
  /** Registry key selecting the component that renders this block. */
  type: string;
  /** Props forwarded verbatim to the registered component. */
  props: TProps;
};

/** A message in the Intelligence chat thread. */
export type IntelligenceChatMessage = {
  id: string;
  role: IntelligenceChatRole;
  blocks: readonly IntelligenceResponseBlock[];
  /** @default "complete" */
  status?: IntelligenceChatMessageStatus;
};

/** Props every registered response component receives in addition to its own. */
export type IntelligenceResponseBlockContext = {
  /** The block being rendered (id/type), useful for analytics or keys. */
  block: IntelligenceResponseBlock;
  /** The owning message. */
  message: IntelligenceChatMessage;
};

/**
 * Component that renders a response block. It receives the block's `props`
 * spread onto it plus a `blockContext` describing where it is rendered.
 */
// `any` default: registry entries are heterogeneous by design; callers type each entry via `defineIntelligenceBlock`.
export type IntelligenceResponseComponent<TProps = any> = ComponentType<
  TProps & { blockContext: IntelligenceResponseBlockContext }
>;

/** Map from block `type` → component. */
export type IntelligenceResponseRegistry = Readonly<Record<string, IntelligenceResponseComponent>>;

/** Props for the provider that exposes a registry to a subtree. */
export interface IntelligenceRegistryProviderProps {
  registry: IntelligenceResponseRegistry;
  children: ReactNode;
}

/** Props for the block renderer. */
export interface IntelligenceResponseRendererProps {
  block: IntelligenceResponseBlock;
  message: IntelligenceChatMessage;
  /** Rendered when `block.type` is missing from the registry. */
  fallback?: ReactNode;
}

/** Built-in `text` block — a lightweight rich-text response. */
export type IntelligenceTextBlockLink = {
  label: string;
  href: string;
};

export type IntelligenceTextBlockItem = {
  text: string;
  /** Optional trailing link, rendered beneath the item text. */
  link?: IntelligenceTextBlockLink;
};

export type IntelligenceTextBlockSection = {
  heading: string;
  items: readonly IntelligenceTextBlockItem[];
};

export type IntelligenceTextBlockProps = {
  /** Optional headline rendered above the body. */
  title?: string;
  /** Free-form paragraphs. */
  paragraphs?: readonly string[];
  /** Numbered sections, each with a bullet list (matches the design's list response). */
  sections?: readonly IntelligenceTextBlockSection[];
};

/** Built-in `user-text` block — the plain prompt typed by the user. */
export type IntelligenceUserTextBlockProps = {
  text: string;
};

/** Props for the composer at the bottom of the panel. */
export interface IntelligenceChatInputProps extends Omit<ComponentPropsWithoutRef<"form">, "onSubmit" | "children"> {
  /** Called with the trimmed prompt. */
  onSend: (text: string) => void;
  /** Disables sending (e.g. while a response is streaming). */
  disabled?: boolean;
  /** @default "Ask Anything" */
  placeholder?: string;
}

/** Props for the scrollable message thread. */
export interface IntelligenceChatThreadProps extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
  messages: readonly IntelligenceChatMessage[];
  /** Shows a pending indicator after the last message. */
  isResponding?: boolean;
  /** Copy for the pending indicator. @default "Thinking…" */
  respondingLabel?: string;
  /** Rendered when there are no messages. */
  emptyState?: ReactNode;
}

/** Props for the complete chat-capable Intelligence panel. */
export interface IntelligenceChatPanelProps
  extends Omit<IntelligencePanelShellProps, "children" | "footer">,
    Pick<IntelligenceChatThreadProps, "messages" | "isResponding" | "respondingLabel" | "emptyState">,
    Pick<IntelligenceChatInputProps, "onSend" | "placeholder"> {
  /** Components available to render response blocks. */
  registry: IntelligenceResponseRegistry;
  /** Disables the composer (independent of `isResponding`). */
  inputDisabled?: boolean;
}
