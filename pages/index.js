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

import { postEarlyAccess } from "../actions/postActions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { Nav, Navbar, Form, Button, FormControl, Container, Row, Col, InputGroup } from 'react-bootstrap';
// import bootstrapStyles from './index.scss'
import './index.css'
import Metalayout from '../components/Metalayout';

export default class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            nav1: null,
            nav2: null,
            early_access_email: '',
            early_access_error_text: `This is a required field *`,
            early_access_error_hidden: true,
            early_access_success_hidden: true,
            early_access_email_loader: false
        };
        this.earlyAccessSubmitHandler = this.earlyAccessSubmitHandler.bind(this);
        this.earlyAccessEmailChanged = this.earlyAccessEmailChanged.bind(this);
    }
    handleInvestClick = () => {
        window.open("https://www.linkedin.com/company/begenuin/");
    }
    handleHireLinkClick = () => {
       // console.log('this is:', this);
        window.open("https://angel.co/company/begenuin");
    }
    earlyAccessSubmitHandler = async () => {
        if(!this.state.early_access_email_loader){
            this.setState({early_access_success_hidden: true})
            if(this.state.early_access_email == null || this.state.early_access_email == ""){
                this.setState({early_access_error_hidden: false})
                this.setState({early_access_error_text: `This is a required field *`})
            }
            else if(!this.validateEmail(this.state.early_access_email)){
                this.setState({early_access_error_hidden: false})
                this.setState({early_access_error_text: `Invalid Email`})
            }
            else{
                this.setState({early_access_error_hidden: true})
                this.setState({early_access_error_text: ``})
                this.setState({early_access_email_loader: true})
                let response = await postEarlyAccess({email: this.state.early_access_email});
                if(response && response.code && response.code == 200){
                    this.setState({
                        early_access_email_loader: false,
                        early_access_success_hidden: false,
                        early_access_email: ''
                    });
                }
                else{
                    this.setState({
                        early_access_email_loader: false,
                        early_access_error_hidden: false,
                        early_access_error_text: response.message
                    });
                }
            }
        }
    }
    earlyAccessEmailChanged = (e) => {
        this.setState({early_access_success_hidden: true})
        this.setState({early_access_email: e.target.value})
    }
    validateEmail = (email) => {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
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
            autoplaySpeed: 4000
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
            autoplaySpeed: 4000
        };

    
    let children='Genuin';
    let  title='Genuin';
     let metaImage=require('../images/Genuin_icon_48_new.png');
     let metaImageWidth='48';
     let metaImageHeight='48';
     let content='';
     let description='Genuin is a video-first professional networking platform that allows you to showcase your expertise and connect with other professionals and businesses. Whether you are searching for a job, seeking investment, hiring candidates, or any other networking, Genuin helps you stand out';
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
                .early_access {
                    font-weight: 700;
                    font-size: 2rem;
                    line-height: 3rem;
                    display: block;
                }
                .early_access_div {
                    border: 1px solid #0645FF;
                    border-radius: 5px;
                    height: 3rem;
                }
                .early_access_div input {
                    height: 100%;
                    background-color: transparent;
                    color: white;
                    font-weight: 600;
                    font-size: 1.2rem;
                    line-height: 1.5rem;
                    border: none;
                }
                .early_access_div input:hover, .early_access_div input:focus {
                    background-color: transparent;
                    color: white;
                    border: none;
                    box-shadow: none;
                }
                .early_access_div input::placeholder, .early_access_div input:-ms-input-placeholder {
                    color: white;
                    opacity: 0.5;
                }
                #early_access_email {
                    background-color: #0645FF;
                    color: white;
                    font-weight: 700;
                    font-size: 1.2rem;
                    line-height: 1.5rem;
                    border: 1px solid #0645FF;
                }
                .early_access_error {
                    color: #F2545B;
                    font-weight: 600;
                    font-size: 1rem;
                    line-height: 1.2rem;
                }
                .early_access_success {
                    color: #0645FF;
                    font-weight: 600;
                    font-size: 1rem;
                    line-height: 1.2rem;
                }
                .early_access_error.hide, .early_access_success.hide {
                    display:none;
                }
                @media (max-width: 576px) {
                    .img-slider {
                        margin-top: -8%;
                    }
                    .text-slider .slick-slider {
                        margin-top: -10%;
                    }
                }
                @media (max-width: 767px) {
                    /*.img-slider {
                        margin-top: -8%;
                    }
                    .text-slider .slick-slider {
                        margin-top: -10%;
                    }*/
                    .early_access {
                        font-size: 1.5rem;
                        line-height: 2rem;
                    }
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
                                    <img src={require('../images/logo_header_new.png')} alt="Genuin" />
                                </Navbar.Brand>

                                {/* <Navbar.Toggle aria-controls="basic-navbar-nav" /> */}

                                <a className="nav-button ml-auto d-sm-none p-0"><span id="nav-icon3"><span></span><span></span><span></span><span></span></span></a>

                                <div className="fixed-top main-menu">
                                    <div className="flex-top p-5 mt-5">
                                        <ul className="nav flex-column w-100">
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
                        <Col xl={6} lg={6} md={6} sm={12} className="img-slider" >
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
                                <h2 className="early_access mt-4 mb-2">Get an early access</h2>
                                <InputGroup className="early_access_div mb-1">
                                    <FormControl onChange={this.earlyAccessEmailChanged} placeholder="Email" aria-label="Email" aria-describedby="early_access_email"/>
                                    <Button onClick={this.earlyAccessSubmitHandler} variant="outline-secondary" id="early_access_email">
                                        {this.state.early_access_email_loader?<FontAwesomeIcon icon={faSpinner} className="fa-spin" />:`Notify Me`}
                                    </Button>
                                </InputGroup>
                                <span className={this.state.early_access_error_hidden ? 'early_access_error hide' : 'early_access_error'}>{this.state.early_access_error_text}</span>
                                <span className={this.state.early_access_success_hidden ? 'early_access_success hide' : 'early_access_success'}>Thanks for subscribing!</span>
                            </div>
                        </Col>
                    </Row>
                </Container>


                <Container className="footer-m-none">
                    <Row className="pt-3 pb-3">
                        <Col xl={4} lg={4} md={4} sm={4} className="text-m-center">
                            <Nav defaultActiveKey="/home" as="ul">
                                <Nav.Item as="li">
                                    <Nav.Link style={{opacity: 0.5}} href="/" className="pr-0">© 2022 Genuin Inc.</Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Col>
                        <Col xl={8} lg={8} md={8} sm={8}>
                            <Nav className="justify-content-end" defaultActiveKey="/home" as="ul">
                                {/* <Nav.Item as="li">
                                    <Nav.Link href="/about" className="pl-0">About</Nav.Link>
                                </Nav.Item> */}
                                <Nav.Item as="li">
                                    <Nav.Link style={{opacity: 0.5}} href="/terms" eventKey="link-1">Terms of Service</Nav.Link>
                                </Nav.Item>
                                <Nav.Item as="li">
                                    <Nav.Link style={{opacity: 0.5, paddingLeft: "0px", paddingRight: "0px"}} href={void(0)} eventKey="link-1">|</Nav.Link>
                                </Nav.Item>
                                <Nav.Item as="li">
                                    <Nav.Link style={{opacity: 0.5}} href="/privacy" eventKey="link-2">Privacy Policy</Nav.Link>
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