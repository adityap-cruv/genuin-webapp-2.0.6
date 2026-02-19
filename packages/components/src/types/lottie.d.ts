/**
 * TypeScript declarations for Lottie JSON file imports
 *
 * This allows importing Lottie JSON files as modules:
 * import animation from './animation.json'
 */

declare module "*.json" {
  const content: any;
  export default content;
}
