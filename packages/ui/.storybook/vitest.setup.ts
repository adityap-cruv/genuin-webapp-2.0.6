import { setProjectAnnotations } from "@storybook/react-vite";
import { beforeAll } from "vitest";

import * as projectAnnotations from "./preview";

// This is an important step to apply the right configuration when testing your stories.
// More info at: https://storybook.js.org/docs/api/portable-stories/portable-stories-vitest#setprojectannotations
const project = setProjectAnnotations([projectAnnotations]);

// The browser's autoplay policy rejects HTMLMediaElement.play() when a story
// autoplays media without a user gesture. That surfaces as an unhandled
// NotAllowedError which fails the whole run even though no assertion failed.
// Stub play() to a resolved no-op so media-bearing stories render cleanly.
beforeAll(() => {
  if (typeof HTMLMediaElement !== "undefined") {
    HTMLMediaElement.prototype.play = () => Promise.resolve();
  }
});

beforeAll(project.beforeAll);
