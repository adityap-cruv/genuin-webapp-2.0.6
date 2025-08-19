# Web SDK Reorganization Action Plan

## 📋 Overview
The web-sdk package currently contains a mix of legacy components and new architecture. The goal is to eliminate redundant files and reorganize the structure to fully leverage shared components from `@genuin/components` and `@genuin/ui` packages, while maintaining the single JS file entry point with lazy loading capabilities.

## 🎯 Goals
- [ ] Eliminate duplicate components that exist in shared packages
- [ ] Reorganize directory structure for better maintainability
- [ ] Maintain single JS file entry point with lazy loading
- [ ] Ensure backward compatibility of public SDK API
- [ ] Reduce bundle size and improve performance

## 📊 Current Architecture Analysis

### Entry Point Flow
- **Main Entry**: `packages/web-sdk/src/index.ts` - Exposes SDK API methods (`init`, `update`)
- **Current Router**: Uses `packages/web-sdk/src/views/loader.tsx` (legacy) which conditionally calls `packages/web-sdk/src/views/new-loader.tsx`
- **New Approach**: `packages/web-sdk/src/views/new-loader.tsx` uses shared components from `@genuin/components` and `@genuin/ui`

### Dependencies Status
- [x] Already added: `@genuin/components: "workspace:*"` and `@genuin/ui: "workspace:*"`

---

## 🚀 Implementation Checklist

### Phase 1: Remove Redundant Components and Files

#### 1.1 Delete Duplicate UI Components
> **Components that exist in `@genuin/ui`**

- [ ] **Delete** `src/components/button.tsx` → Use `@genuin/ui` Button
- [ ] **Delete** `src/components/loader.tsx` → Use `@genuin/ui` Loader
- [ ] **Delete** `src/components/shimmer.tsx` → Use `@genuin/ui` Skeleton
- [ ] **Delete** `src/components/decorative-list.tsx` → Use `@genuin/ui` DecorativeList
- [ ] **Delete** `src/components/read-more.tsx` → Use `@genuin/ui` ReadMore
- [ ] **Delete** `src/components/custom-avatar.tsx` → Use `@genuin/ui` Avatar
- [ ] **Delete** `src/components/custom-image.tsx` → Use `@genuin/ui` Image
- [ ] **Delete** `src/components/ui/` (entire folder) → All covered by `@genuin/ui`

**Commands to run:**
```bash
cd packages/web-sdk
rm src/components/button.tsx
rm src/components/loader.tsx
rm src/components/shimmer.tsx
rm src/components/decorative-list.tsx
rm src/components/read-more.tsx
rm src/components/custom-avatar.tsx
rm src/components/custom-image.tsx
rm -rf src/components/ui/
```

#### 1.2 Delete Duplicate Business Components
> **Components that exist in `@genuin/components`**

- [ ] **Delete** `src/components/authentication/` → Use `@genuin/components` AuthenticationModal
- [ ] **Delete** `src/components/player/` → Use `@genuin/components` EmbedPlayer
- [ ] **Delete** `src/components/comments/` → Use `@genuin/components` Comments
- [ ] **Delete** `src/components/reaction/` → Use `@genuin/components` ReactionButton
- [ ] **Delete** `src/components/gestures/` → Use `@genuin/components` Gestures
- [ ] **Delete** `src/components/linkouts.tsx` → Use `@genuin/components` Linkouts
- [ ] **Delete** `src/components/stats.tsx` → Use `@genuin/components` Stats
- [ ] **Delete** `src/components/share-button.tsx` → Use `@genuin/components` ShareButton
- [ ] **Delete** `src/components/embed-header.tsx` → Use `@genuin/components` EmbedHeader
- [ ] **Delete** `src/components/no-contents.tsx` → Use `@genuin/components` ErrorState
- [ ] **Delete** `src/components/community-tile.tsx` → Use `@genuin/components` CommunityCard

