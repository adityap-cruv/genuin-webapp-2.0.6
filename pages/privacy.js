import React from 'react'
import $ from 'jquery';
import Router from 'next/router';
import Link from 'next/link';
// import OwlCarousel from 'react-owl-carousel';
// import 'owl.carousel/dist/assets/owl.carousel.css';
// import 'owl.carousel/dist/assets/owl.theme.default.css';
// import Styles from '!style-loader!css-loader?modules!./styles.css';
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
import './privacy.css'

export default class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            nav1: null,
            nav2: null
        };

    }

    handleHireLinkClick = () => {
       // console.log('this is:', this);
        window.open("https://www.linkedin.com/company/begenuin/jobs/");

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
    }

    render() {
        return (
            <div className="content-page">
              <style jsx global>{`
                body {
                    background: white;
                }
                html {
                    overflow-y: auto;
                }
                `}</style>
              <div className="header-bg">
                <Container className="sticky-top">
                    <Row>
                        <Col xl={12}>
                            <Navbar bg="transparent navbar-padding" expand="sm">
                                {/* <Navbar.Brand href="#home" className="p-0">genuin</Navbar.Brand> */}

                                <Navbar.Brand href="/" className="p-0">
                                    <img src={require('../images/logo_header_new.png')} alt="logo_header" />
                                </Navbar.Brand>

                                {/* <Navbar.Toggle aria-controls="basic-navbar-nav" /> */}

                                <a className="nav-button ml-auto d-sm-none"><span id="nav-icon3"><span></span><span></span><span></span><span></span></span></a>

                                {/* <div className="fixed-top main-menu">
                                    <div className="flex-top p-5 mt-5">
                                        <ul className="nav flex-column w-100">
                                            <li className="nav-item delay-1 pt-4"><a onClick={this.handleInstallAppClick} className="nav-link pt-5" href="#">Download App</a></li>
                                            <li className="nav-item delay-2"><a className="nav-link" href="#">Invest in Genuin</a></li>
                                            <li className="nav-item delay-3"><a className="nav-link" href="#">About</a></li>
                                            <li className="nav-item delay-4"><a className="nav-link" href="#">Terms of Service </a></li>
                                            <li className="nav-item delay-5"><a className="nav-link" href="#">Privacy Policy</a></li>
                                        </ul>

                                        <ul className="copy-right">
                                            <li className="nav-item delay-5"><a className="nav-link" href="#">© 2022 Genuin Inc.</a></li>
                                        </ul>
                                    </div>
                                </div> */}

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
                                    <div className="d-none d-sm-block d-md-block d-lg-block">
                                    <div className="form-inline">
                                    <Nav.Item>
                                      <Nav.Link href="https://www.linkedin.com/company/begenuin/">Invest in Genuin</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                      <Nav.Link href="https://install.begenuin.com/86sn/cgs" eventKey="link-1">Download App</Nav.Link>
                                    </Nav.Item>
                                    </div>
                                    </div>
                                </Navbar.Collapse>
                            </Navbar>
                        </Col>
                    </Row>
                </Container>
                </div>

                <Container>
                    <Row>
                        {/* <Col xl={{ span: 5, offset: 1 }} lg={6} md={6} sm={12}> */}
                        <Col xl={{ span: 8, offset: 2 }} lg={{ span: 8, offset: 2 }} md={{ span: 10, offset: 1 }} sm={12}>
                          <div className="content-block pt-5"></div>
                            <div className="content-block mobile-p mt-5 pt-5">
                               
                            <h1 className="mb-4">Privacy Policy </h1>
                                                        
                            <p>Your privacy is important to us. It is Genuin Inc.’s policy to respect your privacy regarding any information we may collect from you through our app, Genuin. </p>
                              
                              
                            <p>We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.</p>
                              
                            <p>We only retain collected information for as long as necessary to provide you with your requested service. What data we store, we’ll protect within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use or modification.</p>
                               
                            <p> We don’t share any personally identifying information publicly or with third-parties, except when required to by law. </p>
                                
                            <p> Our app may link to external sites that are not operated by us. Please be aware that we have no control over the content and practices of these sites, and cannot accept responsibility or liability for their respective privacy policies. </p>
                                
                            <p> You are free to refuse our request for your personal information, with the understanding that we may be unable to provide you with some of your desired services. </p>
                                
                            <p> Your continued use of our app will be regarded as acceptance of our practices around privacy and personal information. If you have any questions about how we handle user data and personal information, feel free to contact us. </p>
                                
                            <p> This policy is effective as of 1 November 2020.</p>

                            </div>
                        </Col>                    
                    </Row>
                   
                </Container>


                <Container className="footer-links">
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
        );
    }
}