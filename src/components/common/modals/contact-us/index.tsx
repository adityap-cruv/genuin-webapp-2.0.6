import React, { useState, useEffect } from 'react'
import { Button } from '@components/ui/button'
import axios from 'axios'
import { Countries } from '../../../../content/countries'
import { FlagIcon, type FlagIconCode } from 'react-flag-kit' // Import Flag from react-flag-kit
import { Dialog, DialogTrigger, DialogContent } from '@components/ui/dialog'
import Link from 'next/link'
import { MOBILE_DOWNLOAD_APP_LINK } from '@lib/constants'
import { useGenuinOptions } from '@lib/stores/genuin-options'

interface FormData {
  phone: string
  email: string
  name: string
  companyName: string
  companyUrl: string
}

const initialFormData: FormData = {
  phone: '',
  email: '',
  name: '',
  companyName: '',
  companyUrl: '',
}

type Props = {
  children: React.ReactNode
}

// TODO: api implementation
export function ContactUs({ children }: Props) {
  const isMobile = useGenuinOptions().isMobile

  return isMobile ? (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent isMobile={isMobile} className="rounded-20px">
        <div className="hide-scrollbar m-4 max-h-[70vh] gap-12 overflow-auto p-2">
          <div>
            <h3 className="text-new-h2-mobile">Get in touch with an expert. Talk with sales.</h3>
            <p className="my-4 text-new-sm">Enter your details and a member of our team will contact you shortly.</p>
          </div>
          <div>
            <DownloadAppForm />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  ) : (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="rounded-20px min-w-fit">
        <div className="m-8 flex justify-around gap-12 sm:w-[600px] md:w-[800px]">
          <div className="w-1/2">
            <h3 className="text-new-h3">Get in touch with an expert. Talk with sales.</h3>
            <p className="my-4 text-new-para-1">
              Enter your details and a member of our team will contact you shortly.
            </p>
          </div>
          <div>
            <DownloadAppForm />
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

  const nameChange = (input: string) => {
    setFormData({ ...formData, name: input })
  }

  const companyNameChange = (input: string) => {
    setFormData({ ...formData, companyName: input })
  }

  const companyUrlChange = (input: string) => {
    setFormData({ ...formData, companyUrl: input })
  }

  //   const onSendLink = async () => {
  //     const { phone, email } = formData
  //     validatePhoneNumber(phone)
  //     validateEmail(email)

  //     const payload = {}
  //     if (formData.phone && !isInvalidNumber) {
  //       Object.assign(payload, { mobile: selectedCountry.dial_code + phone })
  //     }
  //     if (formData.email && !isInvalidEmail) {
  //       Object.assign(payload, { email })
  //     }

  //     if (!isInvalidNumber && !isInvalidEmail) {
  //       setIsLoading(true)

  //       try {
  //         const res = await axios.post(process.env.NEXT_PUBLIC_API_URL + '/api/v3/public/send_download_link', payload)

  //         if (res.data.code === 200) {
  //           setIsLinkSent(true)
  //         }
  //       } catch (e) {
  //         setIsError(true)
  //       }

  //       setIsLoading(false)
  //     }
  //   }

  return (
    <div className="flex w-full items-center justify-center">
      <div className="max-w-sm">
        <>
          <div className="relative mb-4">
            <input
              type="text"
              className={`focus:border-blue-500 'border-gray' w-full rounded-md border px-4 py-2 focus:outline-none`}
              placeholder="Full Name"
              onChange={(e) => {
                nameChange(e.target.value)
              }}
            />
          </div>

          <div className="relative">
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
          {isInvalidEmail && <div className="absolute text-cap-1-demi text-red">Please enter a valid email.</div>}
          <div className="mt-4 flex items-center space-x-4">
            <div className="w-1/4">
              <div className="relative">
                <div className="relative w-full cursor-pointer rounded-md border px-2 py-2.5" onClick={toggleDropdown}>
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

          <div className="relative my-4">
            <input
              type="text"
              className={`focus:border-blue-500 'border-gray' w-full rounded-md border px-4 py-2 focus:outline-none`}
              placeholder="Name of Company"
              onChange={(e) => {
                companyNameChange(e.target.value)
              }}
            />
          </div>

          <div className="relative">
            <input
              type="text"
              className={`focus:border-blue-500 'border-gray' w-full rounded-md border px-4 py-2 focus:outline-none`}
              placeholder="Website URL"
              onChange={(e) => {
                companyUrlChange(e.target.value)
              }}
            />
          </div>

          <Button
            className="mt-6 w-full rounded-md bg-new-off-black px-4 py-2 hover:bg-monochrome-black"
            onClick={() => {
              setFormData({
                phone: '',
                email: '',
                name: '',
                companyName: '',
                companyUrl: '',
              })
            }}
            // disabled={disableSubmit}
          >
            Submit
          </Button>
          <p className="mt-2 text-center text-new-para-2-mobile text-new-dark-grey">
            By submitting this form, you agree to receive promotional messages from Genuin about its products and
            services. You can unsubscribe at any time by clicking on the link at the bottom of our emails.
          </p>
        </>
      </div>
    </div>
  )
}

export default DownloadAppForm
