import React, { useState } from 'react'
import { Image, Navbar, Button } from 'react-bootstrap'
import logo from '../../assets/images/logo_header_new.svg'
import logoBlue from '../../assets/images/logo_header_new_blue.svg'
import { useBreakpointValue, Link } from '@chakra-ui/react'
import { BurgerMenu } from './burger_menu'
import { appStoreLink } from '../../config'

export const TopNav = ({
  showGetAppModal,
  hideBurgerMenu = false,
  isContiner = false,
  isBlue = false,
  variant = 'dark'
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const mobile = useBreakpointValue({ base: true, sm: false })

  return (
    <Navbar
      {...(isContiner ? { className: 'p-3 container' } : { className: 'p-3' })}
      expand={false}
      fixed='top'
      onToggle={(isOpen) => setIsOpen(isOpen)}
      style={{
        background: variant === 'light' ? 'transparent' : 'white',
        pointerEvents: 'none'
      }}
      variant={variant}
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
            onClick={showGetAppModal}
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
    </Navbar>
  )
}
