import React, { useState } from 'react'
import { Image, Navbar, Button } from 'react-bootstrap'
import logo from '../../assets/images/logo_header_new.svg'
import logoBlue from '../../assets/images/logo_header_new_blue.svg'
import { useBreakpointValue, Link } from '@chakra-ui/react'
import { BurgerMenu } from './burger_menu'
import { appStoreLink } from '../../config'
import { analyticsService } from '../basic/analytics_service'

export const TopNav = ({
  showGetAppModal,
  hideBurgerMenu = false,
  isContiner = false,
  isBlue = false,
  variant = 'dark',
  backgroundColor = undefined
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const mobile = useBreakpointValue({ base: true, sm: false })

  return (
    <Navbar
      expand={false}
      fixed='top'
      onToggle={(isOpen) => setIsOpen(isOpen)}
      style={{
        background: variant === 'light' ? 'transparent' : 'white',
        backgroundColor,
        pointerEvents: 'none'
      }}
      variant={variant}
    >
      <div
        {...(isContiner ? { className: 'p-2 container' } : { className: 'p-2' })}
        style={{
          display: 'flex',
          width: '100%',
          justifyContent: 'space-between'
        }}
      >
        <Navbar.Brand href='/' className='p-0' style={{ pointerEvents: 'all' }}>
          <Image
            src={isBlue ? logoBlue.src : logo.src}
            alt='Genuin'
            title='Genuin'
          />
        </Navbar.Brand>
        <div className='d-flex align-items-center justify-content-center'>
          {!mobile && (
            <Button
              variant='primary'
              className='me-3'
              onClick={() => {
                showGetAppModal()

                const event_name = 'get_app'
                const event_details = {
                  page: window.location.href
                }
                const user_details = {}
                analyticsService({ eventDetails: event_details, eventName: event_name, userDetails: user_details })
    
              }}
              style={{
                height: 32,
                padding: '4px 16px',
                fontSize: 15,
                fontWeight: 'bold',
                pointerEvents: 'all'
              }}
            >
              Get App
            </Button>
          )}
          {mobile && (
            <Link href={appStoreLink} pointerEvents='all'>
              <Button
                variant='primary'
                className='me-3'
                style={{
                  height: 32,
                  padding: '4px 16px',
                  fontSize: 15,
                  fontWeight: 'bold',
                  pointerEvents: 'all'
                }}
              >
                Get App
              </Button>
            </Link>
          )}
          <BurgerMenu
            hideBurgerMenu={hideBurgerMenu}
            isContiner={isContiner}
            isOpen={isOpen}
            mobile={mobile}
            showGetAppModal={showGetAppModal}
          />
        </div>
      </div>
    </Navbar>
  )
}
