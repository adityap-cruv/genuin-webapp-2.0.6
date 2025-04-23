'use client'
import React, { useState, type ChangeEvent } from 'react'
import styles from './InlineButtonInput.module.scss'

interface InlineButtonInputProps {
  onButtonClick: (value: string) => void
}

const InlineButtonInput: React.FC<InlineButtonInputProps> = ({ onButtonClick }) => {
  const [inputValue, setInputValue] = useState<string>('')

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleButtonClick = () => {
    onButtonClick(inputValue)
    setInputValue('')
  }

  return (
    <div className={styles.inlineInputContainer}>
      <input
        type="text"
        placeholder="Your Email"
        value={inputValue}
        onChange={handleInputChange}
        className={styles.inputField}
      />
      <button onClick={handleButtonClick} className={styles.button}>
        Get Started
      </button>
    </div>
  )
}

export default InlineButtonInput
