'use client'

import React from 'react'
import { ArrowIcon } from './arrow-icon'

export default function CustomButton({
  variant = 'light',
  className,
  onClick,
  showIcon = false,
  children,
  radius,
}: {
  variant: 'light' | 'blue' | 'custom'
  className?: string
  onClick?: () => void
  showIcon?: boolean
  children: string | React.ReactNode
  radius?: string
}) {
  const buttonClasses = `
    group flex justify-center items-center relative px-4 py-2 overflow-hidden rounded-3xl 
    ${className} ${radius}
  `

  let buttonVariant

  switch (variant) {
    case 'light':
      buttonVariant = (
        <button onClick={onClick} className={buttonClasses}>
          <div
            className={`absolute inset-0 -left-full w-full bg-[#0000001A] transition-all duration-300 ease-out group-hover:left-0 group-hover:right-0 ${radius}`}></div>
          <div
            className={`bg-white absolute inset-0 -left-full w-full transition-all duration-700 ease-out group-hover:left-0 group-hover:right-0 ${radius}`}></div>
          <span
            className={`text-white relative flex items-center gap-3 transition-colors duration-300 group-hover:text-blue`}>
            {children}
            {showIcon && <ArrowIcon className="fill-white transition-colors group-hover:fill-blue" />}
          </span>
        </button>
      )
      break

    case 'blue':
      buttonVariant = (
        <button onClick={onClick} className={`${buttonClasses} bg-blue shadow`}>
          <div
            className={`absolute inset-0 -left-full w-full bg-blue-50 transition-all duration-300 ease-out group-hover:left-0 group-hover:right-0 ${radius}`}></div>
          <div
            className={`bg-blue-600 absolute inset-0 -left-full w-full transition-all duration-700 ease-out group-hover:left-0 group-hover:right-0 ${radius}`}></div>
          <span className={`text-white relative flex items-center gap-3 transition-colors duration-300`}>
            {children}
            {showIcon && <ArrowIcon className="fill-white" />}
          </span>
        </button>
      )
      break

    case 'custom':
      buttonVariant = (
        <button onClick={onClick} className={buttonClasses}>
          <div
            className={`absolute inset-0 -left-full w-full bg-[#0000001A] transition-all duration-300 ease-out group-hover:left-0 group-hover:right-0 ${radius}`}></div>
          <div
            className={`bg-white absolute inset-0 -left-full w-full transition-all duration-700 ease-out group-hover:left-0 group-hover:right-0 ${radius}`}></div>
          <span
            className={`text-black relative flex items-center gap-3 transition-colors duration-300 group-hover:text-blue`}>
            {children}
            {showIcon && <ArrowIcon className="fill-black transition-colors group-hover:fill-blue" />}
          </span>
        </button>
      )
      break

    default:
      buttonVariant = null // Fallback case, could throw an error or render nothing
      break
  }

  return buttonVariant
}
