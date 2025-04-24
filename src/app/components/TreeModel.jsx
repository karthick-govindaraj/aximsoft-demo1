"use client";
import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from 'three';
import { useGLTF, Html } from "@react-three/drei";
import gsap from "gsap";

export default function TreeModel({ position = [0, 0, 0], scale = 0 }) {
  const modelRef = useRef();
  const { scene } = useGLTF("/models/tree.glb");
  const [direction, setDirection] = useState("center");
  const meshRefs = useRef({});
  const [textboxes, setTextboxes] = useState([]);
  const [hoveredMesh, setHoveredMesh] = useState(null);
  const textboxContent = {
    Mesh1: "Great ideas need landing gear as much as wings",
    Mesh3: "Presence is more than just being there",
    Mesh4: "What gets measured, gets managed",
    Mesh7: "We rise by lifting others",
    Mesh8: "Penny saved is penny earned",
    Mesh11: "What gets measured, gets managed",
    Mesh12: "Your largest fear carries your greatest growth",
  };

  useEffect(() => {
    if (scene) {
      scene.rotation.set(0, 0, 0);
      const textboxPositions = [];
      scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.name.startsWith("Mesh") && parseInt(child.name.substring(4))) {
            meshRefs.current[child.name] = child;
            if (textboxContent[child.name]) {
              child.userData = { name: child.name }; // Store name for raycasting
              
              child.layers.enable(0);
              const worldPos = new THREE.Vector3();
              child.getWorldPosition(worldPos);
    
              let offsetX = 0.1;
              let offsetY = 0.15;
              let offsetZ = 0.1;
              if (["Mesh1", "Mesh3", "Mesh4"].includes(child.name)) {
                offsetX -= 0.8; // Move right
              }
              switch(child.name) {
                case "Mesh1":offsetX -= 0.4; 
                offsetY -= 0.15; 
                break;
                case "Mesh3":
                  offsetX -= 0.2; 
                offsetY -= 0.15; 
                break;
                case "Mesh4":
                  offsetX -= 0.1;
                offsetY -= 0.15; 
                break;
                case "Mesh7":offsetX -= 0.1; 
                offsetY += 0.1; 
                break;
                case "Mesh8":offsetX += 0.95; 
                offsetY -= 0.4; 
                break;
                case "Mesh11":offsetX += 0.9; 
                offsetY -= 0.5; 
                break;
                case "Mesh12":offsetX += 0.9; 
                offsetY -= 0.3; 
                break;
              }
            
              textboxPositions.push({
                name: child.name,
                position: [
                  child.position.x + offsetX,
                  child.position.y + offsetY,
                  child.position.z + offsetZ,
                ],
                content: textboxContent[child.name],
              });
            }
          }
          
          const material = child.material;
          // Handle multi-materials
          if (Array.isArray(material)) {
            material.forEach((mat) => {
              mat.transparent = true;
              mat.emissiveIntensity = 0.75;
            });
          } else {
            material.transparent = true;
            material.emissiveIntensity = 0.75;
          }
        }
      });
      
      setTextboxes(textboxPositions);
    }
    
    const tl = gsap.timeline();
    tl.fromTo(
      modelRef.current.position,
      { y: -5 },
      { y: position[1], duration: 2, ease: "elastic.out(1, 0.5)" }
    );
    tl.fromTo(
      modelRef.current.rotation,
      { y: -Math.PI },
      { y: 0, duration: 3, ease: "power2.out" },
      "-=1.5"
    );
    tl.fromTo(
      modelRef.current.scale,
      { x: 0, y: 0, z: 0 },
      { x: scale, y: scale, z: scale, duration: 1.5, ease: "back.out(1.7)" },
      "-=2.5"
    );
    window.addEventListener("mousemove", handlePointerMove);
    
    return () => {
      tl.kill();
      window.removeEventListener("mousemove", handlePointerMove);
    };
  }, [position, scale, scene]);
  const handlePointerMove = (e) => {
    const x = e.clientX;
    const width = window.innerWidth;
    if (x < width * 0.4) setDirection("left");
    else if (x > width * 0.6) setDirection("right");
    else setDirection("center");
  };
  const [blinkOpacity, setBlinkOpacity] = useState(1);
  useFrame(({ raycaster, camera, clock }) => {
    if (!modelRef.current) return;
    
    const targetRotation = {
      left: 0.3,
      right: -0.3,
      center: 0,
    };
    
    gsap.to(modelRef.current.rotation, {
      y: targetRotation[direction],
      duration: 2,
      ease: "power2.out",
    });
    // const t = performance.now() / 1000;  
    // modelRef.current.position.y = position[1] + Math.sin(t * 0.5) * 0.05;
    const blinkTime = (clock.getElapsedTime() % 5) / 5; 
    const newOpacity = 0.3 + (Math.sin(blinkTime * Math.PI * 2) * 0.7 + 0.7) / 2;
    setBlinkOpacity(newOpacity);
    raycaster.setFromCamera(
      { x: (window.mouseX || 0) / window.innerWidth * 2 - 1, 
        y: -((window.mouseY || 0) / window.innerHeight) * 2 + 1 }, 
      camera
    );
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    if (intersects.length > 0) {
      const firstMesh = intersects.find(i => 
        i.object.userData && 
        i.object.userData.name && 
        i.object.userData.name.startsWith('Mesh')
      );
      
      if (firstMesh) {
        setHoveredMesh(firstMesh.object.userData.name);
      } else {
        setHoveredMesh(null);
      }
    } else {
      setHoveredMesh(null);
    }
  });
  useEffect(() => {
    const trackMouse = (e) => {
      window.mouseX = e.clientX;
      window.mouseY = e.clientY;
    };
    
    window.addEventListener('mousemove', trackMouse);
    return () => window.removeEventListener('mousemove', trackMouse);
  }, []);

  return (
    <group ref={modelRef} position={position}>
      <primitive object={scene}/>
      
      {textboxes.map((textbox) => (
        <Html
          key={textbox.name}
          position={textbox.position}
          center
          distanceFactor={2}
          occlude={false}
          sprite
          transform
          zIndexRange={[1, 0]}
            className="annotation-box"
          style={{
            // background: "rgb(0, 0, 0)",
            // padding: "4px 10px",
            // borderRadius: "5px",
            // color: "white",
            // fontSize: "12px",
            // whiteSpace: "nowrap",
            // Full opacity when hovered, blinking opacity otherwise
            // opacity: hoveredMesh === textbox.name ? 1 : blinkOpacity,
            // transition: "opacity 0.2s ease", 
          }}
        >
          {textbox.content}
        </Html>
      ))}
    </group>
  );
}

useGLTF.preload("/models/tree.glb");
