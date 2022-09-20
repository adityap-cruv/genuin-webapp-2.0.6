import { Container, Row, Col, Image } from 'react-bootstrap';
import { handleLink } from '../actions/appInstall';
import { appleAppStoreLink, googlePlayStoreLink } from '../config';
import ios from '../images/badge_appstore.png';
import android from '../images/badge_playstore.png';

export const Question = ({ previewImage }) => (
  <section className='w-100 h-100 bg-gradient-blue d-flex align-items-center'>
    <Container>
      <Row className='mb-5'>
        <Col
          xs={12}
          lg={10}
          className='d-flex align-items-center justify-content-center mx-auto'
        >
          <Image
            src={previewImage}
            width={1084}
            height={546}
            alt='Question'
            title='Question'
            fluid
            className='rounded-5'
          />
        </Col>
      </Row>
      <Row xs={2} className='justify-content-center'>
        <Col
          sm='auto'
          className='d-flex align-items-center justify-content-end ps-4 ps-sm-0'
        >
          <Image
            src={ios.src}
            onClick={handleLink(appleAppStoreLink)}
            width={204}
            height={60}
            alt='iOs App Store'
            title='iOs App Store'
            fluid
          />
        </Col>
        <Col
          sm='auto'
          className='d-flex align-items-center justify-content-start pe-4 ps-em-0'
        >
          <Image
            src={android.src}
            width={204}
            height={60}
            onClick={handleLink(googlePlayStoreLink)}
            alt='Android Play Store'
            title='Android Play Store'
            fluid
          />
        </Col>
      </Row>
    </Container>
  </section>
);
