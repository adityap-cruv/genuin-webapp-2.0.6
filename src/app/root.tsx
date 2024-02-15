'use client'
import { NavBar } from '@components/pages/home/nav-bar'
import { Footer } from '@components/pages/home/footer'
import { MainComponent } from '@components/pages/home/main-component'
import { useGenuinOptions } from '@lib/stores/genuin-options'

export function Root() {
  const config = useGenuinOptions().config
  if (!config)
    return (
      <>
        <NavBar />
        <MainComponent />
        <Footer />
      </>
    )
}
