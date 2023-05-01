import React from 'react'
import { Nav, Container, Row, Col } from 'react-bootstrap'
import { datadogLogs } from '@datadog/browser-logs'

export const Footer = ({
  theme
}) => {
  return (<>
    <Container className={`container-footer text-${theme} mt-auto`}>
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
            <Nav.Item as='li'>
              <Nav.Link
                style={{ opacity: 0.5 }}
                target="_blank"
                href={'/content_demo?value=rt_123f373977001407'}
                onClick = {() => {
                  datadogLogs.logger.info('Link Clicked', { buttonType: 'Life at Genuin' })
                }}
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
              <Nav.Link
                style={{ opacity: 0.5 }}
                href='/terms'
                onClick={() => {
                  datadogLogs.logger.info('Link Clicked', { buttonType: 'Terms of Service' })
                }}
              >
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
              <Nav.Link
                style={{ opacity: 0.5 }}
                href='/privacy'
                onClick={() => {
                  datadogLogs.logger.log('Link Clicked', { buttonType: 'Privacy Policy' })
                }}
              >
                Privacy Policy
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Col>
      </Row>
    </Container>
  </>)
}
