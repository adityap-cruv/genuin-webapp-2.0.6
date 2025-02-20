'use client'
import { createContext, useContext, type ReactNode, useState, useRef, type MutableRefObject, useEffect } from 'react'
import { STATIONS } from '../layouts/desktop/iheart-demo'
import { PATH_NAME } from '@/lib/utils/constants/path'
import { usePathname } from 'next/navigation'

type IHeartDemoContextType = {
  brandId: string
  shouldShowIHeartDemo: boolean
  renderIn: 'root' | 'modal'
  setRenderIn: React.Dispatch<React.SetStateAction<'root' | 'modal'>>
  element: HTMLElement | null
  setElement: React.Dispatch<React.SetStateAction<HTMLElement | null>>
  audioStateRef: MutableRefObject<{
    duration: number
    currentTime: number
    shouldPlay: boolean
  }>
  isIHeartPlaying: boolean
  setIsIHeartPlaying: React.Dispatch<React.SetStateAction<boolean>>
  audioUrl: string
  setAudioUrl: (newUrl: string) => void
}

const IHeartDemoContext = createContext<IHeartDemoContextType>({
  brandId: '',
  shouldShowIHeartDemo: false,
  renderIn: 'root',
  setRenderIn: () => {},
  element: null,
  setElement: () => {},
  audioStateRef: { current: { duration: 0, currentTime: 0, shouldPlay: false } },
  isIHeartPlaying: false,
  setIsIHeartPlaying: () => {},
  audioUrl: '',
  setAudioUrl: () => {},
})

const considerBrandIdsToShowIHeartDemo = ['1429', '1729', '1775', '2236', '2249']

// paths for each communities.
const communityPaths = STATIONS.flatMap((station) =>
  station.communities.map((community) => PATH_NAME.community(community.slug))
)

// audio urls for each communities. Here community index is used to get respective audio stream.
const audioUrls = STATIONS.flatMap((station) => station.communities.map((community) => community.audio))

export function getAudioUrlForCommunity(communitySlug: string) {
  const communityIndex = communityPaths.findIndex((path) => path === PATH_NAME.community(communitySlug))
  if (communityIndex === -1) return
  return audioUrls[communityIndex]
}

const brands = STATIONS.flatMap((station) => station.communities.map((community) => community.brand))
export function getAudioUrlForBrand(brandSlug: string) {
  const brandIndex = brands.findIndex((brand) => brand === brandSlug)
  if (brandIndex === -1) return
  return audioUrls[brandIndex]
}

export function IHeartDemoProvider({
  children,
  brandId,
}: {
  children: ReactNode
  shouldShowDemo: boolean
  brandId: string
}) {
  const [element, setElement] = useState<HTMLElement | null>(null)
  const [renderIn, setRenderIn] = useState<'root' | 'modal'>('root')
  const audioPlayerStateRef = useRef<{ duration: number; currentTime: number; shouldPlay: boolean }>({
    duration: 0,
    currentTime: 0,
    shouldPlay: true,
  })
  const pathName = usePathname()
  const [isIHeartPlaying, setIsIHeartPlaying] = useState(false)
  const [audioUrl, setAudioUrl] = useState(
    'https://www.iheart.com/live/z100-1469/?embed=true&pname=begeniun&autoplay=1'
  )

  useEffect(() => {
    // iframe element
    // find communityIndex for which path is equal to pathName
    const communityIndex = communityPaths.findIndex((path) => path === pathName)
    // if communityIndex is found, set the src of iframe to audioUrls[communityIndex]
    if (communityIndex !== -1) {
      setAudioUrl(audioUrls[communityIndex])
    }
  }, [pathName])

  return (
    <IHeartDemoContext.Provider
      value={{
        brandId,
        shouldShowIHeartDemo: considerBrandIdsToShowIHeartDemo.includes(brandId.toString()),
        renderIn,
        setRenderIn,
        element,
        setElement,
        audioStateRef: audioPlayerStateRef,
        isIHeartPlaying,
        setIsIHeartPlaying,
        audioUrl,
        setAudioUrl,
      }}>
      {children}
    </IHeartDemoContext.Provider>
  )
}

export const useIHeartDemoStates = () => useContext(IHeartDemoContext)
