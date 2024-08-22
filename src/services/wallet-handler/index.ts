import { updateBalanceAPI } from '@/lib/api/wallet'
import { useGenuinOptions } from '@lib/stores/genuin-options'

export const handleWalletBalance = async (action: 'view' | 'spark' | 'comments' | 'repost') => {
  const { config, walletBalance, setData } = useGenuinOptions.getState()

  const isWalletEnabled = config?.is_wallet_enabled ?? false
  const globalRewardPointConfigs = config?.global_reward_point_configs ?? {
    view: 0,
    spark: 0,
    comments: 0,
    repost: 0,
  }

  if (isWalletEnabled) {
    const updatedValue = (walletBalance ?? 0) + globalRewardPointConfigs[action]

    // Update state with new wallet balance
    setData({
      walletBalance: updatedValue,
    })

    // Call API to log event
    try {
      await updateBalanceAPI({ action: action.toUpperCase(), amount: globalRewardPointConfigs[action], metadata: {} })
    } catch (error) {
      console.error('Failed to update balance:', error)
    }
  }
}

// Hook to use inside React components
export function useWalletBalanceHandler() {
  return { handleWalletBalance }
}
