'use client'
import { useGenuinOptions } from '@lib/stores/genuin-options'
// import { useEffect, useState } from 'react'
import { Settings } from '@lib/api/settings'
import { Loader } from '@components/ui/loader'
import { Personalization } from './personalization'
import { Toaster } from '@/components/ui/toaster'
import { useQuery } from '@tanstack/react-query'

export default function MainComponent() {
  const isMobile = useGenuinOptions().isMobile
  const { data: settingsData, isLoading } = useQuery({ queryKey: ['user', 'settings'], queryFn: Settings })

  // useEffect(() => {
  //   async function fetchSettings() {
  //     try {
  //       const { data } = await Settings()
  //       setSettingsData(data)
  //     } catch (error) {
  //       throw new Error()
  //     }
  //   }
  //   void fetchSettings()
  // }, [])

  if (isLoading)
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader size="md" />
      </div>
    )
  if (settingsData)
    return (
      <>
        <Personalization settingsData={settingsData.data} isMobile={isMobile} />
        <Toaster />
      </>
    )
}
