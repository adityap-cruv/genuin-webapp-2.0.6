import React, { useState, useEffect } from 'react'
import { TopNav } from '../components/navbar/top_nav'
import { Layout } from '../components/layout'
import axios from 'axios'

import { Container } from 'react-bootstrap'
import { ModalBody } from '../components/verify_email/modal_body'

const VerifyEmail = ({
  isError = false,
  code
}) => {
  const [{ title, subtitle, error }, setData] = useState({ title: '', subtitle: '', error: isError })

  useEffect(() => {
    if (code === 200) {
      setData({
        title: 'Email successfully verified',
        subtitle: 'Now you’ll receive latest app updates on your registered email address. You can go back to app now.',
        error: false
      })
    } else if (code === 5176) {
      setData({
        title: 'Verification link expired',
        subtitle: 'We\'re sorry, but it looks like the verification link has expired.Please request a new verification link from the app to verify your email address.',
        error: true
      })
    } else {
      setData({
        title: 'Oops, something went wrong!',
        subtitle: 'We\'re sorry, but something went wrong.Please try again later or contact our support team for assistance on the app.',
        error: true
      })
    }
  }, [])

  return (<Layout>
    <TopNav isBlue isContiner/>
    <section
      style={{
        height: '100%',
        backgroundColor: '#F9F9F9',
        width: '100%'
      }}>
      <Container
        style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div
          className='col-xl-5 col-lg-6 col-md-8 col-sm-11 col-xs-12'
          style={{
            backgroundColor: 'white',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            borderRadius: '10px'
          }}
        >
          <ModalBody
            isError={error}
            title={title}
            subtitle={subtitle}
          />
        </div>
      </Container>
    </section>
  </Layout>)
}

VerifyEmail.getInitialProps = async ({ query: { token } }) => {
  if (token) {
    try {
      const res = await axios.get(`${process.env.internalApiurl}/api/v3/verify_email_token?token=${token}`)
      return {
        code: res?.data?.code
      }
    } catch (e) {
      return Promise.resolve({})
    }
  } else {
    return {
      isError: 'true'
    }
  }
}

export default VerifyEmail
