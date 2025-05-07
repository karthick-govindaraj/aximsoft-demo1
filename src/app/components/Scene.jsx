'use client'

import { Canvas } from '@react-three/fiber'
import { Suspense, useState, useEffect } from 'react'
import { OrbitControls, OrthographicCamera, useProgress, Environment, Preload  } from '@react-three/drei'
import TreeModel from './TreeModel'
import Particles from './Particles'
import VideoBackground from './VideoBackground'
import PanoramaBackground from './PanoramaBackground'
import Loader from './Loader'
import ChatWindowManager from './ChatWindowManager'
import { EffectComposer, Bloom ,Selection} from '@react-three/postprocessing';

export default function Scene() {
  const [isMounted, setIsMounted] = useState(false)
  const [zoom, setZoom] = useState(getZoom());

  function getZoom() {
    const baseWidth = 1440;
    const baseZoom = 180;
    if (typeof window !== 'undefined') {
      const currentWidth = window.innerWidth;
      return (currentWidth / baseWidth) * baseZoom;
    }
  }
  
  function LoadingManager() {
    const { progress, active } = useProgress()
    return <Loader progress={progress} isLoading={active} />
  }

  useEffect(() => {
    const handleResize = () => setZoom(getZoom());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  return (
    <>
      {/* <LoadingManager /> */}
      <Canvas
        shadows
        camera={{ position: [0, 0, 5], fov: 50 }}
        className="bg-black"
      >
        <OrthographicCamera
          makeDefault
          position={[0, 0, 5]}
          zoom={zoom}
          near={0.1}
          far={1000}
        />
        <color attach="background" args={['#000']} />
        <fog attach="fog" args={['#000', 5, 20]} />
        <VideoBackground/>
        <ambientLight intensity={2} />
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={1} 
          castShadow 
          shadow-mapSize-width={1024} 
          shadow-mapSize-height={1024}
        />
        
        <Suspense fallback={null}>
          <Selection>
            {/* <EffectComposer>
              <Bloom 
                luminanceThreshold={0.2}
                luminanceSmoothing={0.9}
                intensity={0.5}
                selectionLayer={1} 
              />
            </EffectComposer> */}
            
            <TreeModel position={[0, -1.55, 0]} scale={0.95} selectionLayer={1} />
          </Selection>
          
          {/* <Particles count={2000} /> */}
          <Environment preset="night" />
          <Preload all />
        </Suspense>
        
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
          minDistance={3}
          maxDistance={10}
        />
      </Canvas>
      <ChatWindowManager />
    </>
  )
}