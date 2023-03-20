import React, { useState, useEffect } from "react";
import { Image, Navbar, Nav, Button, Fade } from "react-bootstrap";
import { useTrail, a } from "react-spring";
import logo from "../images/logo_header_new.svg";
import logoBlue from "../images/logo_header_new_blue.svg";
import { hireLink, investLink } from "../config";
import { useBreakpointValue } from "@chakra-ui/react";
import { handleHireLinkClick } from "../actions/appInstall";

const Trail = ({ children, open }) => {
  const items = React.Children.toArray(children);
  const trail = useTrail(items.length, {
    config: { mass: 5, tension: 2000, friction: 200 },
    opacity: open ? 1 : 0,
    y: open ? 0 : 20,
    height: open ? 20 : 0,
    from: { opacity: 0, y: 20, height: 0 },
  });
  return (
    <div>
      {trail.map(({ height, ...style }, index) => (
        <a.div key={index} style={style}>
          {items[index]}
        </a.div>
      ))}
    </div>
  );
};

export const HomeNav = ({
  showGetAppModal,
  hideBurgerMenu = false,
  isContiner = false,
  isBlue = false,
  variant = "dark",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const mobile = useBreakpointValue({ base: true, sm: false });

  return (
    <Navbar
      {...(isContiner ? { className: "p-3 container" } : { className: "p-3" })}
      expand={false}
      fixed='top'
      onToggle={(isOpen) => setIsOpen(isOpen)}
      style={{
        background: variant === "light" ? "transparent" : "white",
      }}
      variant={variant}
    >
      <Navbar.Brand href='/' className='p-0' style={{margin: mobile?'auto': 'unset'}}>
        <Image
          src={isBlue ? logoBlue.src : logo.src}
          alt='Genuin'
          title='Genuin'
        />
      </Navbar.Brand>
      <div className='d-flex align-items-center justify-content-center'>
          <Button
            variant='primary'
            className='me-3 custom-home-button'
            onClick={handleHireLinkClick}
            style={{
              fontSize: 18,
              padding: "0.275rem 2rem",
              borderRadius: "0.4rem",
            }}
          >
            Join the team
          </Button>

            <Navbar.Toggle
            aria-controls='navbarMoreOptionDrawer'
            className='custom-home-burger'
              style={{
                visibility: isOpen ? "hidden" : "revert",
              }}
            />
            <Fade in={isOpen}>
              <Navbar.Collapse
                style={{ left: 0, visibility: isOpen ? "visible" : "hidden" }}
              >
                <Nav {...(isContiner ? { className: "container" } : {})}>
                  <Navbar.Toggle aria-controls='navbarMoreOptionDrawer' />
                  <Trail open={isOpen}>
                    {/* <Nav.Link href={investLink}>Invest in Genuin</Nav.Link> */}
                    <Nav.Link href={hireLink}>Join us</Nav.Link>
                    <Nav.Link href='/terms'>Terms of Service</Nav.Link>
                    <Nav.Link href='/privacy'>Privacy Policy</Nav.Link>
                    <Nav.Link target="_blank" href={`/content_demo?value=rt_123f373977001407`}>Life at Genuin</Nav.Link>
                  </Trail>
                  <Nav.Link href='/' className='text-primary small mt-auto'>
                    &copy; 2023 Genuin Inc.
                  </Nav.Link>
                </Nav>
              </Navbar.Collapse>
            </Fade>
      </div>
    </Navbar>
  );
};