**Commands to run:**
```bash
cd packages/web-sdk
rm -rf src/components/authentication/
rm -rf src/components/player/
rm -rf src/components/comments/
rm -rf src/components/reaction/
rm -rf src/components/gestures/
rm src/components/linkouts.tsx
rm src/components/stats.tsx
rm src/components/share-button.tsx
rm src/components/embed-header.tsx
rm src/components/no-contents.tsx
rm src/components/community-tile.tsx
```

#### 1.3 Delete Legacy View Files

- [ ] **Delete** `src/views/loader.tsx` → Replace with new-loader.tsx logic
- [ ] **Delete** `src/views/carousel/` → Use `@genuin/components` Embed with carousel style
- [ ] **Delete** `src/views/feed/` → Use `@genuin/components` Embed with feed style
- [ ] **Delete** `src/views/floating/` → Use `@genuin/components` Embed with floating style

**Commands to run:**
```bash
cd packages/web-sdk
rm src/views/loader.tsx
rm -rf src/views/carousel/
rm -rf src/views/feed/
rm -rf src/views/floating/
```

#### 1.3.1 CSS Strategy - UPDATED Analysis
> **✅ MAJOR INSIGHT: Shared components handle their own CSS isolation!**

**Shared Components CSS Architecture (webapp evidence):**
- **Webapp imports**: `import '@genuin/components/styles'` in layout.tsx
- **CSS class prefix**: Shared components use `gencl:` prefix (Genuin Components Library)
- **Standardized variables**: Same CSS variables (`:root` with `--primary`, `--secondary`, etc.)
- **No isolation conflicts**: Designed to work in any environment (webapp and embedded)

**Current Legacy SDK CSS:**
- `src/views/main.css` → Contains legacy `.gen-sdk-class` scoping and redundant styles
- `src/views/output.css` → Generated file from main.css via Tailwind
- **Most styles now redundant** → Covered by shared component CSS

**REVISED CSS Strategy - Safe to Delete:**
- [ ] **DELETE** `src/views/main.css` → **Shared components handle styling**
- [ ] **DELETE** `src/views/output.css` → **Generated file, no longer needed**
- [ ] **DELETE** `src/components/authentication/css/date-picker.css` → **Covered by shared components**
- [ ] **DELETE** `src/components/search-bar/hide-swiper.module.css` → **Covered by shared components**

**Why This Works:**
1. **Shared components are self-contained** → Include their own CSS isolation
2. **CSS variables standardized** → Same theming system across webapp/web-sdk
3. **`gencl:` prefixing** → Built-in conflict prevention for embedded environments
4. **Proven in webapp** → Already works without legacy SDK CSS classes

**Updated Commands:**
```bash
cd packages/web-sdk
# Safe to delete - shared components handle CSS
rm src/views/main.css
rm src/views/output.css
rm src/components/authentication/css/date-picker.css
rm src/components/search-bar/hide-swiper.module.css
```#### 1.4 Delete Legacy Context and Utils
> **Delete if covered by shared packages**

- [ ] **Review and Delete** `src/context/auth.tsx` → Use `@genuin/components` AuthProvider
- [ ] **Review and Delete** `src/context/base.tsx` → Use `@genuin/components` BaseContextProvider
- [ ] **Review and Delete** `src/context/brand-details.tsx` → Use `@genuin/components` (if available)
- [ ] **Keep if needed** `src/context/floating.tsx` → Specific to embed, review necessity
- [ ] **Review and Delete** `src/context/react-query.tsx` → Use `@genuin/components` ReactQueryClientProvider
- [ ] **Keep if needed** `src/context/size.tsx` → Keep if web-sdk specific

**Commands to run after review:**
```bash
cd packages/web-sdk
# Only run these after confirming shared components cover the functionality
rm src/context/auth.tsx
rm src/context/base.tsx
rm src/context/brand-details.tsx
rm src/context/react-query.tsx
# Keep floating.tsx and size.tsx if they contain SDK-specific logic
```

#### 1.5 Delete Legacy Router and Pages
> **Delete if using shared components for routing**

- [ ] **Review and Delete** `src/router/` (entire folder) → Use `@genuin/components` routing if available
- [ ] **Review and Delete** `src/pages/` (entire folder) → Use `@genuin/components` page components

