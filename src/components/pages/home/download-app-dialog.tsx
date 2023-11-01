import React, { useState, useEffect } from 'react'
import { Button } from '@components/ui/button'
import axios from 'axios'
import { Countries } from './countries'
import { FlagIcon, FlagIconCode } from 'react-flag-kit' // Import Flag from react-flag-kit
import { Dialog, DialogTrigger, DialogContent } from '@components/ui/dialog'
import Image from 'next/image'
import imageAppStore from '@images/appStore.svg'
import imagePlayStore from '@images/playStore.svg'

interface FormData {
  phone: string
  email: string
}

const initialFormData: FormData = {
  phone: '',
  email: '',
}

interface Props {
  children: React.ReactNode
}

// todo improve it's api implementation
// todo change it adapt to mobile/desktop versions
export function DownloadAppDialog({ children }: Props) {
  const URL_TO_APP_STORE = 'https://apps.apple.com/US/app/id1511177838?mt=8'
  const URL_TO_PLAY_STORE = 'https://play.google.com/store/apps/details?id=com.begenuin.begenuin'
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
    <DialogContent className='rounded-20px'>
      <div className="m-8 text-center w-80">
        <h3 className="text-new-h3">Download <br />Genuin</h3>
        <p className="text-new-para-1 m-4">Send the download link to <br /> your phone & email</p>
        <DownloadAppForm />
        <p className="text-new-para-2-mobile mt-4 text-new-dark-grey">By clicking Send Link, I acknowledge that I have read the<br /> <a href='/privacy' className='border-b'>Privacy Policy</a> and agree to the <a href='/terms' className='border-b'>Terms of Service</a></p>
        <div className="mt-6 flex">
          <a href={URL_TO_APP_STORE} target="_blank" rel="noopener noreferrer">
            <Image className="mx-2" src={imageAppStore} alt="app store" />
          </a>
          <a href={URL_TO_PLAY_STORE} target="_blank" rel="noopener noreferrer">
            <Image className="mx-2" src={imagePlayStore} alt="play store" />
          </a>
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

    if (!isInvalidNumber && !isInvalidEmail) {
      setIsLoading(true)

      try {
        const res = await axios.post(process.env.NEXT_PUBLIC_API_URL + '/api/v3/public/send_download_link', payload)

        if (res.data.code === 200) {
          setIsLinkSent(true)
        }
      } catch (e) {
        console.error(e)
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
                            className="w-full py-2.5 px-2 border rounded-md cursor-pointer relative"
                            onClick={toggleDropdown}
                          >
                            <div className="items-center flex justify-around">
                              <FlagIcon code={selectedCountry.code as FlagIconCode} size={26} />
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="6" viewBox="0 0 6 4" fill="none" className={isOpen ? 'transform rotate-180 transition-transform': ''}>
                              <path d="M1 1L3 3L5 1" stroke="#16171A" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                            </div>
                          </div>

                          {isOpen && (
                            <ul className="absolute overflow-y-auto w-80 bg-new-off-white h-60 z-10 mt-2 bg-white border rounded-md shadow-lg">
                              {Countries.map((country) => (
                                <li
                                  key={country.code}
                                  className="cursor-pointer p-2 hover:bg-blue-100 text-start"
                                  onClick={() => {
                                    setSelectedCountry(country);
                                    toggleDropdown();
                                  }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'flex-start',
                                  }}
                                >
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
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            {selectedCountry.dial_code}
                          </div>
                          <input
                            className={`w-full pl-14 pr-4 py-2 border rounded-md focus:outline-none focus:border-blue-500 ${isInvalidNumber ? 'border-red' : 'border-gray'
                              }`}
                            placeholder="Phone number"
                            onChange={(e) => numberChange(e.target.value)}
                            onBlur={(e) => validatePhoneNumber(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                    {isInvalidNumber && (
                      <div className="text-red text-cap-lg absolute">
                        Please enter a valid phone number.
                      </div>
                    )}
                    <div className="relative mt-6">
                      <input
                        type="email"
                        className={`w-full py-2 px-4 border rounded-md focus:outline-none focus:border-blue-500 ${isInvalidEmail ? 'border-red' : 'border-gray'
                          }`}
                        placeholder="Email"
                        onChange={(e) => emailChange(e.target.value)}
                        onBlur={(e) => validateEmail(e.target.value)}
                      />
                    </div>
                    {isInvalidEmail && (
                      <div className="text-red text-cap-lg absolute">
                        Please enter a valid email.
                      </div>
                    )}
                    <Button
                      className="mt-6 w-full hover:bg-monochrome-black bg-new-off-black rounded-md py-2 px-4"
                      onClick={onSendLink}
                      disabled={disableSubmit}
                    >
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
