import React, { useRef } from "react";
import NextHead from "next/head";
import { NextSeo } from "next-seo";
import "bootstrap/dist/css/bootstrap.min.css";
import { Layout } from "../components/new/layout";
import { TopNav } from "../components/new/topNav";
import {
  Nav,
  Button,
  Container,
  Row,
  Col,
  Carousel,
  Image,
} from "react-bootstrap";
// import "./index.css";
const imgCarousel1 = require("../images/1_hiring_small.png");
const imgCarousel2 = require("../images/2_investors_small.png");
const imgCarousel3 = require("../images/3_inspired_small.png");
const imgCarousel4 = require("../images/4_community_small.png");
const imgCarousel5 = require("../images/5_discussions_small.png");
const ios = require("../images/badge_appstore.png");
const android = require("../images/badge_playstore.png");

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
  // const handleAndroidInstallClick = () => {
  //   window.open("https://install.begenuin.com/86sn/cgs");
  // };
  // const handleIosInstallClick = () => {
  //   window.open("https://install.begenuin.com/86sn/cgs");
  // };

  const handleInstallAppClick = () =>
    window.open("https://install.begenuin.com/86sn/cgs");

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
        <link
          rel="shortcut icon"
          href={require("../images/favicon.ico")}
          type="image/x-icon"
        />
      </NextHead>
      <Layout>
        <TopNav />
        <section className="bg-gradient-blue section-content d-flex flex-column h-100 justify-content-center justify-content-md-between">
          <Container className="container-false d-none d-md-block"></Container>
          <Container className="content-container">
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
                      className="img-carousel mx-auto d-block"
                    />
                  </Carousel.Item>
                  <Carousel.Item>
                    <img
                      src={imgCarousel2}
                      width={380}
                      height={770}
                      alt="Find Investors for your Startup"
                      title="Find Investors for your Startup"
                      className="img-carousel mx-auto d-block"
                    />
                  </Carousel.Item>
                  <Carousel.Item>
                    <img
                      src={imgCarousel3}
                      width={380}
                      height={770}
                      alt="Get Inspired"
                      title="Get Inspired"
                      className="img-carousel mx-auto d-block"
                    />
                  </Carousel.Item>
                  <Carousel.Item>
                    <img
                      src={imgCarousel4}
                      width={380}
                      height={770}
                      alt="Engage with community"
                      title="Engage with community"
                      className="img-carousel mx-auto d-block"
                    />
                  </Carousel.Item>
                  <Carousel.Item>
                    <img
                      src={imgCarousel5}
                      width={380}
                      height={770}
                      alt="Initiate Discussions"
                      title="Initiate Discussions"
                      className="img-carousel mx-auto d-block"
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
                <Row
                  xs={2}
                  className="justify-content-center justify-content-md-start mt-5 pt-3"
                >
                  <Col
                    xs="6"
                    lg="auto"
                    className="d-flex align-items-center justify-content-end"
                  >
                    <Image
                      src={ios}
                      onClick={handleIosInstallClick}
                      width={204}
                      height={60}
                      alt="iOs App Store"
                      title="iOs App Store"
                      fluid
                    />
                  </Col>
                  <Col
                    xs="6"
                    lg="auto"
                    className="d-flex align-items-center justify-content-start"
                  >
                    <Image
                      src={android}
                      width={204}
                      height={60}
                      onClick={handleAndroidInstallClick}
                      alt="Android Play Store"
                      title="Android Play Store"
                      fluid
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
          </Container>

          <Container className="d-none d-md-block container-footer">
            <Row className="py-3">
              <Col xl={4} lg={4} md={4} sm={12}>
                <Nav as="ul">
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
              <Col xl={8} lg={8} md={8} sm={12}>
                <Nav
                  className="justify-content-start justify-content-md-end"
                  as="ul"
                >
                  <Nav.Item as="li">
                    <Nav.Link
                      style={{ opacity: 0.5 }}
                      href="#"
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
                    <Nav.Link style={{ opacity: 0.5 }} href="/terms">
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
                    >
                      |
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item as="li">
                    <Nav.Link style={{ opacity: 0.5 }} href="/privacy">
                      Privacy Policy
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Col>
            </Row>
          </Container>
        </section>
      </Layout>
    </>
  );
};

export default Home2;
