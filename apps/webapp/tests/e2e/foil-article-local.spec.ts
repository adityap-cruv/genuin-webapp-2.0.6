import { expect, test } from "./_fixtures/mock";

test.describe("Feature: Local Foil article pages", () => {
  test("scrolls the local article inside the fixed application shell", async ({ page }) => {
    await page.goto("/foil/articles/article-1");

    const article = page.getByTestId("foil-local-article");
    await expect(article).toBeVisible();
    await expect.poll(() => article.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);

    await article.evaluate((element) => element.scrollTo({ top: 800 }));
    await expect.poll(() => article.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  });

  test("renders extracted content with a sticky feed before the original carousel", async ({ page }) => {
    await page.goto("/foil/articles/article-1");

    const article = page.getByTestId("foil-local-article");
    await expect(article).toBeVisible();
    await expect(article.locator("iframe")).toHaveCount(0);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "The Foil Podcast breaks down light-wind SailGP practice racing in Rio",
      })
    ).toBeVisible();

    const stickyRail = page.getByTestId("foil-article-sticky-feed");
    await expect(stickyRail).toHaveCSS("position", "sticky");
    await expect(stickyRail.locator(".gen-sdk-class")).toHaveAttribute("data-placement-id", "6a032db60ae65ee82495dd72");

    const fanReactions = page.getByTestId("foil-article-fan-reactions");
    await expect(fanReactions.locator(".gen-sdk-class")).toHaveAttribute(
      "data-placement-id",
      "69f4814de964b815fc224fec"
    );

    const stickyBottom = await stickyRail.evaluate((element) => element.parentElement?.getBoundingClientRect().bottom);
    const carouselTop = await fanReactions.evaluate((element) => element.getBoundingClientRect().top);
    expect(stickyBottom).toBeLessThanOrEqual(carouselTop + 1);
  });

  test("reserves the complete Fleet Fan Zone grid before the footer", async ({ page }) => {
    await page.goto("/foil/articles/article-1");

    const gridSdk = page.getByTestId("foil-article-fleet-fan-zone-sdk");
    const gridHost = gridSdk.locator("..");
    const footer = page.locator("footer");

    await expect(gridHost).toBeVisible();
    await gridHost.scrollIntoViewIfNeeded();

    const gridBounds = await gridHost.boundingBox();
    const footerBounds = await footer.boundingBox();

    expect(gridBounds).not.toBeNull();
    expect(footerBounds).not.toBeNull();
    expect(gridBounds!.height).toBeGreaterThan(gridBounds!.width);
    expect(footerBounds!.y).toBeGreaterThanOrEqual(gridBounds!.y + gridBounds!.height);
  });

  test("hides the sticky Foil navigation while an SDK video viewer is open", async ({ page }) => {
    await page.goto("/foil/articles/article-1");

    const articleNavigation = page.getByRole("navigation", { name: "Foil article navigation" });
    await expect(articleNavigation).toBeVisible();
    await expect(articleNavigation).toHaveCSS("position", "sticky");

    await page.evaluate(() => {
      const overlayHost = document.createElement("div");
      overlayHost.id = "genuin-overlay-host-expand-view";
      overlayHost.setAttribute("data-genuin-overlay-host", "true");
      document.body.appendChild(overlayHost);
    });

    await expect(articleNavigation).toBeHidden();

    await page.evaluate(() => document.getElementById("genuin-overlay-host-expand-view")?.remove());
    await expect(articleNavigation).toBeVisible();
  });
});

