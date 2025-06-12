/**
 * Component that handles user reactions ("sparks") on content.
 * Displays both the reaction button and the current reaction count.
 */
import { abbreviateNumber } from '@lib/utils'
import { Reaction } from '@/components/common/reaction'
import { ActionItem } from './action-item'
import { useGenuinOptions } from '@lib/stores/genuin-options'

type ReactionActionProps = {
  /** Whether the current user has already reacted to this content */
  isSparked?: boolean | null | undefined
  /** Total number of reactions on this content */
  sparkCount: number
  /** ID of the content being reacted to */
  contentId: string
  /** URL for sharing the content */
  shareUrl: string
  /** Slug for the content URL */
  videoSlug: string
  /** Callback for when the reaction state changes */
  onSparkChange: (isSparked: boolean) => void
}

export function ReactionAction({
  isSparked,
  sparkCount,
  contentId,
  shareUrl,
  videoSlug,
  onSparkChange,
}: ReactionActionProps) {
  // Get the tooltip text from the config
  const { config } = useGenuinOptions((state) => ({
    config: state.config,
  }))

  return (
    <div>
      {/* Reaction button with tooltip from config */}
      <ActionItem title={config.reactions.tooltip ?? ''}>
        <Reaction
          isSparked={isSparked ?? false}
          sparkCount={sparkCount}
          contentId={contentId}
          shareUrl={shareUrl}
          videoSlug={videoSlug}
          showSparkCount={false}
          onSparkChange={onSparkChange}
        />
      </ActionItem>
      {/* Display the reaction count with abbreviation for large numbers */}
      <p className="flex justify-center text-body-1-demi text-monochrome-white">
        {abbreviateNumber(sparkCount < 0 ? 0 : sparkCount)}
      </p>
    </div>
  )
}
