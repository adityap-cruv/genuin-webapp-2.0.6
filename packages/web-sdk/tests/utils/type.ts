/**
 * @fileoverview Shared TypeScript types for SDK E2E tests.
 *
 * Contains interfaces and types used across test helpers and spec files
 * to ensure type-safe container creation and configuration.
 *
 * @author Genuin Team
 */

export interface CreateContainerOptions {
  id?: string;
  className?: string;
  style?: string;
  dataAttributes?: Record<string, string>;
}
