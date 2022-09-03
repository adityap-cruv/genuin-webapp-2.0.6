import { useState } from 'react';
import NextHead from 'next/head';
import { Layout } from '../components/layout';
import { TopNav } from '../components/topNav';
import { GetAppModal } from '../components/getAppModal';
import { SEO } from '../components/seo';
import {
  handleIosInstallClick,
  handleAndroidInstallClick,
  handleInvestClick,
} from '../actions/appInstall';
import { Nav, Container, Row, Col, Carousel, Image } from 'react-bootstrap';

import ios from '../images/badge_appstore.png';
import android from '../images/badge_playstore.png';

import imgCarousel1 from '../images/1_hiring_small.png';
import imgCarousel2 from '../images/2_investors_small.png';
import imgCarousel3 from '../images/3_inspired_small.png';
import imgCarousel4 from '../images/4_community_small.png';
import imgCarousel5 from '../images/5_discussions_small.png';

import favicon from '../images/favicon.ico';

let title = 'Genuin';
let metaImage = 'https://media.begenuin.com/backend_assets/preview.png';
let description =
  'Genuin is a video-first professional networking platform that allows you to showcase your expertise and connect with other professionals and businesses. Whether you are searching for a job, seeking investment, hiring candidates, or any other networking, Genuin helps you stand out';
let currentUrl = 'https://begenuin.com';
let keyword =
  'Genuin,Showcase Yourself. Get Discovered. Make Connections, video Communication';

const Home = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showModalAppDownload, setShowModalAppDownload] = useState(false);
  const handleCloseAppDownload = () => setShowModalAppDownload(false);
  const handleShowModalAppDownload = () => setShowModalAppDownload(true);

  return (
    <>
      <SEO
        title={title}
        description={description}
        urlToCopy={currentUrl}
        videoPreviewImage={metaImage}
        includeHead={false}
      />
      <NextHead>
        <link rel='shortcut icon' href={favicon.src} type='image/x-icon' />
      </NextHead>
      <Layout>
        <TopNav showGetAppModal={handleShowModalAppDownload} isContiner />
        <section className='bg-gradient-blue section-content d-flex flex-column h-100 justify-content-center justify-content-md-between'>
          <Container className='container-false d-none d-md-block'></Container>
          <Container className='content-container'>
            <Row className='justify-content-center align-items-center'>
              <Col sm={12} md={6} lg={6} xl={6}>
                <Carousel
                  controls={false}
                  indicators={false}
                  fade
                  activeIndex={activeIndex}
                >
                  <Carousel.Item>
                    <img
                      src={imgCarousel1.src}
                      width={380}
                      height={770}
                      alt='Find your dream candidate'
                      title='Find your dream candidate'
                      className='img-carousel mx-auto d-block'
                    />
                  </Carousel.Item>
                  <Carousel.Item>
                    <img
                      src={imgCarousel2.src}
                      width={380}
                      height={770}
                      alt='Find Investors for your Startup'
                      title='Find Investors for your Startup'
                      className='img-carousel mx-auto d-block'
                    />
                  </Carousel.Item>
                  <Carousel.Item>
                    <img
                      src={imgCarousel3.src}
                      width={380}
                      height={770}
                      alt='Get Inspired'
                      title='Get Inspired'
                      className='img-carousel mx-auto d-block'
                    />
                  </Carousel.Item>
                  <Carousel.Item>
                    <img
                      src={imgCarousel4.src}
                      width={380}
                      height={770}
                      alt='Engage with community'
                      title='Engage with community'
                      className='img-carousel mx-auto d-block'
                    />
                  </Carousel.Item>
                  <Carousel.Item>
                    <img
                      src={imgCarousel5.src}
                      width={380}
                      height={770}
                      alt='Initiate Discussions'
                      title='Initiate Discussions'
                      className='img-carousel mx-auto d-block'
                    />
                  </Carousel.Item>
                </Carousel>
              </Col>
              <Col sm={12} md={6} lg={6} xl={6}>
                <Carousel
                  controls={false}
                  interval={2000}
                  onSelect={(selectedIndex) => setActiveIndex(selectedIndex)}
                >
                  <Carousel.Item>
                    <h1>
                      Find your
                      <br />
                      dream candidate
                    </h1>
                  </Carousel.Item>
                  <Carousel.Item>
                    <h1>
                      Find Investors
                      <br />
                      for your Startup
                    </h1>
                  </Carousel.Item>
                  <Carousel.Item>
                    <h1>
                      Get
                      <br />
                      Inspired
                    </h1>
                  </Carousel.Item>
                  <Carousel.Item>
                    <h1>
                      Engage with <br />
                      community
                    </h1>
                  </Carousel.Item>
                  <Carousel.Item>
                    <h1>
                      Initiate
                      <br />
                      Discussions
                    </h1>
                  </Carousel.Item>
                </Carousel>
                <Row
                  xs={2}
                  className='justify-content-center justify-content-md-start mt-5 pt-3'
                >
                  <Col
                    xs='6'
                    lg='auto'
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
                    xs='6'
                    lg='auto'
                    className='d-flex align-items-center justify-content-start pe-4 ps-em-0'
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
              </Col>
            </Row>
          </Container>

          <Container className='d-none d-md-block container-footer'>
            <Row className='py-3'>
              <Col xl={4} lg={4} md={4} sm={12}>
                <Nav as='ul'>
                  <Nav.Item as='li'>
                    <Nav.Link
                      style={{ opacity: 0.5 }}
                      href='/'
                      className='pr-0'
                    >
                      © 2022 Genuin Inc.
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Col>
              <Col xl={8} lg={8} md={8} sm={12}>
                <Nav
                  className='justify-content-start justify-content-md-end'
                  as='ul'
                >
                  <Nav.Item as='li'>
                    <Nav.Link
                      style={{ opacity: 0.5 }}
                      href='#'
                      onClick={handleInvestClick}
                    >
                      Invest in Genuin
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item as='li'>
                    <Nav.Link
                      style={{
                        opacity: 0.5,
                        paddingLeft: '0px',
                        paddingRight: '0px',
                      }}
                      href={void 0}
                      eventKey='link-2'
                    >
                      |
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item as='li'>
                    <Nav.Link style={{ opacity: 0.5 }} href='/terms'>
                      Terms of Service
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item as='li'>
                    <Nav.Link
                      style={{
                        opacity: 0.5,
                        paddingLeft: '0px',
                        paddingRight: '0px',
                      }}
                      href={void 0}
                    >
                      |
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item as='li'>
                    <Nav.Link style={{ opacity: 0.5 }} href='/privacy'>
                      Privacy Policy
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Col>
            </Row>
          </Container>
        </section>
        <GetAppModal
          show={showModalAppDownload}
          onClose={handleCloseAppDownload}
        />
      </Layout>
    </>
  );
};

export default Home;
