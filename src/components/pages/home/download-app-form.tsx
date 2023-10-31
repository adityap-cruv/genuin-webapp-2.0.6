import React, { useState, useEffect } from 'react';
import { Button } from '@components/ui/button';
import axios from 'axios';
import { Countries } from './countries';
import { FlagIcon, FlagIconCode } from 'react-flag-kit'; // Import Flag from react-flag-kit

interface FormData {
  phone: string;
  email: string;
}

const initialFormData: FormData = {
  phone: '',
  email: '',
};

export function DownloadAppForm() {
  const [formData, setFormData] = useState(initialFormData);
  const [isInvalidNumber, setIsInvalidNumber] = useState(false);
  const [isInvalidEmail, setIsInvalidEmail] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLinkSent, setIsLinkSent] = useState(false);
  const [isError, setIsError] = useState(false);
  // const [selectedCountry, setSelectedCountry] = useState(Countries[0]);
  const [disableSubmit, setDisableSubmit] = useState(true)

  const [selectedCountry, setSelectedCountry] = useState(Countries[0]);
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };


  useEffect(() => {
    if (!formData.email && !formData.phone) {
      setDisableSubmit(true)
    } else {
      setDisableSubmit(false)
    }
  }, [formData])

  const validatePhoneNumber = (input: string) => {
    const phoneRegex = /^[0-9]{9,14}$/;
    if (input) {
      if (phoneRegex.test(input)) {
        setIsInvalidNumber(false);
      } else {
        setIsInvalidNumber(true);
      }
    } else {
      setIsInvalidNumber(false);
    }
  };

  const validateEmail = (input: string) => {
    const emailRegex = /^[\w.-]+@[a-zA-Z_-]+?(?:\.[a-zA-Z]{2,6})+$/;
    if (input) {
      if (emailRegex.test(input)) {
        setIsInvalidEmail(false);
      } else {
        setIsInvalidEmail(true);
      }
    } else {
      setIsInvalidEmail(false);
    }
  };

  const numberChange = (input: string) => {
    setFormData({ ...formData, phone: input });
  };

  const emailChange = (input: string) => {
    setFormData({ ...formData, email: input });
  };

  const onSendLink = async () => {
    const { phone, email } = formData;
    validatePhoneNumber(phone);
    validateEmail(email);

    const payload = {}
    if (formData.phone && !isInvalidNumber) {
      Object.assign(payload, { mobile: selectedCountry.dial_code + phone })
    }
    if (formData.email && !isInvalidEmail) {
      Object.assign(payload, { email })
    }

    if (!isInvalidNumber && !isInvalidEmail) {
      setIsLoading(true);

      try {
        const res = await axios.post(process.env.NEXT_PUBLIC_API_URL + '/api/v3/public/send_download_link', payload);

        if (res.data.code === 200) {
          setIsLinkSent(true);
        }
      } catch (e) {
        console.error(e);
        setIsError(true);
      }

      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex justify-center items-center">
      <div className="max-w-sm">
        {isError ? (
          <div className="text-center text-red-600 font-semibold py-2">
            Sorry, we could not send the download link. Please try again later.
          </div>
        ) : (
          <>
            {isLoading ? (
              <div className="text-center text-green-600 font-semibold py-2">
                Sending...
              </div>
            ) : (
              <>
                {isLinkSent ? (
                  <div className="text-center text-green-600 font-semibold py-2">
                    Download link sent!
                  </div>
                ) : (
                  <>
                    <div className="flex items-center space-x-4">

                      <div className="w-1/4">
                        <div className="relative">
                          <div
                            className="w-full py-2.5 px-4 border rounded-md cursor-pointer"
                            onClick={toggleDropdown}
                          >
                            <div className='items-center' 
                            style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}>
                              <FlagIcon code={selectedCountry.code as FlagIconCode} size={26} />
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
                            className={`w-full pl-16 pr-4 py-2 border rounded-md focus:outline-none focus:border-blue-500 ${isInvalidNumber ? 'border-red' : 'border-gray'
                              }`}
                            placeholder="Phone number"
                            onChange={(e) => numberChange(e.target.value)}
                            onBlur={(e) => validatePhoneNumber(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                    {isInvalidNumber && (
                      <div className="text-red mt-2">
                        Please enter a valid phone number.
                      </div>
                    )}
                    <div className="relative mt-4">
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
                      <div className="text-red mt-2">
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
  );
}

export default DownloadAppForm;
