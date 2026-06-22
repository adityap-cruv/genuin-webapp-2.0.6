import { afterEach, describe, expect, it, vi } from "vitest";

import { __setEnvForTests, createLogger } from "@cxr/utils/logger";

describe("createLogger", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    __setEnvForTests(undefined);
  });

  describe("in development", () => {
    it("logs debug, info, warn, error with namespace prefix", () => {
      __setEnvForTests({ PROD: false });
      const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => undefined);
      const infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

      const log = createLogger("cxr/test");
      log.debug("d");
      log.info("i");
      log.warn("w");
      log.error("e");

      expect(debugSpy).toHaveBeenCalledWith("[cxr/test]", "d");
      expect(infoSpy).toHaveBeenCalledWith("[cxr/test]", "i");
      expect(warnSpy).toHaveBeenCalledWith("[cxr/test]", "w");
      expect(errorSpy).toHaveBeenCalledWith("[cxr/test]", "e");
    });

    it("forwards multiple arguments untouched", () => {
      __setEnvForTests({ PROD: false });
      const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => undefined);
      const log = createLogger("cxr/test");
      log.debug("one", 2, { three: true });
      expect(debugSpy).toHaveBeenCalledWith("[cxr/test]", "one", 2, { three: true });
    });
  });

  describe("in production", () => {
    it("silences debug and info; keeps warn and error", () => {
      __setEnvForTests({ PROD: true });
      const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => undefined);
      const infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

      const log = createLogger("cxr/prod");
      log.debug("d");
      log.info("i");
      log.warn("w");
      log.error("e");

      expect(debugSpy).not.toHaveBeenCalled();
      expect(infoSpy).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalledWith("[cxr/prod]", "w");
      expect(errorSpy).toHaveBeenCalledWith("[cxr/prod]", "e");
    });
  });
});
