import { useEffect, useRef, useState, type ComponentProps } from 'react'

type Props = ComponentProps<'ul'>

// TODO: refactor use of is mobile and issafari.
/**
 * Add only <li></li> elements in it.
 * @param param0
 * @returns
 */
export function DecorativeList({ children, className, ...props }: Props) {
  // const [device, setDevice] = useState<{
  //   isMobile: boolean
  //   isSafari: boolean
  // } | null>(null)
  const [lastLiHeight, setLastLiHeight] = useState(0)
  const ul = useRef<HTMLUListElement>(null)

  useEffect(() => {
    function onChange() {
      const li = ul.current?.querySelector('li:last-child')
      if (li) {
        const height = getComputedStyle(li).height
        setLastLiHeight(+height.substring(0, height.length - 2))
      }
    }
    // const isMobile = window.matchMedia('(max-width: 768px)').matches
    // const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    // // setDevice({ isMobile, isSafari })
    const obs = new ResizeObserver(onChange)
    if (ul.current) obs.observe(ul.current)
    return () => {
      obs.disconnect()
    }
  }, [ul])

  return (
    <>
      <ul
        className={'gen-sdk-custom-custom-decorative-list ' + className}
        ref={ul}
        style={{
          borderLeft: '2px solid',
          marginLeft: '15px',
          position: 'relative',
          height: 'fit-content',
          paddingLeft: '0.87em',
          borderImage: `linear-gradient(to bottom, var(--tertiary-200) calc(100% - ${lastLiHeight / 2 + 7}px), transparent 50%) 1`,
        }}
        {...props}>
        {children}
      </ul>
    </>
  )
}
