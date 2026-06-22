/**
 * Mock for Google IMA — installs the constants the contextual-reels code
 * branches on (`window.google.ima.AdEvent.Type`). Lightweight: no live ad
 * lifecycle, just the type strings.
 */

export interface ImaAdEventTypes {
  LOADED: "loaded";
  STARTED: "started";
  COMPLETE: "complete";
}

export interface ImaMockShape {
  google: {
    ima: {
      AdEvent: {
        Type: ImaAdEventTypes;
      };
    };
  };
}

export function installImaMock(): ImaMockShape["google"]["ima"] {
  const ima = {
    AdEvent: {
      Type: { LOADED: "loaded", STARTED: "started", COMPLETE: "complete" } as ImaAdEventTypes,
    },
  };
  const w = window as unknown as { google?: { ima?: typeof ima } };
  w.google = { ...(w.google ?? {}), ima };
  return ima;
}

export function resetImaMock(): void {
  const w = window as unknown as { google?: { ima?: unknown } };
  if (w.google) {
    delete w.google.ima;
  }
}
