import React, { useState, useEffect } from 'react'
import { TextInput } from './text_input'
import { Button } from 'react-bootstrap'
import { Link, Text } from '@chakra-ui/react'
import { BasicColors, TextInputColors } from '../../constants/colors'
import { MobileNumberTextInput } from './mobile_number_text_input'
import Axios from 'axios'
import { Countries } from '../../constants/countries'
import { Error } from './error'
import { SendingLink } from './sending_link'
import { LinkSent } from './link_sent'

export const DownloadAppForm = () => {
  const [isInvalidNumber, setIsInvalidNumber] = useState(false)
  const [isInvalidEmail, setIsInvalidEmail] = useState(false)
  const [email, setEmail] = useState(null)
  const [{ dialCode, mobile }, setMobileNumber] = useState({ dialCode: Countries[0].dial_code, mobile: null })
  const [isLoading, setIsLoading] = useState(false)
  const [isLinkSent, setIsLinkSent] = useState(false)
  const [isError, setIsError] = useState(false)
  const [disableSubmit, setDisableSubmit] = useState(true)
  const _hover = {
    color: `${BasicColors.primaryColor} !important`
  }

  useEffect(() => {
    if (!email && !mobile) {
      setDisableSubmit(true)
    } else {
      setDisableSubmit(false)
    }
  }, [mobile, email])

  const validatePhoneNumber = (input) => {
    const phoneRegex = /^\d{9,14}$/
    if (input) {
      if (phoneRegex.test(input)) {
        setIsInvalidNumber(false)
      } else {
        setIsInvalidNumber(true)
      }
    } else {
      setIsInvalidNumber(false)
    }
  }

  const validateEmail = (input) => {
    const emailRegex = /^[\w.-]+@[a-zA-Z_-]+?(?:\.[a-zA-Z]{2,6})+$/
    if (input) {
      if (emailRegex.test(input)) {
        setIsInvalidEmail(false)
      } else {
        setIsInvalidEmail(true)
      }
    } else {
      setIsInvalidEmail(false)
    }
  }

  const numberChange = (input, dialCode) => {
    setMobileNumber({ dialCode, mobile: input })
  }

  const emailChange = (input) => {
    setEmail(input)
  }

  const validate = () => {
    validateEmail(email)
    validatePhoneNumber(mobile)
  }

  const onSendLink = async () => {
    validate()
    const payload = {}
    if (mobile && !isInvalidNumber) {
      Object.assign(payload, { mobile: dialCode + mobile })
    }
    if (email && !isInvalidEmail) {
      Object.assign(payload, { email })
    }
    if (payload.email || payload.mobile) {
      setIsLoading(true)
      try {
        const res = await Axios.post(`${process.env.apiurl}/api/v3/public/send_download_link`, payload)
        if (res.data.code === 200) {
          setIsLinkSent(true)
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log(e)
        setIsError(true)
      }
      setIsLoading(false)
    } else {
      validate()
    }
  }

  return (
    <div style={{
      height: '100%',
      width: '100%'
    }}>
      {isError
        ? <Error text='Oops! Something went wrong..'/>
        : <>
          {isLoading
            ? <SendingLink text='Sending...'/>
            : <>{
              isLinkSent
                ? <LinkSent text='Download link sent!' />
                : <>
                  <MobileNumberTextInput
                    onChange={numberChange}
                    uniqueKey='mobile-number-input-in-get-app'
                    placeHolder='Phone number'
                    type='number'
                    errorText='Please enter a valid phone number.'
                    isInvalid={isInvalidNumber}
                    onFocusOut={validatePhoneNumber}
                  />
                  <TextInput
                    onChange={emailChange}
                    uniqueKey='email-input-in-get-app'
                    placeHolder='Email'
                    isInvalid={isInvalidEmail}
                    type='email'
                    errorText='Please enter a valid email.'
                    onFocusOut={validateEmail}
                  />
                  <Button
                    style={{
                      width: '100%',
                      fontSize: '17px',
                      fontWeight: '700',
                      lineHeight: '24px',
                      marginTop: '10%',
                      paddingTop: '12px',
                      paddingBottom: '12px',
                      borderRadius: '5px'
                    }}
                    variant='primary'
                    disabled={disableSubmit}
                    onClick={onSendLink}
                  >Send link</Button>
                </>} </>}
        </>}

      <Text
        textAlign='center'
        lineHeight='16px'
        fontSize='12px'
        fontWeight={600}
        color={TextInputColors.placeHolderFontColor}
        paddingTop='16px'
      >
        By clicking Send Link, I acknowledge that I have read the<br />
        <Link
          color={BasicColors.primaryColor}
          _hover={_hover}
          target="_blank" href='/privacy'
        >Privacy Policy</Link>
        &nbsp;and agree to the
        <Link
          color={BasicColors.primaryColor}
          _hover={_hover}
          target="_blank" href='/terms'
        > Terms of Service </Link>
      </Text>
    </div>
  )
}
