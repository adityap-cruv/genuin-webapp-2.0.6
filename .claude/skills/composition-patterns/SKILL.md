---
name: composition-patterns
description: Design clean, composable React component APIs for this repo's atomic design — compound components, provider/dependency-injected state, explicit variant components over boolean-prop soup, children over render props, and React 19 ref-as-prop. Use when a component has too many boolean props, when building a reusable molecule/organism in packages/components, or when designing a component's public API. Do NOT use for general component building (use frontend-patterns), performance (use performance), or accessibility (use accessibility).
metadata:
  author: Genuin (adapted from vercel-labs/agent-skills composition-patterns)
  version: 1.0.0
---

# Composition Patterns

Patterns for composable component APIs. Maps onto our atomic design: atoms in `packages/ui`,
compound molecules/organisms in `packages/components`. React 19 + TypeScript strict.

> Examples are web/Tailwind v4 (the source skill's were React Native — ported here).

Ordered by impact.

---

## CRITICAL — Explicit variants over boolean-prop proliferation

Multiple boolean props create impossible/contradictory states and a combinatorial API. Use one
discriminated `variant` (and `size`, etc.) instead.

```tsx
// ❌ Incorrect — booleans allow nonsense like primary + danger + ghost at once
<Button isPrimary isDanger isGhost isLarge />

// ✅ Correct — one closed set; impossible states unrepresentable
type ButtonProps = { variant?: 'primary' | 'danger' | 'ghost'; size?: 'sm' | 'md' | 'lg' };
<Button variant="danger" size="lg" />
```

## HIGH — Compound components for related parts

When a component has structural sub-parts, expose them as a namespace so the markup mirrors the UI
and consumers compose freely.

```tsx
// ✅ Correct — compound API
export function Card({ children }: { children: React.ReactNode }) { /* ... */ }
function CardHeader({ children }: { children: React.ReactNode }) { /* ... */ }
function CardBody({ children }: { children: React.ReactNode }) { /* ... */ }

// Namespace object — this is a compound-component pattern, NOT a banned barrel re-export
export const CardNS = Object.assign(Card, { Header: CardHeader, Body: CardBody });

// Usage
<CardNS>
  <CardNS.Header>Title</CardNS.Header>
  <CardNS.Body>Content</CardNS.Body>
</CardNS>
```

> Note: our `CLAUDE.md` bans barrel files (`index.ts` re-exporting everything). A compound-component
> namespace object is a deliberate API surface on one component — that is allowed, not a barrel.

## HIGH — Dependency-inject shared state via a provider

Don't prop-drill shared state through every level. Provide it once; consume where needed. (This is
exactly how our `EmbedProvider`/Context split already works.)

```tsx
// ❌ Incorrect — drilling activeTab/onTabChange through 4 layers
<Tabs activeTab={t} onTabChange={set}><TabList activeTab={t} onTabChange={set}>...

// ✅ Correct — provider owns the state; parts read from context
const TabsContext = createContext<TabsValue | null>(null);
export function Tabs({ children, defaultTab }: TabsProps) {
  const [active, setActive] = useState(defaultTab);
  return <TabsContext value={{ active, setActive }}>{children}</TabsContext>;
}
function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs.* must be used within <Tabs>');
  return ctx;
}
```

## MEDIUM — Children over render props

Prefer composing `children` over passing render-prop functions; it reads cleaner and avoids
prop-drilling closures. Reach for render props only when the child genuinely needs parent state.

```tsx
// ❌ Avoid when children suffice
<List renderItem={(item) => <Row item={item} />} />

// ✅ Prefer
<List>{items.map((item) => <Row key={item.id} item={item} />)}</List>
```

## MEDIUM — React 19: ref as a prop (no `forwardRef`)

React 19 passes `ref` as an ordinary prop. Don't wrap in `forwardRef`. (Matches our house rules:
no `React.FC`, all `useRef` initialized.)

```tsx
// ❌ Incorrect — legacy forwardRef ceremony
const Input = forwardRef<HTMLInputElement, Props>((props, ref) => <input ref={ref} {...props} />);

// ✅ Correct — ref is just a prop
function Input({ ref, ...props }: Props & { ref?: React.Ref<HTMLInputElement> }) {
  return <input ref={ref} {...props} />;
}
```

---

> Source: adapted from Vercel Labs `composition-patterns` (RN examples ported to web/Tailwind v4).
> For broader component/state/data patterns see the `frontend-patterns` skill.
