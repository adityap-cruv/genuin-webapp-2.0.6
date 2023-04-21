import React from 'react'
import {
  Text,
  VStack,
  Image,
  Flex
} from '@chakra-ui/react'
import { Modal } from 'react-bootstrap'
import logo from '../../assets/images/Genuin_icon_vector.svg'
import { InstallApp } from '../basic/install_app'
import { DownloadAppForm } from './download_app_form'
import { isMobile } from 'react-device-detect'

export const DownloadAppPopup = ({ show, onClose, TextNode = () => null, title = 'Download App' }) => {
  return (
    <Modal
      key='app'
      show={show}
      onHide={onClose}
      centered
      className='modal-app-download'
      style={{
        zIndex: 10000
      }}
      backdrop='static'
    >
      <Modal.Header closeButton className='border-0' ></Modal.Header>
      <Modal.Body className='py-0' style={{
        padding: '2.5rem'
      }}>
        <VStack height='100%'>
          <Image src={logo.src} alt='Genuin' title='Genuin' h={16} />
          <Text fontWeight={700} fontSize={40}>
              Get Genuin
          </Text>
          <Text fontSize={17} fontWeight={600}>
            Send the download link to your phone & email
          </Text>
          <DownloadAppForm/>
        </VStack>
      </Modal.Body>
      <Modal.Footer className='justify-content-center border-0 py-10'>
        <Flex pb='15px' pt='15px' px={isMobile ? 7 : 0}>
          <InstallApp small onClick={onClose} />
        </Flex>
      </Modal.Footer>
    </Modal>
  )
}
