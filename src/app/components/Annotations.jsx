'use client'

import React, { useRef, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'

// Array of annotation data
const ANNOTATIONS = [
  {
    position: [1.5, 1.5, 0],
    content: "1Lorem ipsum dolor sit amet",
    side: "right"
  },
  {
    position: [-2, 1.5, 0],
    content: "2Lorem ipsum dolor",
    side: "left"
  },
  {
    position: [0, 2, 0],
    content: "3dolor sit amet",
    side: "top"
  },
  {
    position: [2.5, 0, 0],
    content: "4Lorem ipsum dolor sit amet",
    side: "right"
  },
  {
    position: [-3, 0, 0],
    content: "5Lorem ipsum dolor",
    side: "left"
  }
];

export default function Annotations() {
  return (
    <>
      {ANNOTATIONS.map((annotation, index) => (
        <Annotation key={index} {...annotation} />
      ))}
    </>
  )
}
function Annotation({ position, content, side = "right" }) {
  const annotationRef = useRef()
  const { camera } = useThree()
  const [opacity, setOpacity] = useState(0)
  const getPositionClass = () => {
    switch(side) {
      case "left": return "right-2";
      case "right": return "left-2";
      case "top": return "bottom-2";
      case "bottom": return "top-2";
      default: return "left-2";
    }
  }

  useEffect(() => {
    // Fade in animation
    const timeout = setTimeout(() => {
      setOpacity(1)
    }, 500 + Math.random() * 2000) // Stagger the appearance
    
    return () => clearTimeout(timeout)
  }, [])

  return (
    <group position={position}>
<Html
  ref={annotationRef}
  as="div"
  distanceFactor={10}
  className="pointer-events-none"
  style={{
    fontSize: '3px',
    transition: 'opacity 0.5s ease-in-out',
    opacity: opacity
  }}
>
  <div className={`annotation-box ${getPositionClass()}`}>
    {content}
  </div>
</Html>
    </group>
  )
}