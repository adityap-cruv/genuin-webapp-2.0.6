import React from 'react'
import style from '../heading/heading.module.scss'

interface HeadingComponentProps {
  headingLevel?: number
  title: string | undefined
  colorVariant?: 'black' | 'white'
}

const HeadingComponent: React.FC<HeadingComponentProps> = ({ headingLevel = 1, title, colorVariant = 'black' }) => {
  const HeadingTag = `h${headingLevel}` as keyof JSX.IntrinsicElements

  const titleClassName = `${style.title} ${style[`${HeadingTag}Title`] || ''} ${style[`${colorVariant}Title`] || ''}`

  return <HeadingTag className={titleClassName}>{title}</HeadingTag>
}

export default HeadingComponent
