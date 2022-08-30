import React, { useRef } from "react";
import Slider from "react-slick";
import NextHead from "next/head";
import { NextSeo } from "next-seo";
import "slick-carousel/slick/slick.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Layout } from "../components/new/layout";
import { TopNav } from "../components/new/topNav";
import { Nav, Button, Container, Row, Col, Carousel } from "react-bootstrap";
import "./index.css";
const imgCarousel1 = require("../images/1_hiring_small.png");
const imgCarousel2 = require("../images/2_investors_small.png");
const imgCarousel3 = require("../images/3_inspired_small.png");
const imgCarousel4 = require("../images/4_community_small.png");
const imgCarousel5 = require("../images/5_discussions_small.png");

var settings = {
  dots: false,
  arrows: false,
  fade: true,
  autoplay: true,
  infinite: true,
  speed: 800,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplaySpeed: 4000,
};
var settingsone = {
  dots: true,
  arrows: false,
  fade: false,
  autoplay: true,
  infinite: true,
  speed: 800,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplaySpeed: 4000,
  // adaptiveHeight: true
};

let title = "Genuin";
let metaImage = "https://media.begenuin.com/backend_assets/preview.png";
let metaImageWidth = 1200;
let metaImageHeight = 630;
let description =
  "Genuin is a video-first professional networking platform that allows you to showcase your expertise and connect with other professionals and businesses. Whether you are searching for a job, seeking investment, hiring candidates, or any other networking, Genuin helps you stand out";
let currentUrl = "https://begenuin.com";
let keyword =
  "Genuin,Showcase Yourself. Get Discovered. Make Connections, video Communication";

