import gsap from 'gsap'

// Animation for camera movement
export const animateCamera = (camera, targetPosition, duration = 2) => {
  gsap.to(camera.position, {
    x: targetPosition.x,
    y: targetPosition.y,
    z: targetPosition.z,
    duration,
    ease: 'power2.inOut',
    onUpdate: () => camera.lookAt(0, 0, 0)
  })
}

// Animation for model interaction
export const pulseModel = (model, intensity = 1.2, duration = 1) => {
  const originalScale = { ...model.scale }
  
  // Store original scale
  const scaleX = model.scale.x
  const scaleY = model.scale.y
  const scaleZ = model.scale.z
  
  // Create pulse animation
  const timeline = gsap.timeline()
  
  timeline.to(model.scale, {
    x: scaleX * intensity,
    y: scaleY * intensity,
    z: scaleZ * intensity,
    duration: duration / 2,
    ease: 'power1.inOut'
  })
  
  timeline.to(model.scale, {
    x: scaleX,
    y: scaleY,
    z: scaleZ,
    duration: duration / 2,
    ease: 'power2.out'
  })
  
  return timeline
}

// Particle system animation
export const animateParticles = (particles, duration = 1) => {
  gsap.to(particles.material, {
    opacity: particles.material.opacity === 1 ? 0.3 : 1,
    duration,
    ease: 'power1.inOut'
  })
}