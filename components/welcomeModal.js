import { Modal, Carousel } from 'react-bootstrap';
import imgCarousel1 from '../images/1_hiring_small.png';
import imgCarousel2 from '../images/2_investors_small.png';
import imgCarousel3 from '../images/3_inspired_small.png';
import imgCarousel4 from '../images/4_community_small.png';
import imgCarousel5 from '../images/5_discussions_small.png';

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
            src={imgCarousel1.src}
            width={380}
            height={770}
            alt='Find your dream candidate'
            title='Find your dream candidate'
            className='img-fluid mx-auto d-block'
          />
          <h1>Find your dream candidate</h1>
        </Carousel.Item>
        <Carousel.Item>
          <img
            src={imgCarousel2.src}
            width={380}
            height={770}
            alt='Find Investors for your Startup'
            title='Find Investors for your Startup'
            className='img-fluid mx-auto d-block'
          />
          <h1>Find Investors for your Startup</h1>
        </Carousel.Item>
        <Carousel.Item>
          <img
            src={imgCarousel3.src}
            width={380}
            height={770}
            alt='Get Inspired'
            title='Get Inspired'
            className='img-fluid mx-auto d-block'
          />
          <h1>Get Inspired</h1>
        </Carousel.Item>
        <Carousel.Item>
          <img
            src={imgCarousel4.src}
            width={380}
            height={770}
            alt='Engage with community'
            title='Engage with community'
            className='img-fluid mx-auto d-block'
          />
          <h1>Engage with community</h1>
        </Carousel.Item>
        <Carousel.Item>
          <img
            src={imgCarousel5.src}
            width={380}
            height={770}
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
