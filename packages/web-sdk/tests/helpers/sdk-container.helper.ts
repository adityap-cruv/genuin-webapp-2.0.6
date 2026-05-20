/**
 * @fileoverview SDK container creation helpers for E2E tests.
 *
 * Provides functions to dynamically create and configure SDK container `<div>` elements
 * in the browser DOM. These containers are what the SDK targets during initialization
 * (elements with `data-embed-id`, `data-api-key`, etc.).
 *
 * @author Genuin Team
 */

import type { Page } from "@playwright/test";

import type { CreateContainerOptions } from "../utils/type";

/**
 * Create a single SDK container `<div>` in the DOM.
 *
 * Inserts a `<div>` element into `document.body` with the specified id, class, style,
 * and data attributes. The SDK will detect this container during `init()` and render
 * video content inside it.
 *
 * @param page - Playwright Page instance
 * @param options - Container configuration (id, className, style, dataAttributes)
 * @param options.id - HTML element ID (default: 'gen-sdk')
 * @param options.className - CSS class name (default: 'gen-sdk-class')
 * @param options.style - Inline CSS style (default: 'width: 100vw; height: 100vh;')
 * @param options.dataAttributes - Key-value pairs added as `data-*` attributes (e.g., { 'embed-id': '...' })
 */
export async function createSDKContainer(page: Page, options: CreateContainerOptions = {}) {
  const {
    id = "gen-sdk",
    className = "gen-sdk-class",
    style = "width: 100vw; height: 100vh;",
    dataAttributes = {},
  } = options;

  await page.evaluate(
    ({ id, className, style, dataAttributes }) => {
      const container = document.createElement("div");
      container.id = id;
      container.className = className;
      container.setAttribute("style", style);

      Object.entries(dataAttributes).forEach(([key, value]) => {
        container.setAttribute(`data-${key}`, value);
      });

      document.body.appendChild(container);
    },
    { id, className, style, dataAttributes }
  );
}

/**
 * Add data attributes to an existing SDK container.
 *
 * Finds the container by ID prefix and sets additional `data-*` attributes.
 * Used to configure contextual params, actions, or video slugs after container creation.
 *
 * @param page - Playwright Page instance
 * @param dataAttributes - Key-value pairs to set as `data-*` attributes
 * @param containerId - ID prefix to locate the container (default: 'gen-sdk')
 * @throws Error if no container with the given ID prefix is found
 */
export async function addAttributesToContainer(
  page: Page,
  dataAttributes: Record<string, string>,
  containerId: string = "gen-sdk"
) {
  await page.evaluate(
    ({ containerId, dataAttributes }) => {
      const container = document.querySelector(`[id^="${containerId}"]`);

      if (!container) {
        throw new Error(`Container with id "${containerId}" not found`);
      }
      Object.entries(dataAttributes).forEach(([key, value]) => {
        container.setAttribute(`data-${key}`, value);
      });
    },
    { containerId, dataAttributes }
  );
}

/**
 * Create multiple SDK containers for multi-embed testing.
 *
 * Iterates over an array of container configs and creates each one.
 * Returns the total count and an array of container IDs for use in assertions.
 *
 * @param page - Playwright Page instance
 * @param containers - Array of container configurations
 * @returns Object with `containerLength` (total count) and `containerId` (array of IDs)
 */
export async function createMultipleSDKContainers(
  page: Page,
  containers: CreateContainerOptions[]
): Promise<{ containerLength: number; containerId: string[] }> {
  const containerId: string[] = [];
  for (const options of containers) {
    const id = options.id || "gen-sdk";
    containerId.push(id);
    await createSDKContainer(page, options);
  }
  return {
    containerLength: containers.length,
    containerId,
  };
}