test.describe("Feature: Local Foil Fleet profiles", () => {
  const localProfiles = [
    { slug: "slingsby", heading: "Tom Slingsby" },
    { slug: "outteridge", heading: "Nathan Outteridge" },
    { slug: "delapierre", heading: "Quentin Delapierre" },
  ] as const;

  for (const profile of localProfiles) {
    test(`renders ${profile.heading}'s extracted profile without an iframe`, async ({ page }) => {
      await page.goto(`/foil/athletes/${profile.slug}`);

      const athletePage = page.getByTestId("foil-local-athlete");
      await expect(athletePage).toBeVisible();
      await expect(athletePage.getByRole("heading", { level: 1, name: profile.heading })).toBeVisible();
      await expect(athletePage.locator("iframe")).toHaveCount(0);
    });
  }

  test("renders the article feed as a bounded sticky rail on Fleet profiles", async ({ page }) => {
    await page.goto("/foil/athletes/slingsby");

    const stickyRail = page.getByTestId("foil-athlete-sticky-feed");
    await expect(stickyRail).toHaveCSS("position", "sticky");
    await expect(stickyRail.locator('.gen-sdk-class[data-genuin-host="true"]')).toHaveAttribute(
      "data-placement-id",
      "6a032db60ae65ee82495dd72"
    );

    const fanReactions = page.getByTestId("foil-athlete-fan-reactions");
    const stickyBoundaryBottom = await stickyRail.evaluate(
      (element) => element.parentElement?.parentElement?.getBoundingClientRect().bottom
    );
    const fanReactionsTop = await fanReactions.evaluate((element) => element.getBoundingClientRect().top);
    expect(stickyBoundaryBottom).toBeLessThanOrEqual(fanReactionsTop + 1);
  });

  test("places the Fleet feed in normal flow on narrow screens", async ({ page }) => {
    await page.setViewportSize({ width: 700, height: 900 });
    await page.goto("/foil/athletes/slingsby");

    const stickyRail = page.getByTestId("foil-athlete-sticky-feed");
    await expect(stickyRail).toHaveCSS("position", "static");

    const placementBounds = await stickyRail.locator('.gen-sdk-class[data-genuin-host="true"]').boundingBox();
    expect(placementBounds).not.toBeNull();
    expect(placementBounds!.width).toBeLessThanOrEqual(540);
  });

  test("shows the prototype coming-soon message for unavailable Fleet profiles", async ({ page }) => {
    await page.goto("/home");

    for (const name of ["Dylan Mills", "Martine Grael", "Diego Barceló"] as const) {
      await page.getByRole("button", { name: `View ${name}'s profile` }).click();
      await expect(page.getByText(`Profile coming soon: ${name}…`, { exact: true })).toBeVisible();
    }
  });
});

test.describe("Feature: Foil home content drawer", () => {
  test("opens and closes a local article without leaving home", async ({ page }) => {
    await page.goto("/home");

    await page.evaluate(() => {
      const testWindow = window as typeof window & { foilDrawerStates?: string[] };
      testWindow.foilDrawerStates = [];

      new MutationObserver(() => {
        const state = document.querySelector('[data-testid="foil-content-drawer"]')?.getAttribute("data-state");
        if (state && !testWindow.foilDrawerStates?.includes(state)) testWindow.foilDrawerStates?.push(state);
      }).observe(document.body, {
        attributeFilter: ["data-state"],
        attributes: true,
        childList: true,
        subtree: true,
      });
    });

    const articleTrigger = page.getByRole("link", {
      name: "Read Slingsby's start-line gamble was brilliant. It was also wrong.",
    });
    await articleTrigger.click();

    const drawer = page.getByTestId("foil-content-drawer");
    await expect(drawer).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(() => (window as typeof window & { foilDrawerStates?: string[] }).foilDrawerStates ?? [])
      )
      .toContain("opening");
    await expect(drawer).toHaveAttribute("data-state", "open");
    const drawerArticle = drawer.getByTestId("foil-local-article");
    await expect(drawerArticle).toBeVisible();
    await expect(drawerArticle.getByTestId("foil-drawer-article-header")).toBeVisible();
    await expect(drawerArticle.getByAltText("SailGP practice racing in Rio de Janeiro")).toHaveCount(0);
    await expect(drawerArticle.getByTestId("foil-article-sticky-feed")).toBeVisible();
    await expect(page).toHaveURL(/\/home$/);
    await expect(page.getByRole("link", { name: "Home", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Popular", exact: true })).toBeVisible();

    await drawer.getByTestId("foil-content-drawer-close").click();
    await expect(drawer).toHaveAttribute("data-state", "closing");
    await expect(drawer).toBeVisible();
    await expect(drawer).toBeHidden();
    await expect(articleTrigger).toBeFocused();
  });

  test("opens a Fleet profile on home and closes it with Escape", async ({ page }) => {
    await page.goto("/home");

    await page.getByRole("link", { name: "View Tom Slingsby's profile" }).click();

    const drawer = page.getByTestId("foil-content-drawer");
    await expect(drawer).toBeVisible();
    const drawerAthlete = drawer.getByTestId("foil-local-athlete");
    await expect(drawerAthlete).toBeVisible();
    await expect(drawerAthlete.getByTestId("foil-drawer-athlete-header")).toContainText("Tom Slingsby");
    await expect(drawerAthlete.getByTestId("foil-drawer-athlete-header")).toContainText("#1 · 74 pts");
    await expect(drawerAthlete.getByAltText("Tom Slingsby — Australia SailGP Team Skipper")).toHaveCount(0);
    await expect(drawerAthlete.getByTestId("foil-athlete-sticky-feed")).toBeVisible();
    await expect(page).toHaveURL(/\/home$/);

    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();
  });
});
