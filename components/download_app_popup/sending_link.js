import React from 'react'
import { GenuinLoader } from '../basic/genuin_loader'
import { BasicColors } from '../../constants/colors'

export const SendingLink = ({
  text
}) => {
  return (<>
    <div
      style={{
        display: 'flex',
        height: '100%',
        justifyContent: 'center',
        fontWeight: '700',
        fontSize: '700',
        lineHeight: '32px',
        color: BasicColors.secondaryColor,
        paddingTop: '2%',
        paddingBottom: '2%'
      }}
    >
      <div
        style={{
          paddingRight: '10px'
        }}>
        <GenuinLoader
          size='sm'
          thickness='3px'
          color={BasicColors.secondaryColor}
        />
      </div>
      {text}
    </div>
  </>)
}
