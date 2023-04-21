import React from 'react'
import { Spinner } from '@chakra-ui/react'
import { BasicColors } from '../../constants/colors'

export const GenuinLoader = ({
  height = '100%',
  size = 'lg',
  thickness = '4px',
  color = BasicColors.primaryColor
}) => {
  return (<>
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height
      }}>
      <Spinner
        thickness={thickness}
        speed='1s'
        emptyColor='white'
        color={color}
        size={size} />
    </div>
  </>)
}
