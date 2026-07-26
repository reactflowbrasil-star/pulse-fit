import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  Environment,
  ContactShadows,
  SoftShadows,
} from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import type { CameraAngle } from "@/lib/exercise-catalog";

type Props = {
  url: string;
  cameraAngle: CameraAngle;
  paused?: boolean;
};

const cameraPresets: Record<CameraAngle, [number, number, number]> = {
  frontal: [0, 1.55, 3.6],
  lateral: [3.6, 1.55, 0.3],
  angulo_45: [2.7, 1.65, 2.7],
};

function Model({ url, paused }: { url: string; paused?: boolean }) {
  const { scene } = useGLTF(url);
  const cloned = useMemo(() => scene.clone(true), [scene]);

  // Enable shadows + subtle idle breathing on top of whatever mesh loads.
  useEffect(() => {
    cloned.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
  }, [cloned]);

  const group = useRef<THREE.Group>(null!);
  const t = useRef(0);
  useFrame((_, delta) => {
    if (!paused) t.current += delta;
    if (group.current) {
      group.current.position.y = Math.sin(t.current * 1.6) * 0.015;
      group.current.rotation.y = Math.sin(t.current * 0.4) * 0.05;
    }
  });

  return (
    <group ref={group}>
      <primitive object={cloned} />
    </group>
  );
}

function CameraRig({ angle }: { angle: CameraAngle }) {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3(...cameraPresets[angle]));
  useEffect(() => {
    target.current.set(...cameraPresets[angle]);
  }, [angle]);
  useFrame((_, delta) => {
    camera.position.x = THREE.MathUtils.damp(camera.position.x, target.current.x, 4, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, target.current.y, 4, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, target.current.z, 4, delta);
    camera.lookAt(0, 1.2, 0);
    camera.updateProjectionMatrix();
  });
  return null;
}

/**
 * Loads a user-provided GLB avatar (e.g. Ready Player Me full-body export).
 * Photoreal shading via Environment + SoftShadows. No mocap retarget here —
 * uses whatever animations ship in the GLB, plus subtle idle breathing.
 */
export function GLBTrainerViewer({ url, cameraAngle, paused }: Props) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: cameraPresets.frontal, fov: 38 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <SoftShadows size={20} samples={12} focus={0.9} />
      <CameraRig angle={cameraAngle} />
      <color attach="background" args={["#0f1015"]} />
      <fog attach="fog" args={["#0f1015", 6, 13]} />
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[4, 6, 4]}
        intensity={1.4}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-3, 2.4, -1.5]} color="#b7ff52" intensity={0.9} distance={9} />
      <Suspense fallback={null}>
        <Environment preset="studio" background={false} />
        <Model url={url} paused={paused} />
        <ContactShadows position={[0, 0.01, 0]} opacity={0.55} scale={6} blur={2.4} far={2.5} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[3.2, 64]} />
          <meshStandardMaterial color="#141519" roughness={0.75} metalness={0.15} />
        </mesh>
      </Suspense>
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        enableDamping
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 1.15, 0]}
      />
    </Canvas>
  );
}
