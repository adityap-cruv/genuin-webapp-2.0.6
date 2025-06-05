// mitt.d.ts
// TypeScript type helper for mitt event emitter
import mitt from "mitt";

export type MittEmitter<T = Record<string, unknown>> = ReturnType<
  typeof mitt<T>
>;
