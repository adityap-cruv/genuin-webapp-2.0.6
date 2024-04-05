import { useGenuinOptions } from '@lib/stores/genuin-options'
import { useEffect, useRef, useState } from 'react'

// TODO: refactor use of is mobile and issafari.
/**
 * Add only <li></li> elements in it.
 * @param param0
 * @returns
 */
export function DecorativeList({ children }: any) {
  const { isMobile, isSafari } = useGenuinOptions((state) => ({ isMobile: state.isMobile, isSafari: state.isSafari }))
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
    const obs = new ResizeObserver(onChange)
    if (ul.current) obs.observe(ul.current)
    return () => {
      obs.disconnect()
    }
  }, [ul])
  return (
    <div>
      <style>
        {`          
                ul.custom-list li.has-child::before {
                  display: none;
                }
                
                ul.custom-list li::before {
                  content: '';
                  width: 1em;
                  height: 10px;
                  border-bottom-left-radius: 10px;
                  border-color: red;
                  border-bottom: 2px solid #F4F4F4;
                  border-left: 2px solid #F4F4F4;
                  position: absolute;
                  left: -1em;
                  top: 50%;
                  transform: translateY(-100%);
                }
              `}
      </style>
      <ul
        className="custom-list"
        ref={ul}
        style={{
          borderLeft: '2px solid',
          marginLeft: '22px',
          position: 'relative',
          height: 'fit-content',
          paddingLeft: '0.87em',
          borderImage: `linear-gradient(to bottom, #F4F4F4 calc(100% - ${lastLiHeight / 2}px - ${
            isSafari ? (isMobile ? '18px' : '25px') : '9.5px'
          }), transparent 50%) 1`,
        }}>
        {children}
      </ul>
    </div>
  )
}
