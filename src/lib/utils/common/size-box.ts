import { HEIGHT_OF_HEADER } from '@/lib/constants'
import { type VideoSizeBoxType, type SizeBoxesType, type ModalSizeBoxType } from '@lib/stores/genuin-options'

/**
 *
 * @param isMobile
 * @param showNavbar
 * @param showIHeartDemo If iheart demo is being shown or not.
 * @returns
 */
export function getSizeBoxes(isMobile: boolean, showNavbar: boolean, showIHeartDemo: boolean): SizeBoxesType {
  let sizes: SizeBoxesType = {
    modal: {
      height: -1,
      width: -1,
      player: {
        height: -1,
        width: -1,
      },
    },
    default: {
      height: -1,
      width: -1,
    },
  }

  if (isMobile) {
    const windowHeight = window.innerHeight
    const windowWidth = window.innerWidth
    sizes = {
      default: { height: windowHeight, width: windowWidth },
      modal: { height: windowHeight, width: windowWidth, player: { height: windowHeight, width: windowWidth } },
    }
  } else {
    sizes.default = getSizeDesktop(showNavbar, showIHeartDemo)
    sizes.modal = getSizeModal(showIHeartDemo)
  }

  return sizes
}

/**
 *
 * @param considerNavbar
 * @param iHeartDemo If iheart demo is being shown or not. then calculate the size of the video player.
 * @returns
 */
function getSizeDesktop(considerNavbar: boolean, iHeartDemo: boolean): VideoSizeBoxType {
  let windowHeight = considerNavbar ? window.innerHeight - HEIGHT_OF_HEADER : window.innerHeight
  if (iHeartDemo) {
    const element = document.getElementById('root-element')
    windowHeight = element?.clientHeight ?? windowHeight
  }
  const windowWidth = window.innerWidth
  let videoWidth = (windowHeight * 9) / 16

  if (videoWidth > windowWidth || windowWidth < 400) {
    videoWidth = windowWidth
  }
  return { height: windowHeight, width: videoWidth }
}

function getSizeModal(showIHeartDemo: boolean): ModalSizeBoxType {
  const windowHeight = window.innerHeight

  let playerHeight = windowHeight * 0.9
  playerHeight = showIHeartDemo ? playerHeight - 80 : playerHeight
  const playerWidth = playerHeight * (9 / 16)
  const modalWidth = playerWidth * 2

  return { height: playerHeight, width: modalWidth, player: { height: playerHeight, width: playerWidth } }
}
