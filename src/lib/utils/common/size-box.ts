import { type VideoSizeBoxType, type SizeBoxesType, type ModalSizeBoxType } from '@lib/stores/genuin-options'

export function getSizeBoxes(isMobile: boolean, showNavbar: boolean): SizeBoxesType {
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
    sizes.default = getSizeDesktop(showNavbar)
    sizes.modal = getSizeModal()
  }

  return sizes
}

function getSizeDesktop(considerNavbar: boolean): VideoSizeBoxType {
  const windowHeight = considerNavbar ? window.innerHeight - 77 : window.innerHeight
  const windowWidth = window.innerWidth
  let videoWidth = (windowHeight * 9) / 16

  if (videoWidth > windowWidth || windowWidth < 400) {
    videoWidth = windowWidth
  }
  return { height: windowHeight, width: videoWidth }
}

function getSizeModal(): ModalSizeBoxType {
  const windowHeight = window.innerHeight

  const playerHeight = windowHeight * 0.9
  const playerWidth = playerHeight * (9 / 16)
  const modalWidth = playerWidth * 2

  return { height: playerHeight, width: modalWidth, player: { height: playerHeight, width: playerWidth } }
}
