import React, { useState } from 'react'
import { Nav, Container, Row, Col } from 'react-bootstrap'
import { Layout } from '../components/layout/layout'
import { TopNav } from '../components/basic/top_nav'
import { GetAppModal } from '../components/basic/get_app_modal'

const Terms = () => {
  const [showModalAppDownload, setShowModalAppDownload] = useState(false)
  const handleCloseAppDownload = () => setShowModalAppDownload(false)
  const handleShowModalAppDownload = () => setShowModalAppDownload(true)
  return (
    <Layout className='overflow-auto'>
      <section className='bg-black h-top-navbar position-sticky top-0'>
        <TopNav
          showGetAppModal={handleShowModalAppDownload}
          isContiner
          variant='light'
        />
      </section>
      <section className='bg-body h-100'>
        <Container className='mt-3'>
          <Row>
            <Col
              xl={{ span: 8, offset: 2 }}
              lg={{ span: 8, offset: 2 }}
              md={{ span: 10, offset: 1 }}
              sm={12}
            >
              <h1 className='mb-4 text-primary fw-bold'>
                Genuin Inc. Terms of Service
              </h1>

              <h3>1. Terms </h3>

              <p>
                By accessing the website at http://begenuin.com/, you are
                agreeing to be bound by these terms of service, all applicable
                laws and regulations, and agree that you are responsible for
                compliance with any applicable local laws. If you do not agree
                with any of these terms, you are prohibited from using or
                accessing this site. The materials contained in this website are
                protected by applicable copyright and trademark law.
              </p>

              <h3>2. Use License </h3>

              <p>
                Permission is granted to temporarily download one copy of the
                materials (information or software) on Genuin Inc.'s website for
                personal, non-commercial transitory viewing only. This is the
                grant of a license, not a transfer of title, and under this
                license you may not:
              </p>

              <p>modify or copy the materials; </p>

              <p>
                use the materials for any commercial purpose, or for any public
                display (commercial or non-commercial);
              </p>

              <p>
                attempt to decompile or reverse engineer any software contained
                on Genuin Inc.'s website;
              </p>

              <p>
                remove any copyright or other proprietary notations from the
                materials; or transfer the materials to another person or
                “mirror” the materials on any other server.
              </p>

              <p>
                This license shall automatically terminate if you violate any of
                these restrictions and may be terminated by Genuin Inc. at any
                time. Upon terminating your viewing of these materials or upon
                the termination of this license, you must destroy any downloaded
                materials in your possession whether in electronic or printed
                format.
              </p>

              <h3>3. Disclaimer </h3>

              <p>
                The materials on Genuin Inc.'s website are provided on an 'as
                is' basis. Genuin Inc. makes no warranties, expressed or
                implied, and hereby disclaims and negates all other warranties
                including, without limitation, implied warranties or conditions
                of merchantability, fitness for a particular purpose, or
                non-infringement of intellectual property or other violation of
                rights.
              </p>

              <p>
                Further, Genuin Inc. does not warrant or make any
                representations concerning the accuracy, likely results, or
                reliability of the use of the materials on its website or
                otherwise relating to such materials or on any sites linked to
                this site.
              </p>

              <h3>4. Limitations </h3>

              <p>
                In no event shall Genuin Inc. or its suppliers be liable for any
                damages (including, without limitation, damages for loss of data
                or profit, or due to business interruption) arising out of the
                use or inability to use the materials on Genuin Inc.'s website,
                even if Genuin Inc. or a Genuin Inc. authorized representative
                has been notified orally or in writing of the possibility of
                such damage. Because some jurisdictions do not allow limitations
                on implied warranties, or limitations of liability for
                consequential or incidental damages, these limitations may not
                apply to you.
              </p>

              <h3>5. Accuracy of materials </h3>

              <p>
                The materials appearing on Genuin Inc.'s website could include
                technical, typographical, or photographic errors. Genuin Inc.
                does not warrant that any of the materials on its website are
                accurate, complete or current. Genuin Inc. may make changes to
                the materials contained on its website at any time without
                notice. However Genuin Inc. does not make any commitment to
                update the materials.
              </p>

              <h3> 6. Links </h3>

              <p>
                Genuin Inc. has not reviewed all of the sites linked to its
                website and is not responsible for the contents of any such
                linked site. The inclusion of any link does not imply
                endorsement by Genuin Inc. of the site. Use of any such linked
                website is at the user's own risk.
              </p>

              <h3>7. Modifications </h3>

              <p>
                Genuin Inc. may revise these terms of service for its website at
                any time without notice. By using this website you are agreeing
                to be bound by the then current version of these terms of
                service.
              </p>

              <h3> 8. Governing Law </h3>
              <p>
                These terms and conditions are governed by and construed in
                accordance with the laws of New York and you irrevocably submit
                to the exclusive jurisdiction of the courts in that State or
                location.
              </p>
            </Col>
          </Row>
        </Container>

        <Container className='container-footer text-black mt-auto'>
          <Row className='py-3'>
            <Col xl={4} lg={4} md={4} sm={12}>
              <Nav as='ul'>
                <Nav.Item as='li'>
                  <Nav.Link style={{ opacity: 0.5 }} href='/' className='pr-0'>
                    © 2023 Genuin Inc.
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Col>
            <Col xl={8} lg={8} md={8} sm={12}>
              <Nav
                className='justify-content-start justify-content-md-end'
                as='ul'
              >
                {/* <Nav.Item as='li'>
                  <Nav.Link
                    style={{ opacity: 0.5 }}
                    href='#'
                    onClick={handleInvestClick}
                  >
                    Invest in Genuin
                  </Nav.Link>
                </Nav.Item> */}
                <Nav.Item as='li'>
                  <Nav.Link
                    style={{ opacity: 0.5 }}
                    target="_blank"
                    href={'/content_demo?value=rt_123f373977001407'}
                  >
                    Life at Genuin
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item as='li'>
                  <Nav.Link
                    style={{
                      opacity: 0.5,
                      paddingLeft: '0px',
                      paddingRight: '0px'
                    }}
                    href={undefined}
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
                      paddingRight: '0px'
                    }}
                    href={undefined}
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
  )
}

export default Terms
