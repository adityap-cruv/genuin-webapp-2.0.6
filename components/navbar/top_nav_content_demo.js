import React, { useState } from 'react'
import { Image, Navbar } from 'react-bootstrap'
import InfyLogo from '../../assets/images/logo_header_new_blue.svg'
import { BurgerMenu } from './burger_menu'

export const TopNav = ({
  showGetAppModal,
  hideBurgerMenu = false,
  isContiner = false,
  isBlue = false,
  variant = 'dark'
}) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
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
        <Navbar.Brand className='p-0' style={{ pointerEvents: 'all' }}>
          <p
            style={{
              fontSize: '12px',
              fontFamily: 'AvenirNext-DemiBold',
              zIndex: 1,
              position: 'fixed',
              top: 13,
              left: 18,
              color: 'white'
            }}>Feed powered by</p>
          <Image
            src={InfyLogo.src}
            alt='Infy.tv'
            title='Infy.tv'
            style={{ position: 'fixed', top: 30, left: 14, width: '80px' }}
          />
        </Navbar.Brand>
        <div className='d-flex align-items-center justify-content-center'>
          <BurgerMenu
            isOpen={isOpen}
            hideBurgerMenu={hideBurgerMenu}
            isContiner={isContiner}
          />
        </div>
      </Navbar>
    </>
  )
}
