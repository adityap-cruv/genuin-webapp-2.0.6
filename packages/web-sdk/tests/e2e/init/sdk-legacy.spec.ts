/**
 * @fileoverview
 * Feature: Legacy SDK initialization (backward compatibility)
 *
 * Objective:
 * Validate that the SDK supports the legacy initialization pattern using
 * the onGenuinReady callback and initialize() method for backward compatibility.
 *
 */

import { test } from "@playwright/test";

import { SINGLE_EMBED_INIT_DATA } from "../../data/init";
import { loadTestPage } from "../../helpers/page.helper";
import { createSDKContainer } from "../../helpers/sdk-container.helper";
import { waitForSDKRender } from "../../helpers/sdk-wait.helper";

test("Scenario: Legacy initialization via onGenuinReady callback", async ({ page }) => {
  await test.step("Setup: Load base test environment with SDK script available", async () => {
    await loadTestPage(page);
  });

  await test.step("Setup: Create SDK container element with embed-id and api-key data attributes", async () => {
    await createSDKContainer(page, {
      dataAttributes: {
        "embed-id": SINGLE_EMBED_INIT_DATA.embed_id,
        "api-key": SINGLE_EMBED_INIT_DATA.api_key,
      },
    });
  });

  await test.step("Action: Register onGenuinReady callback that calls sdk.initialize({ token })", async () => {
    await page.evaluate((cfg) => {
      (window as any).onGenuinReady = (sdk: any) => {
        sdk.initialize({ token: cfg.token });
      };
    }, SINGLE_EMBED_INIT_DATA);
  });

  await test.step("Result: SDK renders video content via the legacy initialization path", async () => {
    await waitForSDKRender(page);
  });
});
