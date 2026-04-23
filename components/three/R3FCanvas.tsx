"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import FloatingFood from "./FloatingFood";

export default function R3FCanvas() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.4 }}
      aria-hidden
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <FloatingFood />
        </Suspense>
      </Canvas>
    </div>
  );
}
