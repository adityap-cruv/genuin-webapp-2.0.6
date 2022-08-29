import * as React from 'react';
import { Image, Navbar, Nav, Button } from 'react-bootstrap';
const logo = require('../../images/logo_header_new.svg');
export const TopNav = ({ showGetAppModal }) => {
  return (
    <>
      <Navbar bg='gradient' expand={false} fixed='top' className='p-3'>
        <Navbar.Brand href='/' className='p-0'>
          <Image src={logo} alt='Genuin' title='Genuin' />
        </Navbar.Brand>
        <div className='d-flex align-items-center justify-content-center'>
          <Button variant='primary' className='me-3' onClick={showGetAppModal}>
            Get App
          </Button>
          <Navbar.Toggle aria-controls='navbarMoreOptionDrawer' />
          <Navbar.Collapse collapse id='navbarMoreOptionDrawer'>
            <Nav>
              <Navbar.Toggle aria-controls='navbarMoreOptionDrawer' />
              <Nav.Link href='#InvestInGenuin'>Invest in Genuin</Nav.Link>
              <Nav.Link href='#JoinUs'>Join us</Nav.Link>
              <Nav.Link href='#TermsOfService'>Terms of Service</Nav.Link>
              <Nav.Link href='#PrivacyPolicy'>Privacy Policy</Nav.Link>
              <Nav.Link href='/' className='text-primary small mt-auto'>
                &copy; 2022 Genuin Inc.
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </div>
      </Navbar>
    </>
  );
};

/*
  
*/
