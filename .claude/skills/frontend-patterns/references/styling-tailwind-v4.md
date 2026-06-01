# Tailwind v4 Patterns

```typescript
// Color with opacity
<div className="bg-primary/[0.5]" />  // NOT bg-primary/50

// Renamed utilities
<div className="shadow-xs" />    // was shadow-sm
<div className="shadow-sm" />    // was shadow
<div className="rounded-xs" />   // was rounded-sm
<div className="rounded-sm" />   // was rounded
<div className="outline-hidden" /> // was outline-none
<div className="ring-3" />       // was ring

// Custom utilities use @utility not @layer utilities
```

For the full migration reference see `docs/migrations/TAILWIND_V4_MIGRATION_GUIDE.md` and the Tailwind
v4 section in `.claude/docs/ai-context.md`.
