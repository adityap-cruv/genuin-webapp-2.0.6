"use client";

import type { IntelligenceAutoPromptCountdownState } from "./intelligence-chat.types";

/**
 * Transient auto-prompt preview shown before the prompt is committed to the
 * conversation. Mirrors the GenAI countdown treatment without depending on
 * the GenAI provider tree or state machine.
 */
export function IntelligenceAutoPromptCountdown({ prompt, remainingSeconds }: IntelligenceAutoPromptCountdownState) {
  return (
    <div
      role="status"
      aria-live="polite"
      data-slot="intelligence-auto-prompt-countdown"
      className="gencl:flex gencl:w-full gencl:justify-end">
      <div className="gencl:flex gencl:w-full gencl:flex-col gencl:items-end gencl:gap-2">
        <div className="gencl:max-w-[90%] gencl:rounded-3xl gencl:rounded-br-none gencl:bg-secondary-50 gencl:px-4 gencl:py-3 gencl:text-body-1-medium gencl:text-secondary-900">
          {prompt}
        </div>

        <div aria-hidden="true" className="gencl:flex gencl:items-center gencl:gap-1.5 gencl:px-1">
          <span className="gencl:flex gencl:size-4 gencl:items-center gencl:justify-center gencl:rounded-full gencl:bg-blue">
            <span className="gencl:text-[10px] gencl:leading-none gencl:font-bold gencl:text-white">
              {remainingSeconds}
            </span>
          </span>
          <span className="gencl:text-[10px] gencl:text-secondary-500">Prompting in...</span>
        </div>

        <span className="gencl:sr-only">Auto prompt will send in {remainingSeconds} seconds.</span>
      </div>
    </div>
  );
}
