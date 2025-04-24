"use client";
import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from 'three';
import { useGLTF, Html } from "@react-three/drei";
import gsap from "gsap";

const textboxContent = [
  "Great ideas need landing gear as much as wings",
  "Presence is more than just being there",
  "What gets measured, gets managed",
  "We rise by lifting others",
  "Penny saved is penny earned",
  "Your largest fear carries your greatest growth"
];

export default function TreeModel({ position = [0, 0, 0], scale = 0 }) {
  const modelRef = useRef();
  const { scene } = useGLTF("/models/tree.glb");
  const [direction, setDirection] = useState("center");
  const [visibleIndex, setVisibleIndex] = useState(0);

  const textboxMessages = [
    "Great ideas need landing gear as much as wings",
    "Presence is more than just being there",
    "What gets measured, gets managed",
    "We rise by lifting others",
    "Penny saved is penny earned",
    "Your largest fear carries your greatest growth",
  ];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false); // Start fade out
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % textboxMessages.length);
        setVisible(true); // Fade in next message
      }, 500); // Allow fade-out duration (0.5s)
    }, 2000);
  
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scene) {
      scene.rotation.set(0, 0, 0);
      scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          const material = child.material;
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
    }

    const tl = gsap.timeline();
    tl.fromTo(modelRef.current.position, { y: -5 }, { y: position[1], duration: 2, ease: "elastic.out(1, 0.5)" });
    tl.fromTo(modelRef.current.rotation, { y: -Math.PI }, { y: 0, duration: 3, ease: "power2.out" }, "-=1.5");
    tl.fromTo(modelRef.current.scale, { x: 0, y: 0, z: 0 }, { x: scale, y: scale, z: scale, duration: 1.5, ease: "back.out(1.7)" }, "-=2.5");

    // Show messages one by one every 2 seconds
    let i = 0;
    const interval = setInterval(() => {
      if (i < textboxContent.length) {
        setVisibleIndex(i + 1);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 3000);

    window.addEventListener("mousemove", handlePointerMove);
    return () => {
      tl.kill();
      clearInterval(interval);
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

  useFrame(({ clock }) => {
    if (!modelRef.current) return;
    const targetRotation = { left: 0.3, right: -0.3, center: 0 };
    gsap.to(modelRef.current.rotation, {
      y: targetRotation[direction],
      duration: 2,
      ease: "power2.out",
    });
    const t = performance.now() / 1000;
    modelRef.current.position.y = position[1] + Math.sin(t * 0.5) * 0.05;
  });

  return (
    <group ref={modelRef} position={position}>
      <primitive object={scene} />

      {textboxContent.slice(0, visibleIndex).map((text, idx) => (
        <Html
        position={[0, -0.2, 0]}
        center
        distanceFactor={2}
        occlude={false}
        sprite
        transform
        zIndexRange={[1, 0]}
        className="annotation-box"
        style={{
          opacity: visible ? 1 : 0,
          transition: "opacity 0.5s ease-in-out",
          background: "rgba(0, 0, 0, 0.6)",
          padding: "6px 12px",
          borderRadius: "8px",
          color: "white",
          fontSize: "14px",
          whiteSpace: "nowrap",
        }}
      >
        {textboxMessages[currentIndex]}
      </Html>
      ))}
    </group>
  );
}

useGLTF.preload("/models/tree.glb");
