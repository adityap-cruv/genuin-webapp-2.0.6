import React from 'react'
import { hireLink } from '../../config'
import { Nav, Fade, Navbar } from 'react-bootstrap'
import { useTrail, a } from 'react-spring'

export const BurgerMenu = ({
  isOpen,
  hideBurgerMenu,
  isContiner
}) => {
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

  return <>
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
                {/* <Nav.Link href={investLink}>Invest in Genuin</Nav.Link> */}
                <a
                  href={hireLink}
                >
                  Join Our Team
                </a>
                <a
                  target="_blank"
                  href={'/content_demo?value=rt_123f373977001407'}
                  rel="noreferrer">
                  Life at Genuin
                </a>
                <a
                  href='/terms'
                >Terms of Service</a>
                <a
                  href='/privacy'
                >Privacy Policy</a>
              </Trail>
              <div className=' small mt-auto'>
                <a href='/' className='text-primary'>
                  &copy; 2023 Genuin Inc.
                </a>
              </div>
            </Nav>
          </Navbar.Collapse>
        </Fade>
      </>
    )}
  </>
}