**Commands to run after review:**
```bash
cd packages/web-sdk
# Only run these after confirming shared components provide routing
rm -rf src/router/
rm -rf src/pages/
```

### Phase 2: Reorganize Remaining Structure

#### 2.1 Create New Simplified Structure

- [ ] **Rename** `src/views/new-loader.tsx` → `src/views/embed-loader.tsx`
- [ ] **Keep** `src/index.ts` (main entry point)
- [ ] **Merge/Keep** `src/types.ts` (merge with `type.ts` if needed)
- [ ] **Keep** `src/const.ts` (constants)
- [ ] **Keep** `src/headers.ts` (SDK-specific headers)
- [ ] **Keep** `src/utils.ts` (SDK-specific utilities)
- [ ] **Keep** `src/iframeLoader.ts` (iframe functionality)
- [ ] **Keep** `src/analytics/` (analytics integration)

**Commands to run:**
```bash
cd packages/web-sdk
mv src/views/new-loader.tsx src/views/embed-loader.tsx
```

**Target Structure After Cleanup:**
```
src/
├── index.ts                              # Main entry point (keep)
├── types.ts                              # Keep, merge type.ts if needed
├── const.ts                              # Keep constants
├── headers.ts                            # Keep SDK-specific headers
├── utils.ts                              # Keep SDK-specific utilities
├── iframeLoader.ts                       # Keep for iframe functionality
├── analytics/                            # Keep analytics integration
├── utils/                                # Keep SDK-specific utilities
│   ├── auth.ts                          # Keep if SDK-specific auth logic
│   ├── constants/                       # Keep SDK constants
│   └── react-query/                     # Keep if SDK-specific queries
├── views/
│   └── embed-loader.tsx                 # Rename new-loader.tsx
├── components/                          # Only SDK-specific components
│   ├── embed-shell.tsx                  # Keep if SDK-specific
│   ├── error-boundary.tsx               # Keep for SDK error handling
│   ├── initial-loader.tsx               # Keep for SDK initialization
│   └── conditional-wrapper.tsx          # Keep if SDK-specific
└── scripts/                             # Keep build scripts
```

#### 2.2 Update Main Entry Point

- [ ] **Update** `src/index.ts` imports to use new embed-loader
- [ ] **Remove** branching logic between old/new loaders
- [ ] **Simplify** to always use shared components approach

**Changes needed in `src/index.ts`:**
```typescript
// Replace import
- import { loadEmbedView } from './views/loader'
+ import { loadEmbedView } from './views/embed-loader'

// Remove conditional logic that chooses between old/new loaders
// Always use shared components approach
```

#### 2.3 Update Embed Loader

- [ ] **Expand** `src/views/embed-loader.tsx` to handle ALL embed styles
- [ ] **Remove** style-specific conditional logic
- [ ] **Add** error boundary at top level
- [ ] **Import shared component styles** instead of legacy CSS
- [ ] **Let** `@genuin/components` handle their own dependencies

**Template for updated `src/views/embed-loader.tsx`:**
```typescript
import { AuthUser, EmbedDataType } from '@/type'
import { getKsCbRequestStatus } from '@/utils/auth'
import { createRoot } from 'react-dom/client'
import {
  AuthProvider,
  BaseContextProvider,
  EmbedProvider,
  LinkProvider,
  ReactQueryClientProvider,
  Embed
} from '@genuin/components'
// Import shared component styles instead of legacy SDK CSS
import '@genuin/components/styles'

export function loadEmbedView(
  container: HTMLElement,
  embedData: EmbedDataType,
  user?: AuthUser,
) {
  const root = createRoot(container)

  const rootToRender = (
    <ErrorBoundary>
      <ReactQueryClientProvider>
        <EmbedProvider
          container={container}
          embedData={{
            ...embedData,
            brand_id: embedData.brandDetails.brand_id,
            autoUserInteractionToPerform: embedData.action as any,
          }}>
          <LinkProvider>
            <BaseContextProvider
              brandDetails={embedData.brandDetails}
              isEmbed>
              <AuthProvider
                onSignIn={() => {}}
                onSignOut={() => {}}
                onUpdateUser={() => {}}
                user={user ? {
                  ...user,
                  ksCbRequestStatus: getKsCbRequestStatus(user.ksCbRequestStatus),
                } : undefined}>
                <Embed />
              </AuthProvider>
            </BaseContextProvider>
          </LinkProvider>
        </EmbedProvider>
      </ReactQueryClientProvider>
    </ErrorBoundary>
  )

  root.render(rootToRender)
}
```

