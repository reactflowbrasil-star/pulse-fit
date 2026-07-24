import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

import type { AnimationId, CameraAngle } from "@/lib/exercise-catalog";

type Props = {
  animationId: AnimationId;
  cameraAngle: CameraAngle;
  paused?: boolean;
};

const cameraPresets: Record<CameraAngle, [number, number, number]> = {
  frontal: [0, 1.5, 4.2],
  lateral: [4.2, 1.5, 0.2],
  angulo_45: [3.2, 1.6, 3.2],
};

/**
 * Stylized procedural humanoid. Not photorealistic —
 * driven by useFrame math per exercise. Honest MVP.
 */
function Humanoid({ animationId, paused }: { animationId: AnimationId; paused?: boolean }) {
  const root = useRef<THREE.Group>(null!);
  const torso = useRef<THREE.Group>(null!);
  const head = useRef<THREE.Group>(null!);
  const armL = useRef<THREE.Group>(null!);
  const armR = useRef<THREE.Group>(null!);
  const legL = useRef<THREE.Group>(null!);
  const legR = useRef<THREE.Group>(null!);
  const forearmL = useRef<THREE.Group>(null!);
  const forearmR = useRef<THREE.Group>(null!);
  const shinL = useRef<THREE.Group>(null!);
  const shinR = useRef<THREE.Group>(null!);

  const timeRef = useRef(0);
  useFrame((_, delta) => {
    if (!paused) timeRef.current += delta;
    const t = timeRef.current;
    const g = root.current;
    if (!g) return;

    // reset baseline
    g.position.set(0, 0, 0);
    g.rotation.set(0, 0, 0);
    torso.current.rotation.set(0, 0, 0);
    torso.current.position.set(0, 0, 0);
    head.current.rotation.set(0, 0, 0);
    armL.current.rotation.set(0, 0, 0);
    armR.current.rotation.set(0, 0, 0);
    legL.current.rotation.set(0, 0, 0);
    legR.current.rotation.set(0, 0, 0);
    forearmL.current.rotation.set(0, 0, 0);
    forearmR.current.rotation.set(0, 0, 0);
    shinL.current.rotation.set(0, 0, 0);
    shinR.current.rotation.set(0, 0, 0);

    // breathing baseline
    const breath = Math.sin(t * 1.8) * 0.02;
    torso.current.position.y = breath;

    const s = Math.sin(t * 2.4);
    const c = Math.cos(t * 2.4);

    switch (animationId) {
      case "squat": {
        const depth = (Math.sin(t * 2) + 1) / 2; // 0..1
        g.position.y = -0.35 * depth;
        legL.current.rotation.x = -0.9 * depth;
        legR.current.rotation.x = -0.9 * depth;
        shinL.current.rotation.x = 1.4 * depth;
        shinR.current.rotation.x = 1.4 * depth;
        torso.current.rotation.x = 0.25 * depth;
        armL.current.rotation.x = -0.6 - 0.4 * depth;
        armR.current.rotation.x = -0.6 - 0.4 * depth;
        break;
      }
      case "pushup": {
        g.rotation.x = Math.PI / 2 - 0.1;
        g.position.y = -0.6;
        const d = (Math.sin(t * 2.5) + 1) / 2;
        g.position.z = 0.2 * d;
        armL.current.rotation.z = 0.6;
        armR.current.rotation.z = -0.6;
        forearmL.current.rotation.x = -0.4 - d * 0.9;
        forearmR.current.rotation.x = -0.4 - d * 0.9;
        break;
      }
      case "plank": {
        g.rotation.x = Math.PI / 2 - 0.1;
        g.position.y = -0.6;
        armL.current.rotation.z = 0.6;
        armR.current.rotation.z = -0.6;
        forearmL.current.rotation.x = -0.8;
        forearmR.current.rotation.x = -0.8;
        break;
      }
      case "lunge": {
        const d = (Math.sin(t * 1.6) + 1) / 2;
        g.position.y = -0.25 * d;
        legR.current.rotation.x = -0.6 - 0.4 * d;
        shinR.current.rotation.x = 0.4 + 0.4 * d;
        legL.current.rotation.x = 0.6;
        shinL.current.rotation.x = -0.6;
        torso.current.rotation.x = 0.1;
        break;
      }
      case "jumpingjack": {
        const open = (Math.sin(t * 6) + 1) / 2;
        g.position.y = 0.15 * open;
        armL.current.rotation.z = 0.4 + open * 1.6;
        armR.current.rotation.z = -0.4 - open * 1.6;
        legL.current.rotation.z = -0.05 - open * 0.25;
        legR.current.rotation.z = 0.05 + open * 0.25;
        break;
      }
      case "mountain_climber": {
        g.rotation.x = Math.PI / 2 - 0.1;
        g.position.y = -0.6;
        armL.current.rotation.z = 0.6;
        armR.current.rotation.z = -0.6;
        legL.current.rotation.x = -0.2 + s * 0.9;
        legR.current.rotation.x = -0.2 - s * 0.9;
        break;
      }
      case "glute_bridge": {
        g.rotation.x = -Math.PI / 2 + 0.15;
        g.position.y = -0.4;
        const d = (Math.sin(t * 2) + 1) / 2;
        torso.current.position.y = d * 0.35;
        legL.current.rotation.x = 1.1;
        legR.current.rotation.x = 1.1;
        shinL.current.rotation.x = -1.1;
        shinR.current.rotation.x = -1.1;
        break;
      }
      case "curl": {
        const d = (Math.sin(t * 3) + 1) / 2;
        armL.current.rotation.z = 0.15;
        armR.current.rotation.z = -0.15;
        forearmL.current.rotation.x = -1.6 * d;
        forearmR.current.rotation.x = -1.6 * d;
        break;
      }
      case "lateral_raise": {
        const d = (Math.sin(t * 2.4) + 1) / 2;
        armL.current.rotation.z = 0.2 + d * 1.5;
        armR.current.rotation.z = -0.2 - d * 1.5;
        break;
      }
      case "burpee": {
        const phase = (t * 0.5) % 1;
        if (phase < 0.25) {
          g.position.y = -0.3 * (phase / 0.25);
          legL.current.rotation.x = -1.0 * (phase / 0.25);
          legR.current.rotation.x = -1.0 * (phase / 0.25);
          shinL.current.rotation.x = 1.5 * (phase / 0.25);
          shinR.current.rotation.x = 1.5 * (phase / 0.25);
        } else if (phase < 0.75) {
          g.rotation.x = Math.PI / 2 - 0.1;
          g.position.y = -0.6;
          armL.current.rotation.z = 0.6;
          armR.current.rotation.z = -0.6;
        } else {
          g.position.y = 0.2 * ((phase - 0.75) / 0.25);
          armL.current.rotation.z = 1.8;
          armR.current.rotation.z = -1.8;
        }
        break;
      }
    }

    // subtle head follow
    head.current.rotation.y = c * 0.05;
  });

  const skin = useMemo(() => new THREE.Color("#e0c4a8"), []);
  const shirt = useMemo(() => new THREE.Color("#1a1d24"), []);
  const rim = useMemo(() => new THREE.Color("#d5ff5f"), []);

  return (
    <group ref={root} position={[0, 0, 0]}>
      {/* torso */}
      <group ref={torso} position={[0, 1.4, 0]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.32, 0.7, 6, 12]} />
          <meshStandardMaterial color={shirt} roughness={0.6} emissive={rim} emissiveIntensity={0.06} />
        </mesh>
        {/* head */}
        <group ref={head} position={[0, 0.65, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.22, 24, 20]} />
            <meshStandardMaterial color={skin} roughness={0.7} />
          </mesh>
        </group>
        {/* shoulders + arms */}
        <group ref={armL} position={[-0.4, 0.35, 0]}>
          <mesh position={[0, -0.28, 0]} castShadow>
            <capsuleGeometry args={[0.09, 0.4, 4, 10]} />
            <meshStandardMaterial color={skin} roughness={0.7} />
          </mesh>
          <group ref={forearmL} position={[0, -0.55, 0]}>
            <mesh position={[0, -0.25, 0]} castShadow>
              <capsuleGeometry args={[0.08, 0.4, 4, 10]} />
              <meshStandardMaterial color={skin} roughness={0.7} />
            </mesh>
          </group>
        </group>
        <group ref={armR} position={[0.4, 0.35, 0]}>
          <mesh position={[0, -0.28, 0]} castShadow>
            <capsuleGeometry args={[0.09, 0.4, 4, 10]} />
            <meshStandardMaterial color={skin} roughness={0.7} />
          </mesh>
          <group ref={forearmR} position={[0, -0.55, 0]}>
            <mesh position={[0, -0.25, 0]} castShadow>
              <capsuleGeometry args={[0.08, 0.4, 4, 10]} />
              <meshStandardMaterial color={skin} roughness={0.7} />
            </mesh>
          </group>
        </group>
      </group>
      {/* legs */}
      <group ref={legL} position={[-0.16, 0.9, 0]}>
        <mesh position={[0, -0.35, 0]} castShadow>
          <capsuleGeometry args={[0.12, 0.55, 4, 10]} />
          <meshStandardMaterial color={shirt} roughness={0.7} />
        </mesh>
        <group ref={shinL} position={[0, -0.7, 0]}>
          <mesh position={[0, -0.3, 0]} castShadow>
            <capsuleGeometry args={[0.1, 0.5, 4, 10]} />
            <meshStandardMaterial color={skin} roughness={0.7} />
          </mesh>
        </group>
      </group>
      <group ref={legR} position={[0.16, 0.9, 0]}>
        <mesh position={[0, -0.35, 0]} castShadow>
          <capsuleGeometry args={[0.12, 0.55, 4, 10]} />
          <meshStandardMaterial color={shirt} roughness={0.7} />
        </mesh>
        <group ref={shinR} position={[0, -0.7, 0]}>
          <mesh position={[0, -0.3, 0]} castShadow>
            <capsuleGeometry args={[0.1, 0.5, 4, 10]} />
            <meshStandardMaterial color={skin} roughness={0.7} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

export function Trainer3DViewer({ animationId, cameraAngle, paused }: Props) {
  const camPos = cameraPresets[cameraAngle];

  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ position: camPos, fov: 40 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#0f1015"]} />
      <fog attach="fog" args={["#0f1015", 6, 12]} />
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[4, 6, 4]}
        intensity={1.1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[-3, 2, -2]} color="#d5ff5f" intensity={0.6} />
      <Suspense fallback={null}>
        <Humanoid animationId={animationId} paused={paused} />
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, 0]}
          receiveShadow
        >
          <circleGeometry args={[3, 48]} />
          <meshStandardMaterial color="#171a1f" roughness={0.9} />
        </mesh>
      </Suspense>
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 1.1, 0]}
      />
    </Canvas>
  );
}
