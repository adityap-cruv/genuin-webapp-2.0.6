import { Image, Navbar, Nav, Button } from 'react-bootstrap';
import logo from '../images/logo_header_new.svg';
export const TopNav = ({
  showGetAppModal,
  hideGetAppButton = false,
  hideBurgerMenu = false,
}) => {
  return (
    <>
      <Navbar
        bg='gradient'
        expand={false}
        fixed='top'
        className='p-3'
        // className="p-3 container"
      >
        <Navbar.Brand href='/' className='p-0'>
          <Image src={logo.src} alt='Genuin' title='Genuin' />
        </Navbar.Brand>
        <div className='d-flex align-items-center justify-content-center'>
          {!hideGetAppButton && (
            <Button
              variant='primary'
              className='me-3'
              onClick={showGetAppModal}
            >
              Get App
            </Button>
          )}
          {!hideBurgerMenu && (
            <>
              <Navbar.Toggle aria-controls='navbarMoreOptionDrawer' />
              <Navbar.Collapse appear id='navbarMoreOptionDrawer'>
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
            </>
          )}
        </div>
      </Navbar>
    </>
  );
};

/*
  
*/
