import { useShallow } from 'zustand/react/shallow'
import { usePlayerControlStore } from '../player-control-store'
import { Progress } from '@/components/ui/progress'

export function PlayerProgressBar() {
  const { currentTime, duration } = usePlayerControlStore(
    useShallow((state) => ({ currentTime: state.currentTime, duration: state.duration }))
  )

  let progressValue = 0
  if (duration !== 0) progressValue = Math.round((currentTime / duration) * 100)

  return <Progress value={progressValue} className="absolute bottom-0 left-0 h-[2px] transition-[width]" />
}
