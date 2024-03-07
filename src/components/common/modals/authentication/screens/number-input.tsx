import { PhoneInput } from '@components/ui/phone-input'
import { useState } from 'react'

export function NumberInput() {
  const [countryCode, setCountryCode] = useState('+1')
  return (
    <PhoneInput
      value={countryCode}
      international
      onChange={(value) => {
        setCountryCode(value)
      }}
    />
  )
}
