import { useState } from 'react'

export function getNextPage<T>(funcToCall: () => Promise<T>, stateUpdationFunc: (data: T) => void) {
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false)

  function fetchNext() {
    setIsFetchingNextPage(true)
    funcToCall()
      .then((res) => {
        stateUpdationFunc(res)
      })
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.log('error in loops:', e)
      })
      .finally(() => {
        setIsFetchingNextPage(false)
      })
  }

  return { isFetchingNextPage, fetchNext }
}
