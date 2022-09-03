import { useState } from 'react';
import { Nav, Container, Row, Col } from 'react-bootstrap';
import { Layout } from '../components/layout';
import { TopNav } from '../components/topNav';
import { GetAppModal } from '../components/getAppModal';

const Privacy = () => {
  const handleInvestClick = () =>
    window.open('https://www.linkedin.com/company/begenuin/');
  const [showModalAppDownload, setShowModalAppDownload] = useState(false);
  const handleCloseAppDownload = () => setShowModalAppDownload(false);
  const handleShowModalAppDownload = () => setShowModalAppDownload(true);
  return (
    <Layout className='overflow-auto'>
      <section className='bg-black h-top-navbar position-sticky top-0'>
        <TopNav showGetAppModal={handleShowModalAppDownload} isContiner />
      </section>
      <section className='bg-body section-privacy'>
        <Container className='mt-3'>
          <Row>
            <Col
              xl={{ span: 8, offset: 2 }}
              lg={{ span: 8, offset: 2 }}
              md={{ span: 10, offset: 1 }}
              sm={12}
            >
              <h1 className='mb-4 text-primary fw-bold'>Privacy Policy</h1>

              <p>
                Your privacy is important to us. It is Genuin Inc.'s policy to
                respect your privacy regarding any information we may collect
                from you through our app, Genuin.
              </p>

              <p>
                We only ask for personal information when we truly need it to
                provide a service to you. We collect it by fair and lawful
                means, with your knowledge and consent. We also let you know why
                we're collecting it and how it will be used.
              </p>

              <p>
                We only retain collected information for as long as necessary to
                provide you with your requested service. What data we store,
                we'll protect within commercially acceptable means to prevent
                loss and theft, as well as unauthorized access, disclosure,
                copying, use or modification.
              </p>

              <p>
                We don't share any personally identifying information publicly
                or with third-parties, except when required to by law.
              </p>

              <p>
                Our app may link to external sites that are not operated by us.
                Please be aware that we have no control over the content and
                practices of these sites, and cannot accept responsibility or
                liability for their respective privacy policies.
              </p>

              <p>
                You are free to refuse our request for your personal
                information, with the understanding that we may be unable to
                provide you with some of your desired services.
              </p>

              <p>
                Your continued use of our app will be regarded as acceptance of
                our practices around privacy and personal information. If you
                have any questions about how we handle user data and personal
                information, feel free to contact us.
              </p>

              <p> This policy is effective as of 1 November 2020.</p>
            </Col>
          </Row>
        </Container>

        <Container className='container-footer text-black mt-auto'>
          <Row className='py-3'>
            <Col xl={4} lg={4} md={4} sm={12}>
              <Nav as='ul'>
                <Nav.Item as='li'>
                  <Nav.Link style={{ opacity: 0.5 }} href='/' className='pr-0'>
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
  );
};

export default Privacy;