const Home2 = () => {
  const handleInvestClick = () =>
    window.open("https://www.linkedin.com/company/begenuin/");

  const handleHireLinkClick = () =>
    window.open("https://angel.co/company/begenuin");

  const handleAndroidInstallClick = () =>
    window.open(
      "https://play.google.com/store/apps/details?id=com.begenuin.begenuin"
    );
  const handleIosInstallClick = () =>
    window.open("https://apps.apple.com/us/app/id1511177838");

  const handleInstallAppClick = () =>
    window.open("https://install.begenuin.com/86sn/cgs");

  const slider1Ref = useRef();
  const slider2Ref = useRef();

  return (
    <>
      <NextSeo
        title={title}
        description={description}
        openGraph={{
          type: "website",
          url: currentUrl,
          title: "Genuin",
          description: description,
          images: [
            {
              url: metaImage,
              width: metaImageWidth,
              height: metaImageHeight,
              alt: "Genuin",
            },
          ],
          site_name: "Genuin",
        }}
        facebook={{
          appId: 1234567890,
        }}
        twitter={{
          handle: "@handle",
          site: "@site",
          cardType: "summary_large_image",
        }}
      />
      <NextHead>
        {/* <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/bulma/0.6.2/css/bulma.min.css"
        /> */}
        <link
          rel="shortcut icon"
          href={require("../images/favicon.ico")}
          type="image/x-icon"
        />
        <script src="https:code.jquery.com/jquery-3.4.1.min.js"></script>
      </NextHead>
      <Layout>
        <TopNav />
        <div className="mobile-m-p">
          {/* 
          <style jsx global>{`
            html {
              overflow-y: auto;
            }
            body {
              font-family: 'AvenirNext-DemiBold';
            }
            .footer-links {
              position: absolute;
              bottom: 0px;
            }
            .slider-container {
              height: 85vh;
              height: calc(var(--app-height) * 0.85);
            }
            .slider-container > div {
              height: 100%;
            }
            .slick-list h1 {
              font-family: 'AvenirNext-Bold';
            }
            .genuin_footer .nav-item {
              font-family: 'AvenirNext-DemiBold';
            }
            @media (min-width: 1200px) {
              .container,
              .container-sm,
              .container-md,
              .container-lg,
              .container-xl {
                max-width: 1310px !important;
              }
            }
          `}</style> */}
          {/* <Container className='sticky-top'>
            <Row>
              <Col xl={12}>
                <Navbar bg='transparent p-0 pt-4' expand='sm'>
                  <Navbar.Brand href='/' className='p-0'>
                    <img
                      src={require('../images/logo_header_new.png')}
                      alt='Genuin'
                    />
                  </Navbar.Brand>

                  <a className='nav-button ml-auto d-sm-none p-0'>
                    <span id='nav-icon3'>
                      <span></span>
                      <span></span>
                      <span></span>
                      <span></span>
                    </span>
                  </a>

                  <div className='fixed-top main-menu'>
                    <div className='flex-top p-5 mt-5'>
                      <ul className='nav flex-column w-100'>
                        <li className='nav-item delay-1 pt-4'>
                          <a
                            className='nav-link pt-5'
                            onClick={handleInvestClick}
                            href='#'
                          >
                            Invest in Genuin
                          </a>
                        </li>
                        <li className='nav-item delay-2'>
                          <a
                            className='nav-link'
                            onClick={handleHireLinkClick}
                            href='#'
                          >
                            Join us
                          </a>
                        </li>
                        <li className='nav-item delay-3'>
                          <a className='nav-link' href='/terms'>
                            Terms of Service{' '}
                          </a>
                        </li>
                        <li className='nav-item delay-4'>
                          <a className='nav-link' href='/privacy'>
                            Privacy Policy
                          </a>
                        </li>
                      </ul>

                      <ul className='copy-right'>
                        <li className='nav-item delay-5'>
                          <a className='nav-link' href='/'>
                            © 2022 Genuin Inc.
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <Navbar.Collapse
                    id='basic-navbar-nav'
                    className='collapse navbar-collapse'
                  >
                    <Nav className='mr-auto'></Nav>
                    <Form
                      inline
                      className='d-none d-sm-block d-md-block d-lg-block'
                    >
                      <Button onClick={handleHireLinkClick} variant='primary'>
                        Join us
                      </Button>
                    </Form>
                  </Navbar.Collapse>
                </Navbar>
              </Col>
            </Row>
          </Container> */}
          <Container>
            <Row className="justify-content-center align-items-center">
              <Col sm={12} md={6} lg={6} xl={6}>
                <Carousel controls={false} indicators={false} fade>
                  <Carousel.Item>
                    <img
                      src={imgCarousel1}
                      width={380}
                      height={770}
                      alt="Find your dream candidate"
                      title="Find your dream candidate"
                      className="img-fluid mx-auto d-block"
                    />
                  </Carousel.Item>
                  <Carousel.Item>
                    <img
                      src={imgCarousel2}
                      width={380}
                      height={770}
                      alt="Find Investors for your Startup"
                      title="Find Investors for your Startup"
                      className="img-fluid mx-auto d-block"
                    />
                  </Carousel.Item>
                  <Carousel.Item>
                    <img
                      src={imgCarousel3}
                      width={380}
                      height={770}
                      alt="Get Inspired"
                      title="Get Inspired"
                      className="img-fluid mx-auto d-block"
                    />
                  </Carousel.Item>
                  <Carousel.Item>
                    <img
                      src={imgCarousel4}
                      width={380}
                      height={770}
                      alt="Engage with community"
                      title="Engage with community"
                      className="img-fluid mx-auto d-block"
                    />
                  </Carousel.Item>
                  <Carousel.Item>
                    <img
                      src={imgCarousel5}
                      width={380}
                      height={770}
                      alt="Initiate Discussions"
                      title="Initiate Discussions"
                      className="img-fluid mx-auto d-block"
                    />
                  </Carousel.Item>
                </Carousel>
              </Col>
              <Col sm={12} md={6} lg={6} xl={6}>
                <Carousel controls={false}>
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
              </Col>
            </Row>
          </Container>

          <Container className="footer-m-none genuin_footer">
            <Row className="pt-3 pb-3">
              <Col xl={4} lg={4} md={4} sm={4} className="text-m-center">
                <Nav defaultActiveKey="/home" as="ul">
                  <Nav.Item as="li">
                    <Nav.Link
                      style={{ opacity: 0.5 }}
                      href="/"
                      className="pr-0"
                    >
                      © 2022 Genuin Inc.
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Col>
              <Col xl={8} lg={8} md={8} sm={8}>
                <Nav
                  className="justify-content-end"
                  defaultActiveKey="/home"
                  as="ul"
                >
                  <Nav.Item as="li">
                    <Nav.Link
                      style={{ opacity: 0.5 }}
                      href="#"
                      eventKey="link-1"
                      onClick={handleInvestClick}
                    >
                      Invest in Genuin
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item as="li">
                    <Nav.Link
                      style={{
                        opacity: 0.5,
                        paddingLeft: "0px",
                        paddingRight: "0px",
                      }}
                      href={void 0}
                      eventKey="link-2"
                    >
                      |
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item as="li">
                    <Nav.Link
                      style={{ opacity: 0.5 }}
                      href="/terms"
                      eventKey="link-3"
                    >
                      Terms of Service
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item as="li">
                    <Nav.Link
                      style={{
                        opacity: 0.5,
                        paddingLeft: "0px",
                        paddingRight: "0px",
                      }}
                      href={void 0}
                      eventKey="link-4"
                    >
                      |
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item as="li">
                    <Nav.Link
                      style={{ opacity: 0.5 }}
                      href="/privacy"
                      eventKey="link-5"
                    >
                      Privacy Policy
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Col>
            </Row>
          </Container>
        </div>
      </Layout>
    </>
  );
};

export default Home2;
