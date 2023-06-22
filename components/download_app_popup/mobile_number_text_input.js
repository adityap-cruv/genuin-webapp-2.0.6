import React, { useEffect } from 'react'
import { FormControl, FormErrorMessage, Input, InputLeftAddon, InputGroup, InputLeftElement } from '@chakra-ui/react'
import { TextInputColors } from '../../constants/colors'
import { FlagsDropdown } from './flags_dropdown'
import { FontStyle } from '../../constants/font_style'

export const MobileNumberTextInput = ({
  placeHolder,
  type,
  errorText,
  isInvalid,
  onFocusOut,
  uniqueKey,
  onChange,
  setDialcode,
  dialCode
}) => {
  useEffect(() => {
    const handleFocusOut = (event) => {
      onFocusOut(event.target.value)
    }
    const input = document.getElementById(uniqueKey)
    input.addEventListener('focusout', handleFocusOut)
    return () => {
      input.removeEventListener('focusout', handleFocusOut)
    }
  }, [])

  return (
    <FormControl
      id={uniqueKey}
      style={{
        paddingTop: '16px'
      }}
      isInvalid={isInvalid}
    >
      <InputGroup style={{
        zIndex: 1
      }}>
        <InputLeftAddon
          marginRight="12px"
          backgroundColor={TextInputColors.textInputBackgroundColor}
          borderRadius='5px !important'
          maxW='15%'
          padding='0'
        >
          <FlagsDropdown
            setValue={setDialcode}
          />
        </InputLeftAddon>
        <InputGroup>
          <InputLeftElement
            fontSize={FontStyle.title.fontSize}
            fontWeight='600'
            lineHeight={FontStyle.title.lineHeight}
            width='17%'
          >
            {dialCode}
          </InputLeftElement>
          <Input
            onChange={onChange}
            paddingLeft='16%'
            placeholder={placeHolder}
            _placeholder={{
              color: TextInputColors.placeHolderFontColor
            }}
            borderColor={`${isInvalid ? TextInputColors.errorColor : TextInputColors.focusBorderColor} !important`}
            boxShadow={`0 0 0 1px ${isInvalid ? TextInputColors.errorColor : TextInputColors.focusBorderColor} !important`}
            backgroundColor={TextInputColors.textInputBackgroundColor}
            fontSize={FontStyle.title.fontSize}
            fontWeight='600'
            lineHeight={FontStyle.title.lineHeight}
            borderRadius='5px !important'
            type={type}
          />
        </InputGroup>
      </InputGroup>
      {isInvalid && <FormErrorMessage
        fontSize='12px'
        lineHeight='16px'
        fontWeight={600}
        color={TextInputColors.errorColor}
      >
        {errorText}
      </FormErrorMessage>}
    </FormControl>)
}
