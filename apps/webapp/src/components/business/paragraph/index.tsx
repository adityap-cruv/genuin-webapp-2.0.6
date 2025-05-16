// filepath: /Users/kunalshah/genuin/genuin-webapp-standalone/apps/webapp/src/components/business/paragraph/index.tsx
import React from 'react'
import style from '../paragraph/paragraph.module.scss'

interface ParagraphComponentProps {
  text: string | undefined
  sizeVariant?: 'small' | 'medium'
  colorVariant?: 'black' | 'white' | 'green' | 'silver'
  fontWeight?: number
}

function ParagraphComponent({ text, sizeVariant = 'medium', colorVariant, fontWeight }: ParagraphComponentProps) {
  const titleClassName = `${style.para} ${style[`${sizeVariant}Para`] || ''} ${
    style[`fontWeight-${fontWeight}`] || ''
  } ${style[`${colorVariant}Para`] || ''}`

  return <p className={titleClassName}>{text}</p>
}

export default ParagraphComponent
