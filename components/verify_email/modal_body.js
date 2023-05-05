import React from 'react'
import VerifyEmailSuccess from '../../assets/images/verify_email/verify_email_success.svg'
import VerifyEmailError from '../../assets/images/verify_email/verify_email_error.svg'
import Image from 'next/image'
import { Button } from 'react-bootstrap'

export const ModalBody = ({
  isError = false,
  title = '',
  subtitle = ''
}) => {
  return (<div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      padding: '3rem 1rem 3rem 1rem'
    }}
  >
    <Image
      src={!isError ? VerifyEmailSuccess.src : VerifyEmailError.src}
      height='100%'
      width='100%'
    />
    <div
      style={{
        fontSize: '32px',
        lineHeight: '48px',
        fontWeight: '700',
        textAlign: 'center',
        padding: '1rem'
      }}>
      <p>{title}</p>
    </div>
    <div style={{
      fontSize: '17px',
      lineHeight: '24px',
      textAlign: 'center',
      padding: '1rem',
      fontWeight: '600'
    }}>
      <p>{subtitle}</p>
    </div>
    {/* <div
      style={{
        display: 'flex',
        alignItems: 'center',
        // padding: '1rem',
        justifyContent: 'center',
        width: '100%',
        padding: '1rem 10% 0rem 10%'
      }}>
      <Button
        style={{
          width: '100%'
        }}
      >
        Open App
      </Button>
    </div> */}
  </div>)
}
