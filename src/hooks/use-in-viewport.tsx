import { useEffect, useState, RefObject } from 'react'

/**
 * @param ref Reference of element.
 * @param rootMargin Defaults to 0px.
 * @returns {boolean | undefined} If element is 90% in viewport or not.
 */
export function useInViewport(ref: RefObject<HTMLElement>, rootMargin = '0px'): boolean | undefined {
  const [isInViewport, setIsInViewport] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Update the state based on the intersection ratio
        if (isInViewport !== entry.isIntersecting) setIsInViewport(entry.isIntersecting)
      },
      {
        rootMargin,
        threshold: [0.9],
      }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [ref, rootMargin])

  return isInViewport
}
