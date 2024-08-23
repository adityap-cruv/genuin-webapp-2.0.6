import { updateBalanceAPI } from '@/lib/api/wallet'
import { useGenuinOptions } from '@lib/stores/genuin-options'

const interactedVideos: Record<string, { [key in 'view' | 'spark' | 'comments' | 'repost']?: boolean }> = {}

export const handleWalletBalance = async ({
  action,
  videoId,
  type,
}: {
  action: 'view' | 'spark' | 'comments' | 'repost'
  videoId?: string
  type?: 'POST'
}) => {
  const { config, walletBalance, setData } = useGenuinOptions.getState()

  const isWalletEnabled = config?.is_wallet_enabled ?? false
  const globalRewardPointConfigs = config?.global_reward_point_configs ?? {
    view: 0,
    spark: 0,
    comments: 0,
    repost: 0,
  }

  if (!isWalletEnabled || !videoId) return

  if (!interactedVideos[videoId]) {
    interactedVideos[videoId] = {}
  }

  if (interactedVideos[videoId][action]) {
    return
  }

  const updatedValue = (walletBalance ?? 0) + globalRewardPointConfigs[action]
  const metadata = {
    content_id: videoId ?? '',
    content_type: type ?? '',
  }

  setData({
    walletBalance: updatedValue,
  })

  // Call the API to log the event
  try {
    await updateBalanceAPI({
      action: action.toUpperCase(),
      amount: globalRewardPointConfigs[action],
      metadata,
    })

    // Mark this action as completed for the video
    interactedVideos[videoId][action] = true
  } catch (error) {
    console.error('Failed to update balance:', error)
  }
}

// Hook to use inside React components
export function useWalletBalanceHandler() {
  return { handleWalletBalance }
}
