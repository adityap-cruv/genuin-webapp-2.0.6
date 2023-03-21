import { Nav, Container, Row, Col, Carousel } from "react-bootstrap";
import { InstallApp } from "../components/installApp";

import { useState, useRef } from "react";
import NextHead from "next/head";
import { GetAppModal } from "../components/getAppModal";
import { SEO } from "../components/seo";
import axios from "axios";
import { motion, useScroll, useMotionValueEvent } from "framer-motion"
import { HomePageVideo } from "../components/homepage_video";

import favicon from "../images/favicon.ico";
import { HomeNav } from "../components/homeNav";
import Videos from "../components/videos";

let title = "Genuin";
let metaImage = "https://media.begenuin.com/backend_assets/preview.png";
let description =
  "Genuin is a video-first professional networking platform that allows you to showcase your expertise and connect with other professionals and businesses. Whether you are searching for a job, seeking investment, hiring candidates, or any other networking, Genuin helps you stand out";
let currentUrl = "https://begenuin.com";

const Home = ({
  user = {},
  all_videos = []
}) => {
  const [showModalAppDownload, setShowModalAppDownload] = useState(false);
  const handleCloseAppDownload = () => setShowModalAppDownload(false);

  const prepareFeedVideos = (videos = []) => {
    return videos.reduce((res, { video_type, video }) => {
      if (video_type === "rt") {
        return res.concat(({ video_type: video_type, share_string: video.share_string, video: video }))
      }
      else {
        return res.concat(({ video_type: video_type, video: video }))
      }
    }, []);
  }

  const [videos, setVideos] = useState(prepareFeedVideos(all_videos));
  const scrollPosChanged = (event) => {
    const homePage = document.getElementById("temp")
    const limit = window.innerHeight * .2;
    // if (homePage.scrollTop > limit) {
    //   homePage.scrollTo({
    //     top: window.innerWidth + 70,
    //     behavior: "smooth"
    //   })
    // }
  }

  // useEffect(() => {
  //   const homePage = document.getElementById('temp')
  //   console.log('home page : ', homePage)
   
  //   homePage.addEventListener("scroll", scrollPosChanged)
  
  //   return homePage.removeEventListener("scroll", scrollPosChanged)
  // }, [])
  
  const [activeIndex, setActiveIndex] = useState(0);
  const mainRef = useRef(null);
  const [tempX, setTempX] = useState(0);
  const [opacity, setOpacity] = useState(1);

  const { scrollYProgress } = useScroll({
    container: mainRef
  });
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setTempX(latest);
    setOpacity(1 - latest)
    console.log("latest : ", latest)
  })

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
      <div style={{
        height: "100%",
        overflowY: "scroll"
      }}
      ref={mainRef}>
        <HomeNav variant='light' isContiner />
        <section className="bg-gradient-blue w-100 section-content d-flex flex-column h-100 justify-content-center justify-content-md-between"
          style={{
            position: "absolute",
            zIndex: 1
        }}>
          <Container className='container-false d-none d-md-block'></Container>
            <Container className='content-container'>
              <Row className='justify-content-center align-items-center'>
              <Col sm={12} md={6} lg={6} xl={6}>
                <motion.div style={{
                  translateX: tempX * 300,
                  position: "relative",
                  // scale: temp * 3,
                }}>
                <HomePageVideo></HomePageVideo>
                </motion.div>

                </Col>
              <Col sm={12} md={6} lg={6} xl={6}>
                <motion.div style={{
                  opacity: opacity,
                  zIndex: 1
                }}>
                  <Carousel
                    controls={false}
                    interval={2000}
                    onSelect={(selectedIndex) => setActiveIndex(selectedIndex)}
                    activeIndex={activeIndex}
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
                    style={{
                      position: "inherit",
                      zIndex: 1000
                    }}
                  >
                    <InstallApp />
                  </Row>
                </motion.div>
                </Col>
              </Row>
            </Container>
         
          <div style={{
            position: "fixed",
            zIndex: 0
          }}>
            
        </div>
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
        <section
          style={{
            height: "100%",
            position: "absolute"
        }}>
          <Videos
            videos={videos}
            loadMoreVideos={() => {
              console.log("load more videos..")
            }}
            user={user}
          /> 
        </section>
        <div
          style={{
            height: "calc(100% * 2)",
            position: "relative",
            zIndex: 100,
        }}>
        </div>       
        <GetAppModal
          show={showModalAppDownload}
          onClose={handleCloseAppDownload}
        />
      </div>
    </>
  );
};

Home.getInitialProps = async () => {
  const nickname = "srk";
  try {
    const all_videos = await axios.get(
      `${process.env.apiurl}/api/v3/public/profile_videos?user_id=${nickname}&video_types[]=public_video`
    );
    const user = await axios.get(
      `${process.env.apiurl}/api/v3/public/user/details?nickname=${nickname}`
    );
    return {
      user: user?.data?.data,
      all_videos: all_videos?.data?.data?.videos,
    };
  } catch (error) {
    console.log("return error")
    return {};
  }
}
export default Home;
