"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import type { Group, Mesh } from "three";

function RotatingShape({
  geometry,
  position,
  color,
  emissive,
  speed = 0.3,
}: {
  geometry: React.ReactNode;
  position: [number, number, number];
  color: string;
  emissive: string;
  speed?: number;
}) {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x += delta * speed * 0.4;
    ref.current.rotation.y += delta * speed;
  });
  return (
    <mesh ref={ref} position={position}>
      {geometry}
      <meshStandardMaterial
        color={color}
        roughness={0.25}
        metalness={0.2}
        emissive={emissive}
        emissiveIntensity={0.35}
      />
    </mesh>
  );
}

export default function FloatingFood() {
  const groupRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.1) * 0.15;
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.55} />
      <pointLight position={[10, 10, 10]} intensity={0.9} color="#FFB627" />
      <pointLight position={[-8, -4, 6]} intensity={0.6} color="#FF5A3C" />
      <pointLight position={[0, 6, -4]} intensity={0.4} color="#7C3AED" />

      <Float speed={1.2} rotationIntensity={0.6} floatIntensity={1.4}>
        <RotatingShape
          geometry={<torusGeometry args={[1.1, 0.38, 24, 64]} />}
          position={[-3.2, 1.2, -1]}
          color="#FF5A3C"
          emissive="#FFB627"
          speed={0.4}
        />
      </Float>

      <Float speed={1.5} rotationIntensity={0.8} floatIntensity={1.6}>
        <RotatingShape
          geometry={<icosahedronGeometry args={[1, 0]} />}
          position={[3.2, 0.4, -0.5]}
          color="#FFB627"
          emissive="#FF5A3C"
          speed={0.5}
        />
      </Float>

      <Float speed={0.9} rotationIntensity={0.4} floatIntensity={1.2}>
        <RotatingShape
          geometry={<dodecahedronGeometry args={[0.75, 0]} />}
          position={[0.5, -1.8, 1]}
          color="#3EB489"
          emissive="#FFB627"
          speed={0.3}
        />
      </Float>

      <Float speed={1.1} rotationIntensity={0.5} floatIntensity={1.0}>
        <RotatingShape
          geometry={<octahedronGeometry args={[0.6, 0]} />}
          position={[-1.8, -1.2, 1.6]}
          color="#7C3AED"
          emissive="#FF5A3C"
          speed={0.45}
        />
      </Float>
    </group>
  );
}
