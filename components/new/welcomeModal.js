import { Modal, Carousel } from 'react-bootstrap';

const imgCarousel1 = require('../../images/1_hiring_small.png');
const imgCarousel2 = require('../../images/2_investors_small.png');
const imgCarousel3 = require('../../images/3_inspired_small.png');
const imgCarousel4 = require('../../images/4_community_small.png');
const imgCarousel5 = require('../../images/5_discussions_small.png');

export const WelcomeModal = ({ show, onClose }) => (
  <Modal
    key='welcome'
    show={show}
    onHide={onClose}
    aria-labelledby='modal Welcome'
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
);
