'use client'

import { useEffect, useState } from 'react'
import './TypingText.css'

export default function TypingText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState('')
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayed((prev) => prev + text.charAt(index))
        setIndex((i) => i + 1)
      }, 15)
      return () => clearTimeout(timeout)
    }
  }, [index, text])

  return (
    <span className="typing-container">
      {displayed}
      <span className="typing-caret" />
    </span>
  )
}
