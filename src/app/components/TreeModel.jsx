"use client";

import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGLTF, Text } from "@react-three/drei";
import gsap from "gsap";

const textboxContent = [
  "Great ideas need landing gear as much as wings",
  "Presence is more than just being there",
  "What gets measured, gets managed",
  "We rise by lifting others",
  "Penny saved is penny earned",
  "Your largest fear carries your greatest growth",
];

export default function TreeModel({ position = [0, 0, 0], scale = 0 }) {
  const treeRef = useRef();
  const textGroupRef = useRef();
  const textRefs = useRef(textboxContent.map(() => useRef()));
  const { scene } = useGLTF("/models/tree.glb");
  const [activeSentenceIndex, setActiveSentenceIndex] = useState(0);
  const targetRotation = useRef({ y: 0 });

  useEffect(() => {
    if (scene) {
      scene.rotation.set(0, 0, 0);
      scene.traverse((child) => {
        if (child.isMesh) {
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
    tl.fromTo(
      treeRef.current.position,
      { y: -5 },
      { y: position[1], duration: 2, ease: "elastic.out(1, 0.5)" }
    );
    tl.fromTo(
      treeRef.current.rotation,
      { y: -Math.PI },
      { y: 0, duration: 3, ease: "power2.out" },
      "-=1.5"
    );
    tl.fromTo(
      treeRef.current.scale,
      { x: 0, y: 0, z: 0 },
      { x: scale, y: scale, z: scale, duration: 1.5, ease: "back.out(1.7)" },
      "-=2.5"
    );

    const handleMouseMove = (event) => {
      // Get normalized mouse position (-1 to 1)
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      
      // Set target rotation based on mouse position
      targetRotation.current = {
        y: x * 0.5, // Controls rotation amount (0.5 = moderate rotation)
      };
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      tl.kill();
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [position, scale, scene]);

  useFrame(({ clock }) => {
    if (!treeRef.current || !textGroupRef.current) return;

    // Smoothly interpolate rotation toward target
    if (treeRef.current) {
      treeRef.current.rotation.y += 
        (targetRotation.current.y - treeRef.current.rotation.y) * 0.05;
    }

    const elapsedTime = clock.getElapsedTime();
    const radius = 2.3;
    let closestIndex = 0;
    let closestAngle = Math.PI * 2;

    textboxContent.forEach((_, i) => {
      const angle =
        (i / textboxContent.length) * Math.PI * 2 + elapsedTime * 0.1; // slowed rotation

      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;

      const ref = textRefs.current[i]?.current;
      if (ref) {
        // Update position and face center
        ref.position.set(x, 2, z);
        ref.rotation.set(0, -angle, 0);

        // Smooth opacity animation
        const targetOpacity = i === activeSentenceIndex ? 1 : 0.05;
        if (ref.material) {
          ref.material.opacity += (targetOpacity - ref.material.opacity) * 0.1;
        }
      }

      // Determine which sentence is closest to front
      const currentAngle = angle % (Math.PI * 2);
      const angleToCamera = Math.min(
        Math.abs(currentAngle),
        Math.abs(Math.PI * 2 - currentAngle)
      );

      if (angleToCamera < closestAngle) {
        closestAngle = angleToCamera;
        closestIndex = i;
      }
    });

    if (closestIndex !== activeSentenceIndex) {
      setActiveSentenceIndex(closestIndex);
    }
  });

  return (
    <group>
      {/* Tree Model */}
      <group ref={treeRef} position={position} scale={[scale, scale, scale]}>
        <primitive object={scene} />
      </group>

      {/* Text Ring */}
      <group ref={textGroupRef} position={[0, -3.8, 0]}>
        {textboxContent.map((sentence, i) => {
          const radius = 2.3;
          const angle = (i / textboxContent.length) * Math.PI * 2;
          const x = Math.sin(angle) * radius;
          const z = Math.cos(angle) * radius;

          return (
            <Text
              key={i}
              ref={textRefs.current[i]}
              font="/fonts/Kode_Mono/static/KodeMono-Regular.ttf"
              position={[x, 2, z]}
              rotation={[0, -angle, 0]}
              fontSize={0.09}
              maxWidth={2.5}
              textAlign="center"
              fontWeight={500}
              anchorX="center"
              anchorY="middle"
              color="white"
              material-transparent
              material-opacity={0.05} // Start with default
            >
              {sentence}
            </Text>
          );
        })}
      </group>
    </group>
  );
}

useGLTF.preload("/models/tree.glb");