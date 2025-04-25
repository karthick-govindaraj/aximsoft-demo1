import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

export default function VideoBackground() {
  const meshRef = useRef()
  const [videoTexture, setVideoTexture] = useState(null)

  useEffect(() => {
    const video = document.createElement('video')
    video.src = '/aximsoft.mp4'
    video.crossOrigin = 'anonymous'
    video.loop = true
    video.muted = true
    video.playsInline = true
    video.autoplay = true
    video.play()

    const texture = new THREE.VideoTexture(video)
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.format = THREE.RGBFormat

    setVideoTexture(texture)
  }, [])

  if (!videoTexture) return null

  return (
<>
  <mesh position={[0, 0, -10]}>
    <planeGeometry args={[20, 10]} />
    <meshBasicMaterial map={videoTexture} toneMapped={false} />
  </mesh>

  <mesh position={[0, 0, -9.9]}>
    <planeGeometry args={[20, 10]} />
    <meshBasicMaterial color="black" transparent opacity={0.5} />
  </mesh>
</>

  )
}
