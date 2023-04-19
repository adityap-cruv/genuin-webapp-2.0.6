import React, { useState } from 'react'
import { Image, Navbar, Nav, Fade } from 'react-bootstrap'
import { useTrail, a } from 'react-spring'
import logo from '../../assets/images/logo_header_new.svg'
import logoBlue from '../../assets/images/logo_header_new_blue.svg'
import { hireLink } from '../../config'

const Trail = ({ children, open }) => {
  const items = React.Children.toArray(children)
  const trail = useTrail(items.length, {
    config: { mass: 5, tension: 2000, friction: 200 },
    opacity: open ? 1 : 0,
    y: open ? 0 : 20,
    height: open ? 20 : 0,
    from: { opacity: 0, y: 20, height: 0 }
  })
  return (
    <div>
      {trail.map(({ height, ...style }, index) => (
        <a.div key={index} style={style}>
          {items[index]}
        </a.div>
      ))}
    </div>
  )
}

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
      <p style={{ fontSize: '12px', fontFamily: 'AvenirNext-DemiBold', zIndex: 1, position: 'fixed', top: 13, left: 18, color: 'white' }}>Feed powered by</p>
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
        <Navbar.Brand target="_blank" href='/' className='p-0' style={{ pointerEvents: 'all' }}>
          <Image
            src={isBlue ? logoBlue.src : logo.src}
            alt='Genuin'
            title='Genuin'
            style={{ position: 'fixed', top: 27, left: 14, width: '80px' }}
          />
        </Navbar.Brand>
        <div className='d-flex align-items-center justify-content-center'>
          {!hideBurgerMenu && (
            <>
              <Navbar.Toggle
                aria-controls='navbarMoreOptionDrawer'
                style={{
                  visibility: isOpen ? 'hidden' : 'revert',
                  pointerEvents: 'all'
                }}
              />
              <Fade in={isOpen}>
                <Navbar.Collapse
                  style={{
                    left: 0,
                    visibility: isOpen ? 'visible' : 'hidden',
                    pointerEvents: 'all'
                  }}
                >
                  <Nav {...(isContiner ? { className: 'container' } : {})}>
                    <Navbar.Toggle aria-controls='navbarMoreOptionDrawer' />
                    <Trail open={isOpen}>
                      {/* <Nav.Link target="_blank" href={investLink}>Invest in Genuin</Nav.Link> */}
                      <Nav.Link target="_blank" href={hireLink}>Join Our Team</Nav.Link>
                      <Nav.Link target="_blank" href='/terms'>Terms of Service</Nav.Link>
                      <Nav.Link target="_blank" href='/privacy'>Privacy Policy</Nav.Link>
                    </Trail>
                    <Nav.Link target="_blank" href='/' className='text-primary small mt-auto'>
                    &copy; 2023 Genuin Inc.
                    </Nav.Link>
                  </Nav>
                </Navbar.Collapse>
              </Fade>
            </>
          )}
        </div>
      </Navbar>
    </>
  )
}
