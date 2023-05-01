import React from 'react'
import { BasicColors } from '../../constants/colors'

export const Error = ({
  text
}) => {
  return <>
    <div
      style={{
        textAlign: 'center',
        fontSize: '17px',
        lineHeight: '24px',
        fontWeight: '600',
        color: BasicColors.errorColor,
        paddingTop: '2%',
        paddingBottom: '2%'
      }}
    >
      {text}
    </div>
  </>
}
