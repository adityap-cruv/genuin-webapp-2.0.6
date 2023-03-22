import { useState, useEffect } from "react";
import NextHead from "next/head";
import { Layout } from "../components/layout";
import { GetAppModal } from "../components/getAppModal";
import { SEO } from "../components/seo";
import { Nav, Container, Row, Col, Carousel } from "react-bootstrap";

import imgCarousel1 from "../images/web3/learn_web3_via_bite-sized_content.png";
import imgCarousel2 from "../images/web3/connect_people_in_the_web3_business.png";
import imgCarousel3 from "../images/web3/feed_page_public_video.png";
import imgCarousel4 from "../images/web3/initiate_conversation_about_web3.png";

import favicon from "../images/favicon.ico";
import { InstallApp } from "../components/installApp";
import { HomeNav } from "../components/homeNav";

let title = "Genuin";
let metaImage = "https://media.begenuin.com/backend_assets/preview.png";
let description =
  "Genuin is a video-first professional networking platform that allows you to showcase your expertise and connect with other professionals and businesses. Whether you are searching for a job, seeking investment, hiring candidates, or any other networking, Genuin helps you stand out";
let currentUrl = "https://begenuin.com";

const Home = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showModalAppDownload, setShowModalAppDownload] = useState(false);
  const handleCloseAppDownload = () => setShowModalAppDownload(false);

  return (
    <>
      <SEO
        title={title}
        openGraphTitle={title}
        description={description}
        openGraphDescription={description}
        urlToCopy={currentUrl}
        videoPreviewImage={metaImage}
        includeHead={false}
      />
      <NextHead>
        <link rel='shortcut icon' href={favicon.src} type='image/x-icon' />
      </NextHead>
      <Layout>
        <HomeNav variant='light' isContiner />
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
                      alt='Learn Web3 via bite-sized content'
                      title='Learn Web3 via bite-sized content'
                      className='img-carousel mx-auto d-block'
                    />
                  </Carousel.Item>
                  <Carousel.Item>
                    <img
                      src={imgCarousel2.src}
                      width={380}
                      height={770}
                      alt='Connect people in the Web3 business'
                      title='Connect people in the Web3 business'
                      className='img-carousel mx-auto d-block'
                    />
                  </Carousel.Item>
                  <Carousel.Item>
                    <img
                      src={imgCarousel3.src}
                      width={380}
                      height={770}
                      alt='Showcase your Web3 knowledge'
                      title='Showcase your Web3 knowledge'
                      className='img-carousel mx-auto d-block'
                    />
                  </Carousel.Item>
                  <Carousel.Item>
                    <img
                      src={imgCarousel4.src}
                      width={380}
                      height={770}
                      alt='Initiate conversation about Web3'
                      title='Initiate conversation about Web3'
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
                      Learn Web3 via
                      <br />
                      bite-sized content
                    </h1>
                  </Carousel.Item>
                  <Carousel.Item>
                    <h1>Connect people in the Web3 business</h1>
                  </Carousel.Item>
                  <Carousel.Item>
                    <h1>Showcase your Web3 knowledge</h1>
                  </Carousel.Item>
                  <Carousel.Item>
                    <h1>Initiate conversation about Web3</h1>
                  </Carousel.Item>
                </Carousel>
                <Row
                  xs={2}
                  className='justify-content-center justify-content-md-start mt-5 pt-3'
                >
                  <InstallApp />
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
                      target="_blank"
                      href={`/content_demo?value=rt_123f373977001407`}
                    >
                      Life at Genuin
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item as='li'>
                    <Nav.Link
                      style={{
                        opacity: 0.5,
                        paddingLeft: "0px",
                        paddingRight: "0px",
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
                        paddingLeft: "0px",
                        paddingRight: "0px",
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
