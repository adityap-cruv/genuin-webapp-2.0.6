import * as React from 'react';
import { useState } from 'react';
import { Image, Navbar, Nav, Button, Modal, Carousel } from 'react-bootstrap';

const logo = require('../../images/logo_header_new.svg');
const logo_icon = require('../../images/Genuin_icon_vector.svg');
const imgCarousel1 = require('../../images/1_hiring_small.png');
const imgCarousel2 = require('../../images/2_investors_small.png');
const imgCarousel3 = require('../../images/3_inspired_small.png');
const imgCarousel4 = require('../../images/4_community_small.png');
const imgCarousel5 = require('../../images/5_discussions_small.png');

export const TopNav = () => {
  const [showModalAppDownload, setShowModalAppDownload] = useState(false);
  const handleCloseAppDownload = () => setShowModalAppDownload(false);
  const handleShowModalAppDownload = () => setShowModalAppDownload(true);

  const [showModalWelcome, setShowModalWelcome] = useState(true);
  const handleCloseWelcome = () => setShowModalWelcome(false);
  const handleShowModalWelcome = () => setShowModalWelcome(true);

  return (
    <>
      <Navbar bg='gradient' expand={false} fixed='top' className='p-3'>
        <Navbar.Brand href='/' className='p-0'>
          <Image src={logo} alt='Genuin' title='Genuin' />
        </Navbar.Brand>
        <div className='d-flex align-items-center justify-content-center'>
          <Button
            variant='primary'
            className='me-3'
            onClick={handleShowModalAppDownload}
          >
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
      <Modal
        show={showModalAppDownload}
        onHide={handleCloseAppDownload}
        centered
        className='modal-app-download'
      >
        <Modal.Header closeButton className='border-0'></Modal.Header>
        <Modal.Body className='text-center py-0'>
          <Image src={logo_icon} alt='Genuin' title='Genuin' className='mb-4' />
          <h5 className='mb-0'>
            Get the app to <strong>save this video</strong>
          </h5>
        </Modal.Body>
        <Modal.Footer className='justify-content-center border-0'>
          <Button
            variant='primary'
            onClick={handleCloseAppDownload}
            className='border-0 btn-get-app'
          >
            Get App
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        show={showModalWelcome}
        onHide={handleCloseWelcome}
        aria-labelledby='modalWelcome'
        centered
        className='modal-welcome'
      >
        <Modal.Header closeButton className='border-0'></Modal.Header>
        <Modal.Body className='text-center pt-0'>
          <Carousel controls={false}>
            <Carousel.Item>
              <img
                src={imgCarousel1}
                alt='Find your dream candidate'
                title='Find your dream candidate'
                className='img-fluid mx-auto d-block'
              />
              <h1>Find your dream candidate</h1>
            </Carousel.Item>
            <Carousel.Item>
              <img
                src={imgCarousel2}
                alt='Find Investors for your Startup'
                title='Find Investors for your Startup'
                className='img-fluid mx-auto d-block'
              />
              <h1>Find Investors for your Startup</h1>
            </Carousel.Item>
            <Carousel.Item>
              <img
                src={imgCarousel3}
                alt='Get Inspired'
                title='Get Inspired'
                className='img-fluid mx-auto d-block'
              />
              <h1>Get Inspired</h1>
            </Carousel.Item>
            <Carousel.Item>
              <img
                src={imgCarousel4}
                alt='Engage with community'
                title='Engage with community'
                className='img-fluid mx-auto d-block'
              />
              <h1>Engage with community</h1>
            </Carousel.Item>
            <Carousel.Item>
              <img
                src={imgCarousel5}
                alt='Initiate Discussions'
                title='Initiate Discussions'
                className='img-fluid mx-auto d-block'
              />
              <h1>Initiate Discussions</h1>
            </Carousel.Item>
          </Carousel>
        </Modal.Body>
      </Modal>
    </>
  );
};
