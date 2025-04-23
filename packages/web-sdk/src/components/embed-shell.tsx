import React, { ComponentProps } from 'react'

type EmbedShellPropsType = ComponentProps<'div'> & {
  Header?: React.FC
  Footer?: React.FC
}

export function EmbedShell({
  style,
  className,
  children,
  Header,
  Footer,
  ...restProps
}: EmbedShellPropsType) {
  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
      className={`embed-shell ${className ? className : ''}`}
      {...restProps}>
      {Header && (
        <div
          style={{
            width: '100%',
            boxSizing: 'border-box',
          }}>
          <Header />
        </div>
      )}
      {children}
      {Footer && <Footer />}
    </div>
  )
}
