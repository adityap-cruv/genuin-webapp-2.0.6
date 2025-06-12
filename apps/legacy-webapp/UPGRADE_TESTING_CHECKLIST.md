# Next.js 15 & React 19 Testing Checklist

Use this checklist to verify that the application functions correctly after upgrading to Next.js 15 and React 19.

## Setup Verification

- [ ] Application builds successfully (`pnpm run build`)
- [ ] Application starts in dev mode (`pnpm run dev`)
- [ ] Application starts in production mode (`pnpm run start`)

## Core Functionality

- [ ] Authentication flow works (sign in/sign up/sign out)
- [ ] Next-Auth session management is working
- [ ] Server-side rendering works as expected
- [ ] Client-side navigation works as expected
- [ ] API routes function correctly

## Media & Content

- [ ] Video player loads and plays videos correctly
- [ ] iHeart player integration works correctly
- [ ] Images load correctly with the Next.js Image component
- [ ] User-uploaded content displays properly

## UI Components

- [ ] Radix UI components function correctly
- [ ] Modals open and close as expected
- [ ] Form submissions work (test all major forms)
- [ ] Dropdowns and select menus work properly
- [ ] Animations and transitions work smoothly

## Mobile & Responsive Features

- [ ] Mobile layout renders correctly
- [ ] Touch gestures work as expected
- [ ] Responsive design adapts to different screen sizes

## Performance

- [ ] Initial page load time is acceptable
- [ ] Client-side navigation is fast
- [ ] No memory leaks (check with Chrome DevTools)
- [ ] No console errors

## Third-party Integrations

- [ ] Analytics tracking works
- [ ] RudderStack integration functions correctly
- [ ] Sentry error reporting works
- [ ] External API integrations function correctly

## Regression Tests

- [ ] Features that previously worked still function correctly
- [ ] No new bugs have been introduced

## Embed Functionality

- [ ] SDK embeds render correctly
- [ ] Feed view works
- [ ] Standard view works
- [ ] Carousel view works
- [ ] Vertical view works

## React 19 Specific Features

- [ ] Verify the `use` hook works correctly in components
- [ ] Check automatic batching behavior with state updates
- [ ] Test that effect cleanup timing changes don't break existing components
- [ ] Verify server components are functioning properly
- [ ] Test error boundaries with React 19

## Next.js 15 Specific Features

- [ ] Verify improved build performance
- [ ] Test the new metadata API in layouts
- [ ] Verify that image optimization works with new Image component props
- [ ] Check for improved server actions functionality
- [ ] Test the new middleware configuration

## Known Issues

Use this section to document any known issues that should be addressed in future updates.

1.
2.
3.

## Performance Improvements

Note any performance improvements observed after the upgrade.

1.
2.
3.
