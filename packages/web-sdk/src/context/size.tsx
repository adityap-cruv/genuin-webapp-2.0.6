import { SizeBoxType } from '@/type'
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react'
import { useBaseContext } from './base'
import { NAV_BAR_HEIGHT } from '@/const'

type SizeBoxesType = {
  /**
   * Height and width of the video box.
   */
  video: SizeBoxType
  /**
   * Height and width of the modal box for video player.
   */
  modal: SizeBoxType
  /**
   * Height and width of the modal box for video player in full screen modal view.
   */
  modalVideo: SizeBoxType
  element: SizeBoxType
}

type SizeContextType = {
  isMobile: boolean
  sizeBoxes: SizeBoxesType
}

const SizeContext = createContext<SizeContextType>({
  isMobile: false,
  sizeBoxes: {
    video: { height: 0, width: 0 },
    modal: { height: 0, width: 0 },
    modalVideo: { height: 0, width: 0 },
    element: { height: 0, width: 0 },
  },
})

export function SizeProvider({ children }: { children: React.ReactNode }) {
  const { customizations } = useBaseContext()
  const considerNavBar = customizations?.show_navigation ?? false
  const element = customizations?.element ?? null

  const [sizeBoxes, setSizeBoxes] = useState<
    SizeBoxesType & { showMobileView?: boolean }
  >(() => getInitialSizeBoxes(element, considerNavBar))

  const handleResize = useCallback(() => {
    if (!element) return
    setSizeBoxes(calculateSizeBoxes(element, considerNavBar))
  }, [element, considerNavBar])

  useEffect(() => {
    if (!element) return

    // Debounce the resize handler
    let timeoutId: NodeJS.Timeout
    const debouncedHandleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(handleResize, 100)
    }

    window.addEventListener('resize', debouncedHandleResize)
    return () => {
      window.removeEventListener('resize', debouncedHandleResize)
      clearTimeout(timeoutId)
    }
  }, [element, handleResize])

  const contextValue = useMemo(
    () => ({
      isMobile: Boolean(sizeBoxes.showMobileView),
      sizeBoxes,
    }),
    [sizeBoxes],
  )

  return (
    <SizeContext.Provider value={contextValue}>{children}</SizeContext.Provider>
  )
}

const calculateSizeBoxes = (
  element: HTMLElement,
  considerNavBar: boolean,
): SizeBoxesType & { showMobileView?: boolean } => {
  const elementHeight = element.clientHeight
  const elementWidth = element.clientWidth
  const showMobileView = window.innerWidth < 768
  const modalSizeBox = calculateModalSize(window.innerWidth, window.innerHeight)
  const videoHeight = considerNavBar
    ? elementHeight - NAV_BAR_HEIGHT
    : elementHeight
  const videoWidth = videoHeight * (9 / 16)

  return {
    showMobileView,
    element: {
      width: elementWidth,
      height: elementHeight,
    },
    video: showMobileView
      ? getMobileViewSizeBox({ height: elementHeight, width: elementWidth })
      : {
          height: videoHeight,
          width: videoWidth,
        },
    modal: modalSizeBox,
    modalVideo: {
      width: (modalSizeBox.height * 9) / 16,
      height: modalSizeBox.height,
    },
  }
}

const getInitialSizeBoxes = (
  element: HTMLElement | null,
  considerNavBar: boolean,
): SizeBoxesType & { showMobileView?: boolean } => {
  if (!element) {
    return {
      showMobileView: undefined,
      element: { height: 0, width: 0 },
      video: { height: 0, width: 0 },
      modal: { height: 0, width: 0 },
      modalVideo: { height: 0, width: 0 },
    }
  }

  return calculateSizeBoxes(element, considerNavBar)
}

// TODO: Rename this to useSize.
export function useSizeContext() {
  const context = useContext(SizeContext)
  if (!context)
    throw new Error('Please use this component inside size context component.')

  return context
}

function getMobileViewSizeBox(elementSizeBox: SizeBoxType): SizeBoxType {
  const calculatedWidth = (9 / 16) * elementSizeBox.height
  if (calculatedWidth < elementSizeBox.width) {
    return {
      width: calculatedWidth,
      height: elementSizeBox.height,
    }
  }
  return {
    width: elementSizeBox.width,
    height: elementSizeBox.height,
  }
}

// Constants for configuration
const MOBILE_BREAKPOINT = 500
const SIDEBAR_WIDTH = 85
const DESKTOP_HEIGHT_RATIO = 0.8
const ASPECT_RATIO = {
  width: 9,
  height: 16,
}

// Get mobile view dimensions
const getMobileSize = (windowWidth: number, windowHeight: number) => ({
  width: windowWidth,
  height: windowHeight,
})

// Get desktop dimensions when space is not constrained
const getDesktopSize = (windowHeight: number) => {
  const height = windowHeight * DESKTOP_HEIGHT_RATIO
  const width = ((height * ASPECT_RATIO.width) / ASPECT_RATIO.height) * 2
  return { width, height }
}

// Get constrained desktop dimensions
const getConstrainedDesktopSize = (windowWidth: number) => {
  const width = windowWidth - SIDEBAR_WIDTH
  const height = (width / 2) * (ASPECT_RATIO.height / ASPECT_RATIO.width)
  return { width, height }
}

// Main size calculator
const calculateModalSize = (windowWidth: number, windowHeight: number) => {
  // Calculate initial desktop size
  const desktopSize = getDesktopSize(windowHeight)

  // Determine which size to use
  if (windowWidth <= MOBILE_BREAKPOINT) {
    return getMobileSize(windowWidth, windowHeight)
  }

  if (desktopSize.width + SIDEBAR_WIDTH > windowWidth) {
    return getConstrainedDesktopSize(windowWidth)
  }

  return desktopSize
}
