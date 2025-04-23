import { useBaseContext } from '@/context/base'
import { useState, useEffect, useMemo, useCallback } from 'react'

function useShowLinkouts({
  isActive,
  linkoutId,
}: {
  isActive: boolean
  linkoutId: string
}) {
  const [showLinkouts, setShowLinkouts] = useState(false)
  const { brandDetails } = useBaseContext()

  const linkoutDelayConfig = useMemo(() => {
    return {
      appearAfter: brandDetails?.web_configs?.linkout_delay?.appear_after ?? 0,
      type: brandDetails?.web_configs?.linkout_delay?.type ?? 1,
    }
  }, [brandDetails])

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

    return () => clearTimeout(timeoutId)
  }, [isActive, linkoutId, linkoutDelayConfig])

  return { showLinkouts }
}

export default useShowLinkouts
