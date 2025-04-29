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
  const treeRef = useRef(); // Only Tree
  const textGroupRef = useRef(); // Only Text
  const textRefs = useRef(textboxContent.map(() => useRef()));
  const { scene } = useGLTF("/models/tree.glb");
  const [direction, setDirection] = useState("center");
  const [activeSentenceIndex, setActiveSentenceIndex] = useState(0);

  const handlePointerMove = (e) => {
    const x = e.clientX;
    const width = window.innerWidth;
    if (x < width * 0.4) setDirection("left");
    else if (x > width * 0.6) setDirection("right");
    else setDirection("center");
  };

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

    window.addEventListener("mousemove", handlePointerMove);

    return () => {
      tl.kill();
      window.removeEventListener("mousemove", handlePointerMove);
    };
  }, [position, scale, scene]);

  useFrame(({ clock }) => {
    if (!treeRef.current || !textGroupRef.current) return;

    // Tree rotation only
    const targetRotation = { left: 0.3, right: -0.3, center: 0 };
    gsap.to(treeRef.current.rotation, {
      y: targetRotation[direction],
      duration: 5,
      ease: "power2.out",
    });

    // Text rotation only
    const elapsedTime = clock.getElapsedTime();
    const radius = 2.5;

    textboxContent.forEach((_, i) => {
      const angle =
        (i / textboxContent.length) * Math.PI * 2 + elapsedTime * 0.2;

      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;

      if (textRefs.current[i]?.current) {
        textRefs.current[i].current.position.set(x, 2, z);
        textRefs.current[i].current.rotation.set(0, -angle, 0); // Keep text facing center
      }
    });

    // Active text detection
    let closestIndex = 0;
    let closestAngle = Math.PI * 2;

    textboxContent.forEach((_, i) => {
      const angle =
        (i / textboxContent.length) * Math.PI * 2 + elapsedTime * 0.2;
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
      {/* Tree Model (only) */}
      <group ref={treeRef} position={position} scale={[scale, scale, scale]}>
        <primitive object={scene} />
      </group>

      {/* Texts (only) */}
      <group ref={textGroupRef} position={[0, -3.8, 0]}>
        {textboxContent.map((sentence, i) => {
          const radius = 2.5;
          const angle = (i / textboxContent.length) * Math.PI * 2;

          const x = Math.sin(angle) * radius;
          const z = Math.cos(angle) * radius;

          return (
            <Text
              font="/fonts/Kode_Mono/static/KodeMono-Regular.ttf"
              key={i}
              ref={textRefs.current[i]}
              position={[x, 2, z]}
              rotation={[0, -angle, 0]}
              fontSize={0.09} // Use same font size for all (optional)
              maxWidth={2.5}
              textAlign="center"
              fontWeight={500}
              anchorX="center"
              anchorY="middle"
              color="white" // Same color for all
              fillOpacity={i === activeSentenceIndex ? 1 : 0.4} // 👈 Opacity changes based on active
              outlineWidth={0}
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