### Phase 3: Build Configuration Updates

#### 3.1 Update Rollup Configuration

- [ ] **Update** `rollup.config.mjs` for proper externalization
- [ ] **Ensure** single file output for production
- [ ] **Test** development vs production builds

**Changes needed in `rollup.config.mjs`:**
```javascript
export default {
  input: 'src/index.ts',
  external: (id) => {
    // During development, externalize shared packages
    if (process.env.NODE_ENV === 'development') {
      return id.includes('@genuin/components') || id.includes('@genuin/ui')
    }
    // In production, bundle everything for single file output
    return false
  }
}
```

#### 3.2 Update Package Scripts

- [ ] **Verify** build scripts still work
- [ ] **Add** clean script if not present
- [ ] **Test** all scripts after reorganization

**Recommended scripts in `package.json`:**
```json
{
  "scripts": {
    "build": "rollup -c rollup.config.mjs",
    "dev": "rollup -c rollup.config.mjs -w",
    "clean": "rm -rf dist",
    "type-check": "tsc --noEmit"
  }
}
```

### Phase 4: Dependencies Cleanup

#### 4.1 Remove Unused Dependencies

- [ ] **Review** current dependencies in `package.json`
- [ ] **Remove** UI component libraries duplicated by `@genuin/ui`
- [ ] **Remove** business logic libraries now in `@genuin/components`
- [ ] **Keep** SDK-specific dependencies (analytics, build tools, etc.)

**Dependencies to review for removal:**
- Any UI component libraries that duplicate `@genuin/ui` functionality
- Styling libraries if handled by shared packages
- React context libraries if using shared contexts
- Any business logic libraries now in shared components

#### 4.2 Update Import Statements

- [ ] **Find and replace** imports from deleted components
- [ ] **Update** imports to use `@genuin/components` and `@genuin/ui`
- [ ] **Run** type checking after updates

**Search and replace patterns:**
```bash
# Find files that import deleted components
grep -r "from.*components/button" src/
grep -r "from.*components/loader" src/
# Replace with imports from shared packages
```

### Phase 5: Testing and Validation

#### 5.1 Build Testing

- [ ] **Run** `pnpm build` to ensure build works
- [ ] **Check** output bundle size (should be smaller)
- [ ] **Verify** single JS file is generated correctly
- [ ] **Test** lazy loading still works

**Commands to run:**
```bash
cd packages/web-sdk
pnpm clean
pnpm build
# Check dist/ folder for correct output
ls -la dist/
```

#### 5.2 Functionality Testing

- [ ] **Test** all embed styles (standard, carousel, feed, floating)
- [ ] **Verify** authentication flow works
- [ ] **Check** analytics integration
- [ ] **Test** error handling and boundaries
- [ ] **Validate** public SDK API backward compatibility

#### 5.3 Environment Testing

- [ ] **Test** development build
- [ ] **Test** QA build
- [ ] **Test** production build
- [ ] **Verify** environment-specific configurations

**Commands to run:**
```bash
cd packages/web-sdk
npm run build        # Development
npm run build:qa     # QA
npm run build:prod   # Production
```

#### 5.4 Integration Testing

- [ ] **Test** integration with webapp
- [ ] **Verify** shared components work correctly
- [ ] **Check** CSS/styling consistency
- [ ] **Test** responsive behavior

---

## 🛡️ Risk Mitigation

