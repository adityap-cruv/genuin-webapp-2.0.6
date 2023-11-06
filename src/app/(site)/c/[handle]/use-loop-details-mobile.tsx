import { useState, useRef, useCallback } from 'react'
import { fetchCommunityLoopDetails } from '@lib/api/community'

export const useLoopDetailsMobile = (communityHandle: string) => {
  const [loopList, setLoopList] = useState<any[]>([])
  const getLoops = useRef(fetchCommunityLoopDetails)
  const isLoadingRef = useRef(false)
  const isEndedRef = useRef(false)

  const fetchNextLoops = useCallback(
    function () {
      if (isLoadingRef.current || isEndedRef.current) return
      getLoops.current(communityHandle).then((loops: any) => {
        if (loops.length === 0) {
          isEndedRef.current = true
          return
        }
        setLoopList([...loopList, ...loops])
        isLoadingRef.current = false
      })
    },
    [loopList, communityHandle]
  )

  return [loopList, fetchNextLoops] as const
}
