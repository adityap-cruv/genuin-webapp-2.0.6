import React from 'react'
import $ from 'jquery';
import Router from 'next/router';
import Link from 'next/link';
// import OwlCarousel from 'react-owl-carousel';
// import 'owl.carousel/dist/assets/owl.carousel.css';
// import 'owl.carousel/dist/assets/owl.theme.default.css';
// import Styles from '!style-loader!css-loader?modules!./styles.css';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";
import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap/scss/bootstrap.scss';
// import 'bootstrap/scss/_variables.scss';
// import 'bootstrap/scss/_nav.scss';
// import 'bootstrap/scss/_navbar.scss';
// import 'bootstrap/scss/_forms.scss';
// import 'bootstrap/scss/_buttons.scss';
// import 'bootstrap/scss/_grid.scss';


import { Nav, Navbar, Form, Button, FormControl, Container, Row, Col } from 'react-bootstrap';
// import bootstrapStyles from './index.scss'
import './index.css'
import Metalayout from '../components/Metalayout';

export default class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            nav1: null,
            nav2: null
        };

    }
    handleInvestClick = () => {
        window.open("https://www.linkedin.com/company/begenuin/");
    }
    handleHireLinkClick = () => {
       // console.log('this is:', this);
        window.open("https://angel.co/company/begenuin");

      }

      handleAndroidInstallClick = () => {
        // console.log('this is:', this);
         window.open("https://play.google.com/store/apps/details?id=com.begenuin.begenuin");
 
       }

 
       handleIosInstallClick = () => {
        // console.log('this is:', this);
         window.open("https://apps.apple.com/us/app/id1511177838"); 
       }

       handleInstallAppClick = () => {
        // console.log('this is:', this);
         window.open("https://install.begenuin.com/86sn/cgs"); 
       }


    componentDidMount() {
        const { pathname, query } = Router
        // if (pathname == '/') {
        //     window.location.href = process.env.genuinurl
        // }
        $(document).ready(function () {
            $('.nav-button').click(function () {
                $('body').toggleClass('nav-open');
            });
        });

        this.setState({
            nav1: this.slider1,
            nav2: this.slider2
        });
    }

    render() {
        var settings = {
            dots: false,
            arrows: false,
            fade: true,
            autoplay: true,
            infinite: true,
            speed: 800,
            slidesToShow: 1,
            slidesToScroll: 1,
            autoplaySpeed: 3000
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
            autoplaySpeed: 3000
        };

    
    let children='Genuin';
    let  title='Genuin';
     let metaImage=require('../images/genuin_app_icon.png');
     let metaImageWidth='48';
     let metaImageHeight='48';
     let content='';
     let description='For individuals that want to showcase, discover and connect with new people online like in real life, Genuin is a video chatting discovery platform that allows you to engage with whom you want and when you want, exchanging short-form videos, to have a conversation of your choice, face to face, as you do in reality.';
     let currentUrl='https://begenuin.com';
     let keyword='Genuin,Showcase Yourself. Get Discovered. Make Connections, video Communication';


        return (
            
            <Metalayout title="Genuin" videoUrl={currentUrl} metaImageWidth={metaImageWidth} metaImageHeight={metaImageHeight} metaImage={metaImage} content={content} description={description} currentUrl={currentUrl} keyword={keyword}>
            <div className="mobile-m-p">
                <style jsx global>{`
                html {
                    overflow-y: auto;
                }
                #__next > div {
                    height: 100vh;
                }
                .footer-links {
                    position: absolute;
                    bottom: 0px;
                }
                .slider-container {
                    height: 85vh;
                }
                .slider-container > div {
                    height: 100%;
                }
                @media (min-width: 1200px) {
                    .container, .container-sm, .container-md, .container-lg, .container-xl {
                        max-width: 1310px !important;
                    }
                }
                `}</style>
                <Container className="sticky-top">
                    <Row>
                        <Col xl={12}>
                            <Navbar bg="transparent p-0 pt-4 pb-4 " expand="sm">
                                {/* <Navbar.Brand href="#home" className="p-0">genuin</Navbar.Brand> */}

                                <Navbar.Brand href="/" className="p-0">
                                    <img src={require('../images/logo_header.png')} alt="Genuin" />
                                </Navbar.Brand>

                                {/* <Navbar.Toggle aria-controls="basic-navbar-nav" /> */}

                                <a className="nav-button ml-auto d-sm-none p-0"><span id="nav-icon3"><span></span><span></span><span></span><span></span></span></a>

                                <div className="fixed-top main-menu">
                                    <div className="flex-top p-5 mt-5">
                                        <ul className="nav flex-column w-100">
                                            <li className="nav-item delay-1 pt-4"><a onClick={this.handleInstallAppClick} className="nav-link pt-5" href="#">Download App</a></li>
                                            <li className="nav-item delay-2"><a onClick={this.handleInvestClick} className="nav-link" href="#">Invest in Genuin</a></li>
                                            {/* <li className="nav-item delay-3"><a className="nav-link" href="#">About</a></li> */}
                                            <li className="nav-item delay-4"><a className="nav-link" href="/terms">Terms of Service </a></li>
                                            <li className="nav-item delay-5"><a className="nav-link" href="/privacy">Privacy Policy</a></li>
                                        </ul>

                                        <ul className="copy-right">
                                            <li className="nav-item delay-5"><a className="nav-link" href="/">© 2022 Genuin Inc.</a></li>
                                        </ul>
                                    </div>
                                </div>

                                <Navbar.Collapse id="basic-navbar-nav" className="collapse navbar-collapse">
                                    <Nav className="mr-auto">
                                        {/* <div className="d-sm-none">
                            <Nav.Link href="#home" className="animated fadeInDown">Download App</Nav.Link>
                            <Nav.Link href="#link" className="animated fadeInDown">Invest in Genuin</Nav.Link>
                            <Nav.Link href="#link" className="animated fadeInDown">About </Nav.Link>
                            <Nav.Link href="#link" className="animated fadeInDown">Terms of Service </Nav.Link>
                            <Nav.Link href="#link" className="animated fadeInDown">Privacy Policy</Nav.Link>                                    
                            </div> */}
                                    </Nav>
                                    <Form inline className="d-none d-sm-block d-md-block d-lg-block">
                                        {/* <FormControl type="text" placeholder="Search" className="mr-sm-2" /> */}
                                        <Button onClick={this.handleInvestClick} variant="primary">Invest in Genuin</Button>
                                    </Form>
                                </Navbar.Collapse>
                            </Navbar>
                        </Col>
                    </Row>
                </Container>

                <Container className="slider-container">
                    <Row className="justify-content-center align-items-center">
                        {/* <Col xl={{ span: 5, offset: 1 }} lg={6} md={6} sm={12}> */}
                        <Col xl={6} lg={6} md={6} sm={12} className="img-slider">
                            <div className="slider-img">
                                <Slider asNavFor={this.state.nav2}ref={slider => (this.slider1 = slider)} {...settings}>
                                    <div>
                                        <img src={require('../images/1_hiring_small.png')} alt="Find your dream candidate" className="img-fluid mx-auto d-block" />
                                    </div>
                                    <div>
                                        <img src={require('../images/2_investors_small.png')} alt="Find Investors for your Startup" className="img-fluid mx-auto d-block" />
                                    </div>
                                    <div>
                                        <img src={require('../images/3_inspired_small.png')} alt="Get Inspired" className="img-fluid mx-auto d-block" />
                                    </div>
                                    <div>
                                        <img src={require('../images/4_community_small.png')} alt="Engage with community" className="img-fluid mx-auto d-block" />
                                    </div>
                                    <div>
                                        <img src={require('../images/5_discussions_small.png')} alt="Initiate Discussions" className="img-fluid mx-auto d-block" />
                                    </div>
                                </Slider>

                            </div>
                        </Col>
                        <Col xl={6} lg={6} md={6} sm={12} className="slider-text-center text-slider">
                            <div>
                                <Slider asNavFor={this.state.nav1} ref={slider => (this.slider2 = slider)} {...settingsone}>
                                    <div>
                                        <h1>Find your<br />dream candidate</h1>
                                    </div>

                                    <div>
                                        <h1>Find Investors<br />for your Startup</h1>
                                    </div>

                                    <div>
                                        <h1>Get<br />Inspired</h1>
                                    </div>

                                    <div>
                                        <h1>Engage with <br />community</h1>
                                    </div>

                                    <div>
                                        <h1>Initiate<br />Discussions</h1>
                                    </div>
                                </Slider>
                                <Button variant="primary" onClick={this.handleHireLinkClick} className="mt-5 mb-4 d-none d-sm-block d-md-block d-lg-block">Watch Now</Button>
                                <div className="mt-4 d-sm-none"></div>
                                <Button variant="primary" onClick={this.handleInstallAppClick} className="mt-5 d-sm-none">Download App</Button>
                            </div>

                            <Nav defaultActiveKey="/home" as="ul" className="appstore-googleplay d-block slider-text-center mt-4 pt-4 d-none d-sm-block d-md-block d-lg-block">
                                <Nav.Item as="li">
                                    <Nav.Link href="" className="pl-0 pr-2">
                                        <img src={require('../images/badge_appstore.png')} onClick={this.handleIosInstallClick} alt="badge_appstore" className="img-fluid" />
                                    </Nav.Link>
                                    <Nav.Link href="" className="pr-0">
                                        <img src={require('../images/badge_playstore.png')} onClick={this.handleAndroidInstallClick} alt="badge_playstore" className="img-fluid" />
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Col>
                    </Row>
                </Container>


                <Container className="footer-m-none">
                    <Row className="pt-3 pb-3">
                        <Col xl={8} lg={8} md={8} sm={8}>
                            <Nav defaultActiveKey="/home" as="ul">
                                {/* <Nav.Item as="li">
                                    <Nav.Link href="/about" className="pl-0">About</Nav.Link>
                                </Nav.Item> */}
                                <Nav.Item as="li">
                                    <Nav.Link href="/terms" eventKey="link-1">Terms of Service</Nav.Link>
                                </Nav.Item>
                                <Nav.Item as="li">
                                    <Nav.Link href="/privacy" eventKey="link-2">Privacy Policy</Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Col>
                        <Col xl={4} lg={4} md={4} sm={4} className="text-m-center">
                            <Nav className="justify-content-end" defaultActiveKey="/home" as="ul">
                                <Nav.Item as="li">
                                    <Nav.Link href="/" className="pr-0">© 2022 Genuin Inc.</Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Col>
                    </Row>
                </Container>

            </div>
        </Metalayout>
        );
    }
}