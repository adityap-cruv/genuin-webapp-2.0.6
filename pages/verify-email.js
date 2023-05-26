import React from 'react'
import { TopNav } from '../components/navbar/top_nav'
import { Layout } from '../components/layout'
import axios from 'axios'

import { Container } from 'react-bootstrap'
import { ModalBody } from '../components/verify_email/modal_body'

const VerifyEmail = ({
  data
}) => {
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
            isError={data?.error}
            title={data?.title}
            subtitle={data?.subtitle}
          />
        </div>
      </Container>
    </section>
  </Layout>)
}

// 1003 / 401  -  token has expired
// 5033 / 401 - token has expired
// 1099 / 400 - An unexpected error occurred processing the request
// 5025 / 404 - Could not find the user.
// 5100 / 500 - Could not update the user.
// 5176 / 429 - Data has been expired. (edited
VerifyEmail.getInitialProps = async ({ query: { token } }) => {
  if (token) {
    try {
      const res = await axios.get(`${process.env.internalApiurl}/api/v3/verify_email_token?token=${token}`)
      let data = {}
      if (res?.data?.code === 200) {
        data = {
          title: 'Email successfully verified',
          subtitle: 'Now you’ll receive important updates and notifications about your account, new features, and exciting news straight to your inbox. You can go back to app now.',
          error: false
        }
      } else {
        data = {
          title: 'Oops, something went wrong!',
          subtitle: 'We\'re sorry, but something went wrong. Please try again later or contact our support team for assistance on the app.',
          error: true
        }
      }
      return {
        data
      }
    } catch (e) {
      const code = e?.response?.data?.code
      let data = {}
      if (code === '1003' || code === '5176' || code === '5033') {
        data = {
          title: 'Verification link expired',
          subtitle: 'We\'re sorry, but it looks like the verification link has expired. Please request a new verification link from the app to verify your email address.',
          error: true
        }
      } else {
        data = {
          title: 'Oops, something went wrong!',
          subtitle: 'We\'re sorry, but something went wrong. Please try again later or contact our support team for assistance on the app.',
          error: true
        }
      }

      return {
        data
      }
    }
  } else {
    return {
      data: {
        title: 'Oops, something went wrong!',
        subtitle: 'We\'re sorry, but something went wrong. Please try again later or contact our support team for assistance on the app.',
        error: true
      }
    }
  }
}

export default VerifyEmail
