/**
 * Type declaration for the "light" hls.js entry (`hls.js/light`).
 *
 * The package ships declarations only for its main entry; the `./light`
 * subpath export has no bundled `.d.ts`. Its runtime API is a strict subset of
 * the full build, so we re-export the main module's types — the CXR player only
 * uses `isSupported`, the constructor, `loadSource`/`attachMedia`/`startLoad`/
 * `stopLoad`/`destroy`, `Events.MANIFEST_PARSED`, and level pinning, all common
 * to both builds.
 */
declare module "hls.js/light" {
  import Hls from "hls.js";
  export * from "hls.js";
  export default Hls;
}
