"use client";

import { useState, useRef } from "react";
import { DynamicSheet } from "./dynamic-sheet";
import type { DynamicSheetConfig, DynamicSheetState } from "./types";

// ─── Sample Data ──────────────────────────────────────────────────────────────

const SAMPLE_COMMENTS = [
  {
    user: "alex.j",
    text: "This is absolutely 🔥",
    time: "2m",
    likes: 142,
    avatar: "A",
    color: "#FF6B6B",
  },
  {
    user: "sara_m",
    text: "Love the vibe here ✨",
    time: "5m",
    likes: 89,
    avatar: "S",
    color: "#4ECDC4",
  },
  {
    user: "dev_kai",
    text: "The animations are so smooth!",
    time: "8m",
    likes: 234,
    avatar: "D",
    color: "#45B7D1",
  },
  {
    user: "luna.w",
    text: "Can't stop watching this 🎬",
    time: "12m",
    likes: 56,
    avatar: "L",
    color: "#96CEB4",
  },
  {
    user: "m.roshi",
    text: "Peak content, no notes 👏",
    time: "15m",
    likes: 312,
    avatar: "M",
    color: "#FFD93D",
  },
  {
    user: "priya.k",
    text: "More of this please 🙌",
    time: "18m",
    likes: 78,
    avatar: "P",
    color: "#C77DFF",
  },
  {
    user: "t.nakamura",
    text: "Actually incredible work 💯",
    time: "21m",
    likes: 445,
    avatar: "T",
    color: "#06D6A0",
  },
  {
    user: "chris.b",
    text: "Saved for later 🔖",
    time: "25m",
    likes: 33,
    avatar: "C",
    color: "#F7C59F",
  },
  {
    user: "emi.h",
    text: "This made my day honestly 🌸",
    time: "30m",
    likes: 192,
    avatar: "E",
    color: "#EF476F",
  },
  {
    user: "joel_x",
    text: "Nobody does it better 🏆",
    time: "35m",
    likes: 267,
    avatar: "J",
    color: "#118AB2",
  },
] as const;

// ─── Sub-components ───────────────────────────────────────────────────────────

interface CommentData {
  user: string;
  text: string;
  time: string;
  likes: number;
  avatar: string;
  color: string;
}

function CommentItem({ comment }: { comment: CommentData }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.likes);
  const [isBouncing, setIsBouncing] = useState(false);

  const toggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked((prev) => !prev);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
    setIsBouncing(true);
    setTimeout(() => setIsBouncing(false), 300);
  };

  return (
    <div style={{ display: "flex", gap: 12, padding: "10px 16px" }}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          flexShrink: 0,
          background: comment.color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontWeight: 700,
          fontSize: 14,
          boxShadow: `0 2px 8px ${comment.color}55`,
        }}
      >
        {comment.avatar}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ fontWeight: 600, fontSize: 13.5, color: "#fff" }}>
            {comment.user}
          </span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
            {comment.time}
          </span>
        </div>
        <div
          style={{
            fontSize: 14,
            marginTop: 3,
            lineHeight: 1.45,
            color: "rgba(255,255,255,0.88)",
          }}
        >
          {comment.text}
        </div>
        <button
          type="button"
          style={{
            marginTop: 6,
            fontSize: 12,
            color: "rgba(255,255,255,0.35)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            fontWeight: 500,
          }}
        >
          Reply
        </button>
      </div>

      <button
        type="button"
        onClick={toggleLike}
        style={{
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "2px 0",
        }}
      >
        <span
          style={{
            fontSize: 16,
            display: "block",
            transform: isBouncing ? "scale(1.5)" : "scale(1)",
            transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        >
          {isLiked ? "❤️" : "🤍"}
        </span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
          {likeCount}
        </span>
      </button>
    </div>
  );
}

function DemoSheetContent() {
  return (
    <>
      {/* Pinned comment */}
      <div
        style={{
          padding: "10px 16px 12px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.32)",
            marginBottom: 8,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          📌 Pinned
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#f09433,#dc2743)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontSize: 16,
            }}
          >
            🧳
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 13.5, color: "#fff" }}>
              travel.diaries
            </div>
            <div
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.82)",
                marginTop: 3,
                lineHeight: 1.45,
              }}
            >
              Thanks for all the love! 🙏 Golden hour hit different here.
            </div>
          </div>
        </div>
      </div>

      {/* Comment list */}
      {SAMPLE_COMMENTS.map((comment, index) => (
        <CommentItem key={index} comment={comment} />
      ))}
      <div style={{ height: 16 }} />
    </>
  );
}

function DemoSheetHeader({ onClose }: { onClose: () => void }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        position: "relative",
      }}
    >
      <span style={{ flex: 1 }} />
      <span
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          fontWeight: 700,
          fontSize: 15,
          color: "#fff",
          pointerEvents: "none",
        }}
      >
        Comments
      </span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        onPointerDown={(e) => e.stopPropagation()}
        style={{
          marginLeft: "auto",
          width: 28,
          height: 28,
          borderRadius: "50%",
          border: "none",
          background: "rgba(255,255,255,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "#fff",
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        ✕
      </button>
    </div>
  );
}

