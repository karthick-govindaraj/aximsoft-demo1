import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'

export default function VideoBackground() {
  const meshRef = useRef()
  const [videoTexture, setVideoTexture] = useState(null)
  const [videoDimensions, setVideoDimensions] = useState({ width: 16, height: 9 }) // Default aspect ratio
  const { viewport } = useThree()

  useEffect(() => {
    const video = document.createElement('video')
    video.src = '/aximsoft.mp4'
    video.crossOrigin = 'anonymous'
    video.loop = true
    video.muted = true
    video.playsInline = true
    video.autoplay = true
    
    // Handle video metadata loading to get actual dimensions
    video.addEventListener('loadedmetadata', () => {
      setVideoDimensions({
        width: video.videoWidth,
        height: video.videoHeight
      })
    })
    
    video.play().catch(error => {
      console.error("Video play failed:", error)
    })

    const texture = new THREE.VideoTexture(video)
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.format = THREE.RGBAFormat // Using RGBAFormat for better compatibility
    
    setVideoTexture(texture)
    
    return () => {
      video.pause()
      video.src = ''
      texture.dispose()
    }
  }, [])

  const calculateDimensions = () => {
    if (!videoDimensions) return [20, 10]
    
    const videoAspect = videoDimensions.width / videoDimensions.height
    const viewportAspect = viewport.width / viewport.height
    
    // Cover the entire viewport while maintaining aspect ratio
    let width, height
    
    // Use a scaling factor to ensure video is appropriately sized
    const scaleFactor = 1.05 // Slightly larger than 1 to ensure coverage
    
    if (videoAspect > viewportAspect) {
      // Video is wider than viewport
      height = viewport.height * scaleFactor
      width = height * videoAspect
    } else {
      // Video is taller than viewport
      width = viewport.width * scaleFactor
      height = width / videoAspect
    }
    
    return [width, height]
  }

  if (!videoTexture) return null
  
  const [width, height] = calculateDimensions()

  return (
    <>
      {/* Video Layer */}
      <mesh position={[0, 0, -10]} ref={meshRef}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial 
          map={videoTexture} 
          toneMapped={false}
        />
      </mesh>

      {/* Dark Overlay */}
      <mesh position={[0, 0, -9.9]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color="black" transparent opacity={0.2} />
      </mesh>
    </>
  )
}