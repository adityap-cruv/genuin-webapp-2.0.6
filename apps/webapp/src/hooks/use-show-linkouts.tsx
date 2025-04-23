import { useGenuinOptions } from '@/lib/stores/genuin-options'
import { useState, useEffect, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'

function useShowLinkouts({ isActive, linkoutId }: { isActive: boolean; linkoutId: number | null | undefined }) {
  const [showLinkouts, setShowLinkouts] = useState(false)
  const config = useGenuinOptions(useShallow((state) => state.config))

  const linkoutDelayConfig = useMemo(() => {
    return {
      appearAfter: config?.web_configs?.linkout_delay?.appear_after ?? 0,
      type: config?.web_configs?.linkout_delay?.type ?? 1,
    }
  }, [config])

  useEffect(() => {
    if (!isActive || !linkoutId) {
      setShowLinkouts(false)
      return
    }

    if (linkoutDelayConfig.type === 2) {
      setShowLinkouts(true)
      return
    }

    const timeoutId = setTimeout(() => {
      setShowLinkouts(true)
    }, linkoutDelayConfig.appearAfter * 1000)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [isActive, linkoutId, linkoutDelayConfig])

  return { showLinkouts }
}

export default useShowLinkouts
