// 'use client'

// import { useRef, useMemo } from 'react'
// import { useFrame } from '@react-three/fiber'
// import * as THREE from 'three'

// export default function Particles({ count = 20000 }) {
//   const whiteMesh = useRef()
//   const blackMesh = useRef()
//   const dummy = useMemo(() => new THREE.Object3D(), [])

//   const particles = useMemo(() => {
//     const temp = []
//     for (let i = 0; i < count; i++) {
//       const radius = Math.random() * 4 + 2
//       const theta = Math.random() * Math.PI * 2
//       const phi = Math.random() * Math.PI

//       const x = radius * Math.sin(phi) * Math.cos(theta)
//       const y = radius * Math.sin(phi) * Math.sin(theta)
//       const z = radius * Math.cos(phi)

//       temp.push({
//         initial: [x, y, z],
//         angleOffset: Math.random() * Math.PI * 2,
//         scale: Math.random() * 0.3 + 0.05,
//         speed: Math.random() * 0.02 + 0.005
//       })
//     }
//     return temp
//   }, [count])

//   useFrame((state) => {
//     const time = state.clock.getElapsedTime()

//     particles.forEach((particle, i) => {
//       const { initial, scale, speed, angleOffset } = particle
//       const radius = Math.sqrt(initial[0] ** 2 + initial[2] ** 2)
//       const angle = angleOffset + time * speed
//       const x = Math.sin(angle) * radius
//       const z = Math.cos(angle) * radius
//       const baseY = initial[1] + Math.sin(time * speed * 2) * 0.1

//       // Main white particle
//       dummy.position.set(x, baseY, z)
//       dummy.scale.set(scale, scale, scale)
//       dummy.updateMatrix()
//       whiteMesh.current.setMatrixAt(i, dummy.matrix)

//       // Fake black shadow slightly lower
//       dummy.position.set(x, baseY - 0.05, z)
//       dummy.scale.set(scale, scale, scale)
//       dummy.updateMatrix()
//       blackMesh.current.setMatrixAt(i, dummy.matrix)
//     })

//     whiteMesh.current.instanceMatrix.needsUpdate = true
//     blackMesh.current.instanceMatrix.needsUpdate = true
//   })

//   return (
//     <>
//       {/* Main white particles */}
//       <instancedMesh ref={whiteMesh} args={[null, null, count]}>
//         <sphereGeometry args={[0.03, 8, 8]} />
//         <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
//       </instancedMesh>

//       {/* Shadow black particles */}
//       <instancedMesh ref={blackMesh} args={[null, null, count]}>
//         <sphereGeometry args={[0.03, 8, 8]} />
//         <meshBasicMaterial color="#000000" transparent opacity={0.35} />
//       </instancedMesh>
//     </>
//   )
// }

'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function SnowParticles({ count = 5000 }) {
  const snowMesh = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const particles = useMemo(() => {
    const temp = []
    // Create particles in a wide area above and around the scene
    for (let i = 0; i < count; i++) {
      // Distribute snowflakes in a wider but flatter area
      const x = (Math.random() - 0.5) * 20 // wide spread on x
      const y = Math.random() * 15 + 5    // start above the scene
      const z = (Math.random() - 0.5) * 20 // wide spread on z
      
      temp.push({
        position: [x, y, z],
        // Variation in snowflake sizes
        scale: Math.random() * 0.2 + 0.05,
        // Variation in falling speed
        speed: Math.random() * 0.2 + 0.1,
        // Random horizontal drift
        drift: Math.random() * 0.03 - 0.015,
        // Random rotation
        rotationSpeed: Math.random() * 0.01,
        // For swaying effect
        swayFactor: Math.random() * 0.2,
        swayOffset: Math.random() * Math.PI * 2
      })
    }
    return temp
  }, [count])

  useFrame((state) => {
    const time = state.clock.getElapsedTime()

    particles.forEach((particle, i) => {
      const { position, scale, speed, drift, swayFactor, swayOffset } = particle
      
      // Apply gravity - move downward
      let newY = position[1] - speed * 0.1
      
      // Reset position if snowflake falls below the scene
      if (newY < -2) {
        newY = 15
        // Randomize x and z when respawning
        position[0] = (Math.random() - 0.5) * 20
        position[2] = (Math.random() - 0.5) * 20
      }
      
      // Update y position
      position[1] = newY
      
      // Add horizontal drift (wind effect)
      position[0] += drift
      
      // Add swaying motion
      const sway = Math.sin(time * 0.5 + swayOffset) * swayFactor
      
      // Set position with slight sway
      dummy.position.set(
        position[0] + sway,
        position[1],
        position[2]
      )
      
      // Set scale - vary size slightly for more realistic snow
      const sizeVariation = Math.sin(time * 0.5 + i) * 0.05 + 1
      dummy.scale.set(
        scale * sizeVariation,
        scale * sizeVariation,
        scale * sizeVariation
      )
      
      // Add some rotation to the snowflakes
      dummy.rotation.set(
        time * 0.2 + i,
        time * 0.1 + i * 0.2,
        0
      )
      
      dummy.updateMatrix()
      snowMesh.current.setMatrixAt(i, dummy.matrix)
    })

    snowMesh.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={snowMesh} args={[null, null, count]}>
      <circleGeometry args={[0.05, 6]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.7} side={THREE.DoubleSide} />
    </instancedMesh>
  )
}