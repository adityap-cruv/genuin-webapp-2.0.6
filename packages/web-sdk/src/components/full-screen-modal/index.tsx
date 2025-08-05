import { useBaseContext } from '@/context/base'
import { ExpandView } from '../expand-view'
import { useExpandViewContext } from '@/components/expand-view/context'

export function FullScreenModal() {
  const { toggleFullScreen } = useExpandViewContext()
  const { activeIndex, videos, updateActiveIndex } = useBaseContext()

  return (
    <ExpandView
      videos={videos}
      activeIndex={activeIndex}
      onActiveIndexChange={updateActiveIndex}
      onCloseExpandView={() => {
        toggleFullScreen()
      }}
    />
  )
}
