import React, { useState } from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import { TopNav } from './top_nav'
import { Layout } from '../layout'
import { InstallApp } from './install_app'
import { GetAppModal } from './get_app_modal'

export const Error = ({ homePageUrl = '/' }) => {
  const [showModalAppDownload, setShowModalAppDownload] = useState(false)
  const handleShowModalAppDownload = (message = () => null) => {
    setShowModalAppDownload(true)
  }
  const handleCloseModalAppDownload = (message = () => null) => {
    setShowModalAppDownload(false)
  }
  return (
    <Layout>
      <section className='w-100 h-100 bg-gradient-blue d-flex align-items-center'>
        <TopNav showGetAppModal={handleShowModalAppDownload} isContiner variant='light' />
        <Container>
          <Row className='mb-5'>
            <Col
              xs={12}
              lg={10}
              className='d-flex align-items-center justify-content-center mx-auto text-center text-white flex-column'
            >
              <h2 className='fw-bold mb-4 h1'>
                Sorry, this page isn't available.
              </h2>
              <p className='fs-3'>
                The link you followed may be broken, or the page may have been
                removed. Go to <a href={homePageUrl ?? ''}>Genuin Home Page.</a>
              </p>
            </Col>
          </Row>
          <Row xs={2} className='justify-content-center'>
            <InstallApp errorPage={true}/>
          </Row>
        </Container>
        <GetAppModal show={showModalAppDownload} onClose={handleCloseModalAppDownload}/>
      </section>
    </Layout>
  )
}
