'use client'
import React, { useState, useEffect } from 'react'
import { Button } from '@components/ui/button'
import axios from 'axios'
import { Countries } from '../../../content/countries'
import { FlagIcon, type FlagIconCode } from 'react-flag-kit' // Import Flag from react-flag-kit
import { Dialog, DialogTrigger, DialogContent } from '@components/ui/dialog'
import Image from 'next/image'
import imageAppStore from '@images/appStore.svg'
import imagePlayStore from '@images/playStore.svg'
import Link from 'next/link'
import { URL_TO_APP_STORE, URL_TO_PLAY_STORE } from '@lib/constants'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { useShallow } from 'zustand/react/shallow'
import { getMobileAppUrl, openGeneratedLink } from '@/lib/utils'
import Analytics from '@/services/analytics'

interface FormData {
  phone: string
  email: string
}

const initialFormData: FormData = {
  phone: '',
  email: '',
}

type Props = {
  children: React.ReactNode
}

// TODO: improve it's api implementation
export function DownloadAppDialog({ children }: Props) {
  const { isMobile, links, privacyPolicy, terms } = useGenuinOptions(
    useShallow((state) => ({
      isMobile: state.isMobile,
      links: {
        appStoreLink: state.config?.integrations.sdk.ios.appstore_link,
        playStoreLink: state.config?.integrations.sdk.android.playstore_link,
      },
      privacyPolicy: state.config?.privacy_policy,
      terms: state.config?.terms_and_condition,
    }))
  )

  return isMobile ? (
    <div
      onClick={() => {
        openGeneratedLink(getMobileAppUrl())
      }}>
      {children}
    </div>
  ) : (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="rounded-20px">
        <div className="m-8 w-80 text-center">
          <h3 className="text-new-h3">
            Download <br />
            App
          </h3>
          <p className="m-4 text-new-para-1">
            Send the download link to <br /> your phone & email
          </p>
          <DownloadAppForm />
          <p className="mt-4 text-new-para-2-mobile text-new-dark-grey">
            By clicking Send Link, I acknowledge that I have read the
            <br />{' '}
            <a href={privacyPolicy ?? '/privacy'} className="border-b" target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </a>{' '}
            and agree to the{' '}
            <a href={terms ?? '/terms'} className="border-b" target="_blank" rel="noopener noreferrer">
              Terms of Service
            </a>
          </p>
          <div className="mt-6 flex w-full items-center justify-center">
            <Link href={links.appStoreLink ?? URL_TO_APP_STORE} target="_blank" rel="noopener noreferrer">
              <Image className="mx-2" src={imageAppStore} alt="app store" />
            </Link>
            <Link href={links.playStoreLink ?? URL_TO_PLAY_STORE} target="_blank" rel="noopener noreferrer">
              <Image className="mx-2" src={imagePlayStore} alt="play store" />
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DownloadAppForm() {
  const [formData, setFormData] = useState(initialFormData)
  const [isInvalidNumber, setIsInvalidNumber] = useState(false)
  const [isInvalidEmail, setIsInvalidEmail] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLinkSent, setIsLinkSent] = useState(false)
  const [isError, setIsError] = useState(false)
  // const [selectedCountry, setSelectedCountry] = useState(Countries[0]);
  const [disableSubmit, setDisableSubmit] = useState(true)
  const [selectedCountry, setSelectedCountry] = useState(Countries[0])
  const [isOpen, setIsOpen] = useState(false)
  const searchParams = new URLSearchParams(window.location.search).toString()

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  useEffect(() => {
    if (!formData.email && !formData.phone) {
      setDisableSubmit(true)
    } else {
      setDisableSubmit(false)
    }
  }, [formData])

  const validatePhoneNumber = (input: string) => {
    const phoneRegex = /^[0-9]{9,14}$/
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

  const validateEmail = (input: string) => {
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

  const numberChange = (input: string) => {
    setFormData({ ...formData, phone: input })
  }

  const emailChange = (input: string) => {
    setFormData({ ...formData, email: input })
  }

  const onSendLink = async () => {
    const { phone, email } = formData
    validatePhoneNumber(phone)
    validateEmail(email)

    const payload = {}
    if (formData.phone && !isInvalidNumber) {
      Object.assign(payload, { mobile: selectedCountry.dial_code + phone })
    }
    if (formData.email && !isInvalidEmail) {
      Object.assign(payload, { email })
    }
    if (searchParams.length !== 0) {
      Object.assign(payload, { query_params: '?' + searchParams })
    }

    if (!isInvalidNumber && !isInvalidEmail) {
      setIsLoading(true)

      try {
        const res = await axios.post(process.env.NEXT_PUBLIC_API_URL + '/api/v3/send_download_link', payload)

        if (res.data.code === 200) {
          void Analytics.track({
            eventName: 'Get App Link Sent',
            properties: {
              phone_no: phone ? selectedCountry.dial_code + phone : '',
              email,
            },
          })
          setIsLinkSent(true)
        }
      } catch (e) {
        setIsError(true)
      }

      setIsLoading(false)
    }
  }

  return (
    <div className="flex w-full items-center justify-center">
      <div className="max-w-sm">
        {isError ? (
          <div className="text-red-600 py-2 text-center font-semibold">
            Sorry, we could not send the download link. Please try again later.
          </div>
        ) : (
          <>
            {isLoading ? (
              <div className="text-green-600 py-2 text-center font-semibold">Sending...</div>
            ) : (
              <>
                {isLinkSent ? (
                  <div className="text-green-600 py-2 text-center font-semibold">Download link sent!</div>
                ) : (
                  <>
                    <div className="flex items-center space-x-4">
                      <div className="w-1/4">
                        <div className="relative">
                          <div
                            className="relative w-full cursor-pointer rounded-md border px-2 py-2.5"
                            onClick={toggleDropdown}>
                            <div className="flex items-center justify-around">
                              <FlagIcon code={selectedCountry.code as FlagIconCode} size={26} />
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="12"
                                height="6"
                                viewBox="0 0 6 4"
                                fill="none"
                                className={isOpen ? 'rotate-180 transform transition-transform' : ''}>
                                <path d="M1 1L3 3L5 1" stroke="#16171A" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                          </div>

                          {isOpen && (
                            <ul className="bg-white absolute z-10 mt-2 h-60 w-80 overflow-y-auto rounded-md border bg-new-off-white shadow-lg">
                              {Countries.map((country) => (
                                <li
                                  key={country.code}
                                  className="hover:bg-blue-100 cursor-pointer p-2 text-start"
                                  onClick={() => {
                                    setSelectedCountry(country)
                                    toggleDropdown()
                                  }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'flex-start',
                                  }}>
                                  <FlagIcon code={country.code as FlagIconCode} size={20} /> &nbsp;&nbsp;
                                  {country.name} ({country.dial_code})
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>

                      <div className="w-3/4">
                        <div className="relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            {selectedCountry.dial_code}
                          </div>
                          <input
                            className={`focus:border-blue-500 w-full rounded-md border py-2 pl-14 pr-4 focus:outline-none ${
                              isInvalidNumber ? 'border-red' : 'border-gray'
                            }`}
                            placeholder="Phone number"
                            onChange={(e) => {
                              numberChange(e.target.value)
                            }}
                            onBlur={(e) => {
                              validatePhoneNumber(e.target.value)
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    {isInvalidNumber && (
                      <div className="absolute text-cap-1-demi text-red">Please enter a valid phone number.</div>
                    )}
                    <div className="relative mt-6">
                      <input
                        type="email"
                        className={`focus:border-blue-500 w-full rounded-md border px-4 py-2 focus:outline-none ${
                          isInvalidEmail ? 'border-red' : 'border-gray'
                        }`}
                        placeholder="Email"
                        onChange={(e) => {
                          emailChange(e.target.value)
                        }}
                        onBlur={(e) => {
                          validateEmail(e.target.value)
                        }}
                      />
                    </div>
                    {isInvalidEmail && (
                      <div className="absolute text-cap-1-demi text-red">Please enter a valid email.</div>
                    )}
                    <Button
                      className="mt-6 w-full rounded-md bg-new-off-black px-4 py-2 hover:bg-monochrome-black"
                      onClick={async () => {
                        await onSendLink()
                      }}
                      disabled={disableSubmit}>
                      Send link
                    </Button>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default DownloadAppForm
