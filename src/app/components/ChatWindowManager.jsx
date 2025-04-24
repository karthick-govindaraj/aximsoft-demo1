'use client'

import { useState, useEffect } from 'react'
import ChatWindow from './ChatWindow'

export default function ChatWindowManager() {
  const [showChat, setShowChat] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // Open chat on any window click
  useEffect(() => {
    const handleGlobalClick = () => {
      if (!showChat) {
        setShowChat(true)
        setTimeout(() => setIsVisible(true), 20) // Delay to trigger transition
      }
    }

    window.addEventListener('click', handleGlobalClick)
    return () => window.removeEventListener('click', handleGlobalClick)
  }, [showChat])

  // Close chat
  const handleClose = (e) => {
    e.stopPropagation()
    setIsVisible(false)
    setTimeout(() => setShowChat(false), 300) // match with transition duration
  }

  return (
    <>
      {showChat && (
        <div
          className={`fixed inset-0 z-50 transition-opacity duration-500 chat-window${
            isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <ChatWindow onClose={handleClose} isVisible={isVisible}/>
        </div>
      )}
    </>
  )
}
