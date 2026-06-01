# State & Data

Local/global state with Context + reducer; server state with TanStack Query v5.

> Prefer React Context for global UI state; Zustand only as a last resort when Context becomes too
> complex. Use TanStack Query for all server state — do not hand-roll fetch hooks.

## Context + Reducer Pattern

```typescript
interface State {
  items: Item[];
  selectedItem: Item | null;
  loading: boolean;
}

type Action =
  | { type: 'SET_ITEMS'; payload: Item[] }
  | { type: 'SELECT_ITEM'; payload: Item }
  | { type: 'SET_LOADING'; payload: boolean };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.payload };
    case 'SELECT_ITEM':
      return { ...state, selectedItem: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

const FeatureContext = createContext<{
  state: State;
  dispatch: Dispatch<Action>;
} | undefined>(undefined);

export function FeatureProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    items: [],
    selectedItem: null,
    loading: false,
  });

  return (
    <FeatureContext.Provider value={{ state, dispatch }}>
      {children}
    </FeatureContext.Provider>
  );
}

export function useFeature() {
  const context = useContext(FeatureContext);
  if (!context) throw new Error('useFeature must be used within FeatureProvider');
  return context;
}
```

## TanStack Query v5 (Server State)

```typescript
// Query with staleTime
const { data, isPending, error } = useQuery({
  queryKey: ["items", filters],
  queryFn: () => fetchItems(filters),
  staleTime: 60_000, // 1 minute
});

// Mutation
const { mutate, isPending: isCreating } = useMutation({
  mutationFn: createItem,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["items"] });
  },
});
```