### Pre-Implementation
- [ ] **Create backup** of current working version
- [ ] **Document** current working functionality
- [ ] **Set up** rollback plan

### During Implementation
- [ ] **Test each phase** individually before proceeding
- [ ] **Keep commits small** and atomic
- [ ] **Maintain running build** after each major change

### Post-Implementation
- [ ] **Run full test suite** on all environments
- [ ] **Document** any breaking changes
- [ ] **Update** deployment documentation if needed

---

## 📈 Expected Outcomes

### Performance Improvements
- [ ] **Reduced bundle size** by eliminating duplicate code
- [ ] **Faster load times** through better tree shaking
- [ ] **Improved caching** through shared component reuse

### Development Benefits
- [ ] **Improved maintainability** by using shared components
- [ ] **Consistent UI/UX** across webapp and web-sdk
- [ ] **Simplified development** with fewer component variations
- [ ] **Better type safety** through shared type definitions

### Quality Improvements
- [ ] **Reduced technical debt** from duplicate components
- [ ] **Better test coverage** through shared component tests
- [ ] **Improved documentation** through shared component docs

---

## 📝 Notes and Considerations

### Critical Points
- Maintain backward compatibility of public SDK API (`window.genuin.init`, `window.genuin.update`)
- Ensure all embed styles continue to work (standard, carousel, feed, floating)
- Preserve analytics functionality and tracking
- Keep error handling and boundaries for SDK-specific scenarios

### CSS Strategy - Updated Considerations
**✅ Major Discovery: Shared components are CSS-complete and embed-ready!**

**Evidence from webapp analysis:**
1. **Self-contained styling**: `@genuin/components/styles` import provides all needed CSS
2. **Embedded-safe prefixing**: Uses `gencl:` classes designed to avoid conflicts
3. **Standardized theming**: Same CSS variables across webapp and web-sdk
4. **No legacy scoping needed**: `.gen-sdk-class` is redundant with shared component architecture

**Implications for web-sdk:**
- **Legacy CSS files can be safely deleted** → Shared components handle all styling
- **No special SDK isolation needed** → `gencl:` prefixing prevents conflicts
- **Simpler build process** → No need for SDK-specific CSS generation
- **Consistent theming** → Same variables work across delivery methods

**Migration Benefits:**
1. **Eliminated duplicate styling** → Single source of truth in shared packages
2. **Reduced bundle size** → No redundant CSS in web-sdk
3. **Simplified maintenance** → CSS changes only in shared packages
4. **Guaranteed consistency** → Same styles across webapp and web-sdk

### Future Enhancements
- Consider lazy loading of shared components for even better performance
- Implement proper SDK versioning strategy with shared components
- Set up automated testing pipeline for web-sdk specific functionality
- ~~Create CSS architecture that allows shared components to work in isolated SDK environment~~ ✅ **Already solved by shared component design**

---

## ✅ Completion Checklist

### Phase 1 Complete
- [ ] All duplicate UI components removed
- [ ] All duplicate business components removed
- [ ] Legacy view files deleted
- [ ] Unnecessary context files removed
- [ ] Legacy router/pages removed

### Phase 2 Complete
- [ ] Directory structure reorganized
- [ ] Main entry point updated
- [ ] Embed loader updated and expanded
- [ ] File naming conventions updated

### Phase 3 Complete
- [ ] Rollup configuration updated
- [ ] Package scripts verified
- [ ] Build process tested

### Phase 4 Complete
- [ ] Unused dependencies removed
- [ ] Import statements updated
- [ ] Type checking passes

### Phase 5 Complete
- [ ] Build testing passed
- [ ] Functionality testing passed
- [ ] Environment testing passed
- [ ] Integration testing passed

### Final Validation
- [ ] All expected outcomes achieved
- [ ] No breaking changes to public API
- [ ] Performance improvements verified
- [ ] Documentation updated

---

**Estimated Time:** 2-3 days for complete implementation and testing
**Priority:** High - Significant technical debt reduction and performance improvement
**Dependencies:** Requires shared packages (`@genuin/components`, `@genuin/ui`) to be stable
