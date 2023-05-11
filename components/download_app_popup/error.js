import React from 'react'
import { BasicColors } from '../../constants/colors'
import { FontStyle } from '../../constants/font_style'

export const Error = ({
  text
}) => {
  return <>
    <div
      style={{
        textAlign: 'center',
        fontSize: FontStyle.title.fontSize,
        lineHeight: FontStyle.title.lineHeight,
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