function DemoSheetFooter() {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          flexShrink: 0,
          background: "linear-gradient(135deg,#f09433,#dc2743)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 15,
        }}
      >
        🧳
      </div>
      <div
        style={{
          flex: 1,
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 22,
          padding: "9px 16px",
          fontSize: 14,
          color: "rgba(255,255,255,0.32)",
          cursor: "text",
        }}
      >
        Add a comment…
      </div>
      <span style={{ fontSize: 20 }}>😊</span>
    </div>
  );
}

// ─── Shared Config Builder ────────────────────────────────────────────────────

function createSheetConfig(
  onClose: () => void,
  onStateChange: (state: DynamicSheetState) => void,
): DynamicSheetConfig {
  return {
    enabledStates: [
      "default",
      "default-active",
      "expand-view",
      "panel-view",
      "full-view",
    ],
    heights: {
      default: "8%",
      "default-active": "15%",
      "expand-view": "30%",
      "panel-view": "52%",
      "full-view": "91%",
    },
    initialState: "default",
    showIndicator: true,
    showOverlay: true,
    theme: "dark",
    stepByStepSwipeDown: true,
    onStateChange,
    onClose,
  };
}

// ─── Main Demo ────────────────────────────────────────────────────────────────

export default function DynamicSheetDemo() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Fixed (portal) mode state
  const [isFixedMounted, setIsFixedMounted] = useState(false);
  const [isFixedOpen, setIsFixedOpen] = useState(false);
  const [fixedState, setFixedState] = useState<DynamicSheetState>("default");

  // Container mode state
  const [isContainerMounted, setIsContainerMounted] = useState(false);
  const [isContainerOpen, setIsContainerOpen] = useState(false);
  const [containerState, setContainerState] =
    useState<DynamicSheetState>("default");

  // Fixed mode handlers
  const openFixed = () => {
    setIsFixedMounted(true);
    setIsFixedOpen(true);
  };
  const closeFixed = () => setIsFixedOpen(false);
  const dismissFixed = () => {
    setIsFixedMounted(false);
    setIsFixedOpen(false);
  };

  // Container mode handlers
  const openContainer = () => {
    setIsContainerMounted(true);
    setIsContainerOpen(true);
  };
  const closeContainer = () => setIsContainerOpen(false);
  const dismissContainer = () => {
    setIsContainerMounted(false);
    setIsContainerOpen(false);
  };

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse at 60% 30%, #1a1035 0%, #090910 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 40,
        padding: "40px 20px",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif",
      }}
    >
      {/* Mode picker label */}
      <div
        style={{
          color: "rgba(255,255,255,0.5)",
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        Pick a render mode
      </div>

      <div
        style={{
          display: "flex",
          gap: 32,
          alignItems: "flex-start",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {/* ── Fixed mode card ──────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 16,
              padding: "14px 20px",
              color: "rgba(255,255,255,0.7)",
              fontSize: 13,
              textAlign: "center",
              maxWidth: 200,
            }}
          >
            <div style={{ fontSize: 22, marginBottom: 6 }}>🌐</div>
            <div style={{ fontWeight: 700, color: "#fff", marginBottom: 4 }}>
              Fixed (Portal)
            </div>
            <div
              style={{
                color: "rgba(255,255,255,0.45)",
                fontSize: 12,
                lineHeight: 1.5,
              }}
            >
              Renders via portal into{" "}
              <code
                style={{
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: 4,
                  padding: "1px 5px",
                }}
              >
                document.body
              </code>
              . Covers the full viewport.
            </div>
          </div>
          <button
            type="button"
            onClick={openFixed}
            style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              border: "none",
              borderRadius: 12,
              color: "#fff",
              padding: "10px 24px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(99,102,241,0.4)",
            }}
          >
            Open Sheet
          </button>
          {isFixedMounted && (
            <div
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.35)",
                fontWeight: 500,
              }}
            >
              state:{" "}
              <strong style={{ color: "rgba(255,255,255,0.7)" }}>
                {fixedState}
              </strong>
            </div>
          )}
        </div>

        {/* Divider */}
        <div
          style={{
            width: 1,
            background: "rgba(255,255,255,0.07)",
            alignSelf: "stretch",
            minHeight: 160,
          }}
        />

        {/* ── Container mode card ─────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 16,
              padding: "14px 20px",
              color: "rgba(255,255,255,0.7)",
              fontSize: 13,
              textAlign: "center",
              maxWidth: 200,
            }}
          >
            <div style={{ fontSize: 22, marginBottom: 6 }}>📦</div>
            <div style={{ fontWeight: 700, color: "#fff", marginBottom: 4 }}>
              Container
            </div>
            <div
              style={{
                color: "rgba(255,255,255,0.45)",
                fontSize: 12,
                lineHeight: 1.5,
              }}
            >
              Renders{" "}
              <code
                style={{
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: 4,
                  padding: "1px 5px",
                }}
              >
                position:absolute
              </code>{" "}
              inside a bounded element. Clips to the phone frame below.
            </div>
          </div>
          <button
            type="button"
            onClick={openContainer}
            style={{
              background: "linear-gradient(135deg, #ec4899, #f43f5e)",
              border: "none",
              borderRadius: 12,
              color: "#fff",
              padding: "10px 24px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(236,72,153,0.4)",
            }}
          >
            Open in Phone
          </button>
          {isContainerMounted && (
            <div
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.35)",
                fontWeight: 500,
              }}
            >
              state:{" "}
              <strong style={{ color: "rgba(255,255,255,0.7)" }}>
                {containerState}
              </strong>
            </div>
          )}
        </div>
      </div>

      {/* ── Phone frame (container mode) ──────────────────────────── */}
      <div
        style={{
          width: 360,
          height: 640,
          background: "#000",
          borderRadius: 46,
          boxShadow:
            "0 50px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)",
          overflow: "hidden",
          position: "relative",
          flexShrink: 0,
        }}
      >
        {/* Dynamic Island */}
        <div
          style={{
            position: "absolute",
            top: 10,
            left: "50%",
            transform: "translateX(-50%)",
            width: 110,
            height: 30,
            background: "#000",
            borderRadius: 18,
            zIndex: 100,
            boxShadow: "0 0 0 1px rgba(255,255,255,0.06)",
          }}
        />

        {/* Post background */}
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "linear-gradient(170deg,#0d0d1a,#111827 45%,#0f172a)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative glow */}
          <div
            style={{
              position: "absolute",
              top: 80,
              left: "50%",
              transform: "translateX(-50%)",
              width: 280,
              height: 280,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <div style={{ padding: "52px 18px 14px", color: "#fff" }}>
            {/* Author row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                }}
              >
                🧳
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>
                  travel.diaries
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.42)" }}>
                  Santorini, Greece
                </div>
              </div>
              <button
                type="button"
                style={{
                  marginLeft: "auto",
                  background: "none",
                  border: "1px solid rgba(255,255,255,0.22)",
                  borderRadius: 7,
                  color: "#fff",
                  padding: "4px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Follow
              </button>
            </div>

            {/* Photo placeholder */}
            <div
              style={{
                width: "100%",
                height: 240,
                borderRadius: 14,
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(236,72,153,0.06))",
                border: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 80,
              }}
            >
              🏛️
            </div>

            {/* Action row */}
            <div
              style={{
                display: "flex",
                gap: 12,
                marginTop: 12,
                alignItems: "center",
              }}
            >
              {[
                { icon: "♡" },
                { icon: "💬", action: openContainer },
                { icon: "✈︎" },
              ].map(({ icon, action }, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={action}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: 22,
                    cursor: "pointer",
                    padding: 3,
                    color: "#fff",
                    opacity: 0.88,
                  }}
                >
                  {icon}
                </button>
              ))}
              <button
                type="button"
                style={{
                  marginLeft: "auto",
                  background: "none",
                  border: "none",
                  fontSize: 20,
                  cursor: "pointer",
                  padding: 3,
                  color: "#fff",
                  opacity: 0.88,
                }}
              >
                ⊕
              </button>
            </div>

            <div
              style={{
                marginTop: 8,
                fontSize: 13,
                color: "#fff",
                fontWeight: 600,
              }}
            >
              1,248 likes
            </div>
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.8)",
                marginTop: 3,
                lineHeight: 1.5,
              }}
            >
              <strong style={{ color: "#fff" }}>travel.diaries</strong> The
              bluest waters 💙 #santorini
            </div>
            <button
              type="button"
              onClick={openContainer}
              style={{
                marginTop: 5,
                fontSize: 12.5,
                color: "rgba(255,255,255,0.35)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              View all 47 comments
            </button>
          </div>

          {/* Container sheet anchor */}
          <div
            ref={containerRef}
            style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
          >
            {isContainerMounted && (
              <DynamicSheet
                isOpen={isContainerOpen}
                onDismissed={dismissContainer}
                renderMode={
                  containerState !== "default" &&
                  containerState !== "default-active"
                    ? "fixed"
                    : "container"
                }
                containerRef={containerRef}
                config={createSheetConfig(closeContainer, setContainerState)}
                header={<DemoSheetHeader onClose={closeContainer} />}
                footer={<DemoSheetFooter />}
              >
                <DemoSheetContent />
              </DynamicSheet>
            )}
          </div>
        </div>
      </div>

      {/* Hint */}
      <div
        style={{
          color: "rgba(255,255,255,0.35)",
          fontSize: 12.5,
          fontWeight: 500,
          textAlign: "center",
          lineHeight: 1.7,
        }}
      >
        Drag up/down to change state · Swipe down to close · Tap 💬 to reopen
      </div>

      {/* Fixed mode sheet (portal, covers full page) */}
      {isFixedMounted && (
        <DynamicSheet
          isOpen={isFixedOpen}
          onDismissed={dismissFixed}
          renderMode="fixed"
          config={createSheetConfig(closeFixed, setFixedState)}
          header={<DemoSheetHeader onClose={closeFixed} />}
          footer={<DemoSheetFooter />}
        >
          <DemoSheetContent />
        </DynamicSheet>
      )}
    </div>
  );
}
