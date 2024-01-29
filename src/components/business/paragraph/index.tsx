import React from 'react'
import style from '../paragraph/paragraph.module.scss'

interface ParagraphComponentProps {
  text: string | undefined
  sizeVariant?: 'small' | 'medium'
  colorVariant?: 'black' | 'white' | 'green' | 'silver'
  fontWeight?: number
}

const ParagraphComponent: React.FC<ParagraphComponentProps> = ({
  text,
  sizeVariant = 'medium',
  colorVariant,
  fontWeight,
}) => {
  const titleClassName = `${style.para} ${style[`${sizeVariant}Para`] || ''} ${
    style[`fontWeight-${fontWeight}`] || ''
  } ${style[`${colorVariant}Para`] || ''}`

  return <p className={titleClassName}>{text}</p>
}

export default ParagraphComponent
