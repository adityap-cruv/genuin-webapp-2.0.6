import React, { useCallback, useRef } from 'react'
import { Modal, Carousel } from 'react-bootstrap'
import imgCarousel1 from '../../assets/images/web3/learn_web3_via_bite-sized_content.png'
import imgCarousel2 from '../../assets/images/web3/connect_people_in_the_web3_business.png'
import imgCarousel3 from '../../assets/images/web3/feed_page_public_video.png'
import imgCarousel4 from '../../assets/images/web3/initiate_conversation_about_web3.png'

const WELCOME_DIALOG_SHOWN = 'WELCOME_DIALOG_SHOWN'

export const WelcomeModal = ({ show, onClose, ignoreLocalStorage = false }) => {
  const isAlreadyShown = useRef(
    Boolean(globalThis?.localStorage?.getItem?.(WELCOME_DIALOG_SHOWN) ?? false)
  )

  const onCloseWrapper = useCallback(() => {
    try {
      globalThis?.localStorage?.setItem?.(WELCOME_DIALOG_SHOWN, true)
    } catch (e) {
    } finally {
      onClose()
    }
  }, [onClose])

  return (
    <Modal
      key='welcome'
      show={ignoreLocalStorage ? show : isAlreadyShown.current ? false : show}
      onHide={onCloseWrapper}
      aria-labelledby='modal Welcome'
      centered
      className='modal-welcome'
    >
      <Modal.Header closeButton className='border-0'></Modal.Header>
      <Modal.Body className='text-center pt-0'>
        <Carousel controls={false}>
          <Carousel.Item>
            <img
              src={imgCarousel1.src}
              width={380}
              height={770}
              alt='Learn Web3 via bite-sized content'
              title='Learn Web3 via bite-sized content'
              className='img-fluid mx-auto d-block'
            />
            <h1>Learn Web3 via bite-sized content</h1>
          </Carousel.Item>
          <Carousel.Item>
            <img
              src={imgCarousel2.src}
              width={380}
              height={770}
              alt='Connect people in the Web3 business'
              title='Connect people in the Web3 business'
              className='img-fluid mx-auto d-block'
            />
            <h1>Connect people in the Web3 business</h1>
          </Carousel.Item>
          <Carousel.Item>
            <img
              src={imgCarousel3.src}
              width={380}
              height={770}
              alt='Showcase your Web3 knowledge'
              title='Showcase your Web3 knowledge'
              className='img-fluid mx-auto d-block'
            />
            <h1>Showcase your Web3 knowledge</h1>
          </Carousel.Item>
          <Carousel.Item>
            <img
              src={imgCarousel4.src}
              width={380}
              height={770}
              alt='Initiate conversation about Web3'
              title='Initiate conversation about Web3'
              className='img-fluid mx-auto d-block'
            />
            <h1>Initiate conversation about Web3</h1>
          </Carousel.Item>
        </Carousel>
      </Modal.Body>
    </Modal>
  )
}
