'use client'

import { useEffect, useState, useRef } from 'react'
import gsap from 'gsap'

export default function Loader({ progress = 0, isLoading = true }) {
  const loaderRef = useRef(null)
  const progressRef = useRef(null)
  const [displayProgress, setDisplayProgress] = useState(0)

  // Update the display progress smoothly
  useEffect(() => {
    if (progressRef.current) {
      gsap.to(progressRef.current, {
        strokeDashoffset: 283 - (283 * progress) / 100,
        duration: 0.8,
        ease: "power2.out"
      })
    }
    
    setDisplayProgress(Math.floor(progress))
  }, [progress])

  // Fade out animation when loading is complete
  useEffect(() => {
    if (!isLoading && loaderRef.current) {
      gsap.to(loaderRef.current, {
        opacity: 0,
        duration: 0.8,
        ease: "power2.inOut",
        onComplete: () => {
          if (loaderRef.current) {
            loaderRef.current.style.display = 'none'
          }
        }
      })
    }
  }, [isLoading])

  return (
    <div 
      ref={loaderRef}
      className="fixed inset-0 flex items-center justify-center bg-black z-50"
      style={{
        backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
        backgroundSize: '80px 80px'
      }}
    >
      <div className="relative flex flex-col items-center justify-center">
        {/* SVG Circle with glowing progress indicator */}
        <svg className="w-50 h-50" viewBox="0 0 100 100">
          {/* Background Circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#444444"
            strokeWidth="3"
          />
          
          {/* Progress Circle with Gradient and Glow */}
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff4a00" />
              <stop offset="100%" stopColor="#ffae00" />
            </linearGradient>
            
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          
          {/* Progress Circle */}
          <circle
            ref={progressRef}
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="283"
            strokeDashoffset="283"
            transform="rotate(-90 50 50)"
            filter="url(#glow)"
          />
          
          {/* Glowing Dot at Progress Position */}
          {/* <circle
            cx="50"
            cy="5"
            r="4"
            fill="#ffae00"
            transform={`rotate(${(progress * 3.6)} 50 50)`}
            filter="url(#glow)"
          /> */}
        </svg>
        
        {/* Logo and Percentage */}
        <div className="absolute flex flex-col items-center">
          {/* Logo - replace with your own */}
          <img src="/icon.svg" alt="Logo" className="h-10 w-auto" />
          
          {/* Percentage Text */}
          <span className="text-gray-400 text-sm mt-1">{displayProgress}%</span>
        </div>
      </div>
    </div>
  )
}