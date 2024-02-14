// components/Button.tsx
import React, { type ReactNode } from 'react'
import style from '../button/button.module.scss'

interface ButtonProps {
  text: string | undefined
  size?: 'small' | 'medium' | 'large' | undefined
  variant?: 'solid' | 'outline' | undefined
  color?: 'black' | 'blue' | undefined
  children?: ReactNode
}

const Button: React.FC<ButtonProps> = ({ text, size = 'small', variant = 'solid', color, children }) => {
  const buttonClassName = `${style.button} ${style[`${color}Button`]} ${style[`${variant}Button`]} ${
    style[`${size}Button`]
  }`
  return <button className={buttonClassName}>{children ?? text}</button>
}

export default Button
