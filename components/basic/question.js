import React from 'react'
import { Container, Row, Col, Image } from 'react-bootstrap'
import { InstallApp } from './install_app'

export const Question = ({ previewImage }) => (
  <section className='w-100 h-100 bg-gradient-blue d-flex align-items-center'>
    <Container>
      <Row className='mb-5'>
        <Col
          xs={12}
          lg={10}
          className='d-flex align-items-center justify-content-center mx-auto'
        >
          <Image
            src={previewImage}
            width={1084}
            height={546}
            alt='Question'
            title='Question'
            fluid
            className='rounded-5'
          />
        </Col>
      </Row>
      <Row xs={2} className='justify-content-center mt-5 pt-3'>
        <InstallApp />
      </Row>
    </Container>
  </section>
)
