import { Container, Row, Col, Image } from 'react-bootstrap';
import { TopNav } from './topNav';
import { Layout } from './layout';
import {
  handleAndroidInstallClick,
  handleIosInstallClick,
} from '../actions/appInstall';
import ios from '../images/badge_appstore.png';
import android from '../images/badge_playstore.png';

export const Error = ({ homePageUrl = '/' }) => (
  <Layout>
    <section className='w-100 h-100 bg-gradient-blue d-flex align-items-center'>
      <TopNav isContiner />
      <Container>
        <Row className='mb-5'>
          <Col
            xs={12}
            lg={10}
            className='d-flex align-items-center justify-content-center mx-auto text-center text-white flex-column'
          >
            <h2 className='fw-bold mb-4 h1'>
              Sorry, this page isn't available.
            </h2>
            <p className='fs-3'>
              The link you followed may be broken, or the page may have been
              removed. Go to <a href={homePageUrl ?? ''}>Genuin Home Page.</a>
            </p>
          </Col>
        </Row>
        <Row xs={2} className='justify-content-center'>
          <Col
            sm='auto'
            className='d-flex align-items-center justify-content-end ps-4 ps-sm-0'
          >
            <Image
              src={ios.src}
              onClick={handleIosInstallClick}
              width={204}
              height={60}
              alt='iOs App Store'
              title='iOs App Store'
              fluid
            />
          </Col>
          <Col
            sm='auto'
            className='d-flex align-items-center justify-content-start  pe-4 ps-em-0'
          >
            <Image
              src={android.src}
              width={204}
              height={60}
              onClick={handleAndroidInstallClick}
              alt='Android Play Store'
              title='Android Play Store'
              fluid
            />
          </Col>
        </Row>
      </Container>
    </section>
  </Layout>
);
