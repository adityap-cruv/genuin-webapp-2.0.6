import { useShallow } from 'zustand/react/shallow'
import { usePlayerControlStore } from '../player-control-store'
import { Progress } from '@/components/ui/progress'
import { useMemo } from 'react'

export function PlayerProgressBar() {
  const { currentTime, duration } = usePlayerControlStore(
    useShallow((state) => ({ currentTime: state.currentTime, duration: state.duration }))
  )

  const progressValue = useMemo(() => {
    if (duration === 0) return 0
    return Math.round((currentTime / duration) * 100)
  }, [currentTime, duration])

  return <Progress value={progressValue} className="absolute bottom-0 left-0 h-[2px] transition-all duration-300" />
}
