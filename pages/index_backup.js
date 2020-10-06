render()
{
return (

    <div className="mobile-m-p">                
        <Container className="sticky-top">
            <Row>
            <Col xl={12}>
            <Navbar bg="transparent p-0 pt-4 pb-4 " expand="sm">                              
                        {/* <Navbar.Brand href="#home" className="p-0">genuin</Navbar.Brand> */}

                        <Navbar.Brand href="#home" className="p-0">
                            <img src={require('../images/logo_header.png')} alt="logo_header" />
                        </Navbar.Brand>

                        {/* <Navbar.Toggle aria-controls="basic-navbar-nav" /> */}

                        <a className="nav-button ml-auto d-sm-none"><span id="nav-icon3"><span></span><span></span><span></span><span></span></span></a>

                        <div className="fixed-top main-menu">
                            <div className="flex-top p-5 mt-5">
                                <ul className="nav flex-column w-100">
                                    <li className="nav-item delay-1 pt-4"><a className="nav-link pt-5" href="#">Download App</a></li>
                                    <li className="nav-item delay-2"><a className="nav-link" href="#">Invest in Genuin</a></li>
                                    <li className="nav-item delay-3"><a className="nav-link" href="#">About</a></li>
                                    <li className="nav-item delay-4"><a className="nav-link" href="#">Terms of Service </a></li>
                                    <li className="nav-item delay-5"><a className="nav-link" href="#">Privacy Policy</a></li>                                                                                        
                                </ul>

                                <ul className="copy-right">
                                <li className="nav-item delay-5"><a className="nav-link" href="#">© 2020 Genuin Inc.</a></li>
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
                                 <Button variant="primary">Invest in Genuin</Button>
                            </Form>
                        </Navbar.Collapse>
                    </Navbar>
                    </Col>
                    </Row>
        </Container>

        <Container>
            <Row className="mt-5 justify-content-center align-items-center">
                {/* <Col xl={{ span: 5, offset: 1 }} lg={6} md={6} sm={12}> */}
                <Col xl={6} lg={6} md={6} sm={12}>
                    <div className="slider-img">
                         {/* <OwlCarousel
                            className="owl-theme"
                            loop
                            margin={10}
                            nav
                            >
                            <div class="item">
                                <img src={require('../images/image_feature_1.png')} alt="image_feature_1" className="img-fluid mx-auto d-block" />
                            </div>
                             <div class="item"><h4>2</h4></div>
                            <div class="item"><h4>3</h4></div>
                            <div class="item"><h4>4</h4></div>
                            <div class="item"><h4>5</h4></div>
                            <div class="item"><h4>6</h4></div>
                            <div class="item"><h4>7</h4></div>
                            <div class="item"><h4>8</h4></div>
                            <div class="item"><h4>9</h4></div>
                            <div class="item"><h4>10</h4></div>
                            <div class="item"><h4>11</h4></div>
                            <div class="item"><h4>12</h4></div> 
                            </OwlCarousel> */}
                            
                            
                                {/* <img src={require('../images/image_feature_1.png')} alt="image_feature_1" className="img-fluid mx-auto d-block" />                             */}
                                
                            
                    </div>
                </Col>
                <Col xl={6} lg={6} md={6} sm={12} className="slider-text-center">
                    <div>
                        <h1>Showcase <br />Yourself</h1>
                        <Button variant="primary" className="mt-5 d-none d-sm-block d-md-block d-lg-block">Watch Now</Button>

                        <Button variant="primary" className="mt-5 d-sm-none">Download App</Button>
                    </div>

                    <Nav defaultActiveKey="/home" as="ul" className="appstore-googleplay d-block slider-text-center mt-4 d-none d-sm-block d-md-block d-lg-block">
                        <Nav.Item as="li">
                            <Nav.Link href="" className="pl-0 pr-2">
                             <img src={require('../images/badge_appstore.png')} alt="badge_appstore" className="img-fluid" />
                            </Nav.Link>
                            <Nav.Link href="" className="pr-0">
                            <img src={require('../images/badge_playstore.png')} alt="badge_playstore" className="img-fluid" />
                            </Nav.Link>
                        </Nav.Item>
                    </Nav>
                </Col>
            </Row>
            <Row className="pb-5">
                <Col xl={12}>

                </Col>
            </Row>
        </Container>


        <Container className="footer-links d-none d-sm-block d-md-block d-lg-block">
            <Row className="mt-3 mb-3">
                <Col xl={8} lg={8} md={8} sm={8}>
                    <Nav defaultActiveKey="/home" as="ul">
                        <Nav.Item as="li">
                            <Nav.Link href="" className="pl-0">About</Nav.Link>
                        </Nav.Item>
                        <Nav.Item as="li">
                            <Nav.Link eventKey="link-1">Terms of Service</Nav.Link>
                        </Nav.Item>
                        <Nav.Item as="li">
                            <Nav.Link eventKey="link-2">Privacy Policy</Nav.Link>
                        </Nav.Item>
                    </Nav>
                </Col>
                <Col xl={4} lg={4} md={4} sm={4}>
                    <Nav className="justify-content-end" defaultActiveKey="/home" as="ul">
                        <Nav.Item as="li">
                            <Nav.Link href="" className="pr-0">© 2020 Genuin Inc.</Nav.Link>
                        </Nav.Item>
                    </Nav>
                </Col>
            </Row>
        </Container>

    </div>
)};