import React from 'react'

export const LinkSent = ({
  text
}) => {
  return (<div
    style={{
      display: 'flex',
      justifyContent: 'center',
      fontWeight: '700',
      fontSize: '20px',
      lineHeight: '32px',
      textAlign: 'center',
      paddingTop: '2%',
      paddingBottom: '2%'
    }}
  >
    {text}
  </div>)
}
