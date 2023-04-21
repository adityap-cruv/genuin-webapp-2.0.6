import React, { useEffect } from 'react'
import { FormControl, FormErrorMessage, Input } from '@chakra-ui/react'
import { TextInputColors } from '../../constants/colors'

export const TextInput = ({
  placeHolder,
  type,
  errorText,
  isInvalid,
  onFocusOut,
  uniqueKey,
  onChange
}) => {
  useEffect(() => {
    const handleFocusOut = (event) => {
      onFocusOut(event.target.value)
    }
    const input = document.getElementById(uniqueKey)
    input.addEventListener('focusout', handleFocusOut)
    return () => {
      return input.removeEventListener('focusout', handleFocusOut)
    }
  }, [])
  return (
    <FormControl
      style={{
        paddingTop: '16px'
      }}
      isInvalid={isInvalid}
      id={uniqueKey}
    >
      <Input
        onChange={(event) => { onChange(event.target.value) }}
        isInvalid={isInvalid}
        placeholder={placeHolder}
        _placeholder={{
          color: TextInputColors.placeHolderFontColor
        }}
        backgroundColor={TextInputColors.textInputBackgroundColor}
        borderColor={`${isInvalid ? TextInputColors.errorColor : TextInputColors.focusBorderColor} !important`}
        boxShadow={`0 0 0 1px ${isInvalid ? TextInputColors.errorColor : TextInputColors.focusBorderColor} !important`}
        fontSize='17px'
        fontWeight='600'
        lineHeight='24px'
        borderRadius='5px !important'
        type={type}
      />
      {isInvalid && <FormErrorMessage
        fontSize='12px'
        lineHeight='16px'
        fontWeight={600}
      >
        {errorText}
      </FormErrorMessage>}
    </FormControl>)
}
