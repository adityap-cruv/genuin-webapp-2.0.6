import React, { useState } from 'react'
import { Countries } from '../../constants/countries'
import { TextInputColors } from '../../constants/colors'
import { FlagIcon } from 'react-flag-kit'
import { Dropdown } from 'react-bootstrap'
export const FlagsDropdown = ({
  setValue = () => {}
}) => {
  const [flagCode, setFlagCode] = useState(Countries[0].code)
  return (
    <>
      <Dropdown
        height='200px'>
        <Dropdown.Toggle
          style={{
            backgroundColor: TextInputColors.textInputBackgroundColor,
            width: '100%',
            borderColor: TextInputColors.focusBorderColor,
            color: 'black',
            display: 'flex',
            alignItems: 'center'
          }}
        ><div>
            <FlagIcon code={flagCode} size={20} />
          </div>
        </Dropdown.Toggle>
        <Dropdown.Menu
          style={{
            height: '30vh',
            overflowY: 'scroll',
            overflowX: 'clip'
          }}>
          {Countries.map((country, id) => {
            return (
              <Dropdown.Item
                key={id}
                onClick={() => {
                  setValue(country.dial_code)
                  setFlagCode(country.code)
                }}
              >
                <div
                  style={{
                    display: 'flex'
                  }}>
                  <FlagIcon code={country.code} size={35} style={{
                    paddingRight: '10px'
                  }}/>
                  <div>
                    {country.name} ({country.dial_code})
                  </div>
                </div>
              </Dropdown.Item>)
          })}
        </Dropdown.Menu>
      </Dropdown>
    </>
  )
}
