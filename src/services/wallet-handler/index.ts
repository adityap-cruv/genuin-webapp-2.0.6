import { updateBalanceAPI } from '@/lib/api/wallet'
import { useGenuinOptions } from '@lib/stores/genuin-options'

export function useWalletBalanceHandler() {
  const { isWalletEnabled, globalRewardPointConfigs, setInitialData, walletBalance } = useGenuinOptions((state) => ({
    isWalletEnabled: state.config?.is_wallet_enabled ?? false,
    globalRewardPointConfigs: state.config?.global_reward_point_configs ?? {
      view: 0,
      spark: 0,
      comments: 0,
      repost: 0,
    },
    setInitialData: state.setData,
    walletBalance: state.walletBalance ?? 0,
  }))

  const handleWalletBalance = async (action: 'view' | 'spark' | 'comments' | 'repost') => {
    if (isWalletEnabled) {
      const updatedValue = (walletBalance ?? 0) + globalRewardPointConfigs[action]

      // Update state with new wallet balance
      setInitialData({
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

  return { handleWalletBalance }
}
