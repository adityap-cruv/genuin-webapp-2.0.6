import * as React from 'react';
import { Image, Navbar, Nav, Button } from 'react-bootstrap';

const logo = require('../../../images/logo_header_new.svg');

export const TopNav = () => {
  return (
    <Navbar bg='gradient' expand={false} className='p-3'>
      <Navbar.Brand href='/' className='p-0'>
        <Image src={logo} alt='Genuin' />
      </Navbar.Brand>
      <div className='d-flex align-items-center justify-content-center'>
        <Button variant='primary' className='mr-3'>
          Get App
        </Button>
        <Navbar.Toggle aria-controls='navbarMoreOptionDrawer' />
        <Navbar.Collapse id='navbarMoreOptionDrawer'>
          <Nav className='me-auto'>
            <Nav.Link href='#features'>Features</Nav.Link>
            <Nav.Link href='#pricing'>Pricing</Nav.Link>
          </Nav>
        </Navbar.Collapse>
        {/* <Navbar.Offcanvas
                  id="navbarMoreOptionDrawer"
                  aria-labelledby="navbarMoreOptionDrawerTitle"
                  placement="end"
                >
                  <Offcanvas.Header closeButton>
                    <Offcanvas.Title id="navbarMoreOptionDrawerTitle">
                      Offcanvas
                    </Offcanvas.Title>
                  </Offcanvas.Header>
                  <Offcanvas.Body>
                    <Nav className="justify-content-end flex-grow-1 pe-3">
                      <Nav.Link href="#action1">Home</Nav.Link>
                      <Nav.Link href="#action2">Link</Nav.Link>
                    </Nav>
                  </Offcanvas.Body>
                </Navbar.Offcanvas> */}
      </div>
    </Navbar>
  );
};
