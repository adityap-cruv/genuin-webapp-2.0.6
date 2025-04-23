import { memo, useEffect, useRef, useState } from 'react'

type AnimatedTextProps = {
  text: string
  width: number
  /**
   * If this parameter is set to true, the animation will stop.
   */
  stop: boolean
}

export const AnimatedText = memo(function ({
  text,
  width = 125,
  stop,
}: AnimatedTextProps) {
  const [animateText, setAnimateText] = useState(false)
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    animationIntervalRef.current = setInterval(() => {
      setAnimateText((prev) => !prev)
    }, 3000)

    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (stop) {
      stopAnimation()
    }
  }, [stop])

  const stopAnimation = () => {
    if (animationIntervalRef.current) {
      clearInterval(animationIntervalRef.current)
      animationIntervalRef.current = null
      setAnimateText(false)
    }
  }

  return (
    <div
      className='text-body-1 flex min-w-0 overflow-hidden whitespace-nowrap transition-[width,opacity] duration-500 ease-in-out'
      style={{
        width: animateText ? width : '0px',
        opacity: animateText ? 1 : 0,
      }}>
      <p className='text-white pr-4'>{text}</p>
    </div>
  )
})
