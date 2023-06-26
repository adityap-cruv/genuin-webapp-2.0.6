import React, { useState } from 'react'
import { Image, Navbar, Button } from 'react-bootstrap'
import logo from '../../assets/images/logo_header_new.svg'
import logoBlue from '../../assets/images/logo_header_new_blue.svg'
import { handleHireLinkClick } from '../../actions/appInstall'
import { BurgerMenu } from './burger_menu'
import { useBreakpointValue } from '@chakra-ui/react'
import { analyticsService } from '../basic/analytics_service'

export const HomeNav = ({
  showGetAppModal,
  // hideBurgerMenu = false,
  isContiner = false,
  isBlue = false,
  variant = 'dark'
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const mobile = useBreakpointValue({ base: true, md: false })

  return (
    <Navbar
      {...(isContiner ? { className: 'p-3 container' } : { className: 'p-3' })}
      expand={false}
      fixed='top'
      onToggle={(isOpen) => setIsOpen(isOpen)}
      style={{
        background: variant === 'light' ? 'transparent' : 'white'
      }}
      variant={variant}
    >
      <Navbar.Brand href='/' className='p-0'>
        <Image
          src={isBlue ? logoBlue.src : logo.src}
          alt='Genuin'
          title='Genuin'
        />
      </Navbar.Brand>
      <div className='d-flex align-items-center justify-content-center'>
        <Button
          variant="outline-light me-3"
          className="custom-home-button"
          onClick={handleHireLinkClick}
          style={{
            fontSize: 17,
            padding: '0.275rem 2rem',
            borderRadius: '5px'
          }}
        >
            Join Our Team
        </Button>
        <Button
          variant='primary'
          className='me-3 custom-home-button'
          onClick={() => {
            showGetAppModal(true)

            const event_name = 'get_app'
            const event_details = {
              page: window.location.href
            }
            const user_details = {}
            analyticsService({ eventDetails: event_details, eventName: event_name, userDetails: user_details })

          }}
          style={{
            fontSize: 17,
            padding: '0.275rem 2rem',
            borderRadius: '5px'
          }}
        >
          Get App
        </Button>
        <BurgerMenu
          hideBurgerMenu={!mobile}
          isContiner={isContiner}
          isOpen={isOpen}
        />
      </div>
    </Navbar>
  )
}
