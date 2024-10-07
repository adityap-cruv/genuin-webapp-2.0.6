import { Main } from './main'
import { Suspense } from 'react'

export default function Component() {
  return (
    <Suspense>
      <Main />
    </Suspense>
  )
}
