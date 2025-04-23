import { useEffect } from 'react'

const useInfiniteScroll = (
  loaderId: string,
  fetchNextPage: () => void,
  hasNextPage: boolean,
  isLoading: boolean,
) => {
  useEffect(() => {
    if (!hasNextPage || isLoading) return

    const lastElement = document.getElementById(loaderId)
    if (!lastElement) return

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        void fetchNextPage()
      }
    })

    observer.observe(lastElement)

    return () => {
      observer.disconnect()
    }
  }, [loaderId, fetchNextPage, hasNextPage, isLoading])
}

export default useInfiniteScroll
