import React from 'react'
export const Layout = ({ children, className }) => (
  <div className={`layout ${className ?? ''}`}>{children}</div>
)
