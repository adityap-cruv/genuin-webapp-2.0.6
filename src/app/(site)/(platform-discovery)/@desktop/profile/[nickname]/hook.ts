import { useState } from 'react'

export function getNextPage<T>(funcToCall: () => Promise<T>, stateUpdationFunc: (data: T) => void) {
  const [isFetchingNextPage, setIsFetdhingNextPage] = useState(false)

  function fetchNext() {
    setIsFetdhingNextPage(true)
    funcToCall()
      .then((res) => {
        stateUpdationFunc(res)
      })
      .catch((e) => {
        console.log('error in loops:', e)
      })
      .finally(() => {
        setIsFetdhingNextPage(false)
      })
  }

  return { isFetchingNextPage, fetchNext }
}
