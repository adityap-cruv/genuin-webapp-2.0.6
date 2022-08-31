import React from 'react';
import { Nav, Navbar, Container, Row, Col } from 'react-bootstrap';
import './privacyAndTerms.module.css';

const Terms = () => {
  const handleHireLinkClick = () =>
    window.open('https://angel.co/company/begenuin');

  const handleInvestClick = () =>
    window.open('https://www.linkedin.com/company/begenuin/');

  return (
    <div className='content-page'>
      <style jsx global>{`
        body {
          background: white;
        }
        html {
          overflow-y: auto;
        }
      `}</style>
      <div className='header-bg'>
        <Container className='sticky-top'>
          <Row>
            <Col xl={12}>
              <Navbar bg='transparent navbar-padding' expand='sm'>
                <Navbar.Brand href='/' className='p-0'>
                  <img
                    src={require('../images/logo_header_new.png')}
                    alt='logo_header'
                  />
                </Navbar.Brand>

                <a className='nav-button ml-auto d-sm-none'>
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
                  <div className='d-none d-sm-block d-md-block d-lg-block'>
                    <div className='form-inline'>
                      <Nav.Item>
                        <Nav.Link href='https://www.linkedin.com/company/begenuin/'>
                          Invest in Genuin
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link
                          href='https://install.begenuin.com/86sn/cgs'
                          eventKey='link-1'
                        >
                          Get App
                        </Nav.Link>
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
          <Col
            xl={{ span: 8, offset: 2 }}
            lg={{ span: 8, offset: 2 }}
            md={{ span: 10, offset: 1 }}
            sm={12}
          >
            <div className='content-block pt-5'></div>
            <div className='content-block mobile-p mt-5 pt-5'>
              <h1 className='mb-4'>Genuin Inc. Terms of Service </h1>

              <h3>1. Terms </h3>

              <p>
                By accessing the website at http://begenuin.com/, you are
                agreeing to be bound by these terms of service, all applicable
                laws and regulations, and agree that you are responsible for
                compliance with any applicable local laws. If you do not agree
                with any of these terms, you are prohibited from using or
                accessing this site. The materials contained in this website are
                protected by applicable copyright and trademark law.{' '}
              </p>

              <h3>2. Use License </h3>

              <p>
                Permission is granted to temporarily download one copy of the
                materials (information or software) on Genuin Inc.’s website for
                personal, non-commercial transitory viewing only. This is the
                grant of a license, not a transfer of title, and under this
                license you may not:
              </p>

              <p>modify or copy the materials; </p>

              <p>
                use the materials for any commercial purpose, or for any public
                display (commercial or non-commercial);{' '}
              </p>

              <p>
                attempt to decompile or reverse engineer any software contained
                on Genuin Inc.’s website;{' '}
              </p>

              <p>
                remove any copyright or other proprietary notations from the
                materials; or transfer the materials to another person or
                “mirror” the materials on any other server.{' '}
              </p>

              <p>
                This license shall automatically terminate if you violate any of
                these restrictions and may be terminated by Genuin Inc. at any
                time. Upon terminating your viewing of these materials or upon
                the termination of this license, you must destroy any downloaded
                materials in your possession whether in electronic or printed
                format.{' '}
              </p>

              <h3>3. Disclaimer </h3>

              <p>
                The materials on Genuin Inc.’s website are provided on an ‘as
                is’ basis. Genuin Inc. makes no warranties, expressed or
                implied, and hereby disclaims and negates all other warranties
                including, without limitation, implied warranties or conditions
                of merchantability, fitness for a particular purpose, or
                non-infringement of intellectual property or other violation of
                rights.{' '}
              </p>

              <p>
                Further, Genuin Inc. does not warrant or make any
                representations concerning the accuracy, likely results, or
                reliability of the use of the materials on its website or
                otherwise relating to such materials or on any sites linked to
                this site.{' '}
              </p>

              <h3>4. Limitations </h3>

              <p>
                In no event shall Genuin Inc. or its suppliers be liable for any
                damages (including, without limitation, damages for loss of data
                or profit, or due to business interruption) arising out of the
                use or inability to use the materials on Genuin Inc.’s website,
                even if Genuin Inc. or a Genuin Inc. authorized representative
                has been notified orally or in writing of the possibility of
                such damage. Because some jurisdictions do not allow limitations
                on implied warranties, or limitations of liability for
                consequential or incidental damages, these limitations may not
                apply to you.{' '}
              </p>

              <h3>5. Accuracy of materials </h3>

              <p>
                The materials appearing on Genuin Inc.’s website could include
                technical, typographical, or photographic errors. Genuin Inc.
                does not warrant that any of the materials on its website are
                accurate, complete or current. Genuin Inc. may make changes to
                the materials contained on its website at any time without
                notice. However Genuin Inc. does not make any commitment to
                update the materials.{' '}
              </p>

              <h3> 6. Links </h3>

              <p>
                Genuin Inc. has not reviewed all of the sites linked to its
                website and is not responsible for the contents of any such
                linked site. The inclusion of any link does not imply
                endorsement by Genuin Inc. of the site. Use of any such linked
                website is at the user’s own risk.{' '}
              </p>

              <h3>7. Modifications </h3>

              <p>
                Genuin Inc. may revise these terms of service for its website at
                any time without notice. By using this website you are agreeing
                to be bound by the then current version of these terms of
                service.{' '}
              </p>

              <h3> 8. Governing Law </h3>
              <p>
                These terms and conditions are governed by and construed in
                accordance with the laws of New York and you irrevocably submit
                to the exclusive jurisdiction of the courts in that State or
                location.
              </p>
            </div>
          </Col>
        </Row>
      </Container>

      <Container className='footer-links'>
        <Row className='pt-3 pb-3'>
          <Col xl={4} lg={4} md={4} sm={4} className='text-m-center'>
            <Nav defaultActiveKey='/home' as='ul'>
              <Nav.Item as='li'>
                <Nav.Link style={{ opacity: 0.5 }} href='/' className='pr-0'>
                  © 2022 Genuin Inc.
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>
          <Col xl={8} lg={8} md={8} sm={8}>
            <Nav
              className='justify-content-end'
              defaultActiveKey='/home'
              as='ul'
            >
              <Nav.Item as='li'>
                <Nav.Link
                  style={{ opacity: 0.5 }}
                  href='/terms'
                  eventKey='link-1'
                >
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
                  eventKey='link-1'
                >
                  |
                </Nav.Link>
              </Nav.Item>
              <Nav.Item as='li'>
                <Nav.Link
                  style={{ opacity: 0.5 }}
                  href='/privacy'
                  eventKey='link-2'
                >
                  Privacy Policy
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Terms;
