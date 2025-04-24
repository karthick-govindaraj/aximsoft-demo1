import * as THREE from 'three'
import { useMemo } from 'react'

export default function RadialGradientBackground() {
  const texture = useMemo(() => {
    const size = 512
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size

    const ctx = canvas.getContext('2d')
    const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2)
    gradient.addColorStop(0, 'black')
    gradient.addColorStop(1,'#818181') 

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)

    const tex = new THREE.CanvasTexture(canvas)
    tex.minFilter = THREE.LinearFilter
    tex.magFilter = THREE.LinearFilter
    return tex
  }, [])

  return (
    <mesh position={[0, -1, 0]}>
      <planeGeometry args={[20, 20]} />
      <meshBasicMaterial map={texture} depthTest={false} depthWrite={false} />
    </mesh>
  )
}