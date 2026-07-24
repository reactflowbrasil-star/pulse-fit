import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, SoftShadows } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef } from "react";

import * as THREE from "three";

import type { AnimationId, CameraAngle } from "@/lib/exercise-catalog";

type Props = {
  animationId: AnimationId;
  cameraAngle: CameraAngle;
  paused?: boolean;
};

const cameraPresets: Record<CameraAngle, [number, number, number]> = {
  frontal: [0, 1.55, 4.2],
  lateral: [4.2, 1.55, 0.3],
  angulo_45: [3.1, 1.65, 3.1],
};

/**
 * Stylized athletic humanoid with tapered limbs, subtle muscular volume,
 * PBR materials and critically-damped joint smoothing for realistic motion.
 */
function Humanoid({ animationId, paused }: { animationId: AnimationId; paused?: boolean }) {
  const root = useRef<THREE.Group>(null!);
  const torso = useRef<THREE.Group>(null!);
  const chest = useRef<THREE.Group>(null!);
  const head = useRef<THREE.Group>(null!);
  const armL = useRef<THREE.Group>(null!);
  const armR = useRef<THREE.Group>(null!);
  const legL = useRef<THREE.Group>(null!);
  const legR = useRef<THREE.Group>(null!);
  const forearmL = useRef<THREE.Group>(null!);
  const forearmR = useRef<THREE.Group>(null!);
  const shinL = useRef<THREE.Group>(null!);
  const shinR = useRef<THREE.Group>(null!);

  // Targets for damped interpolation → natural, springy motion.
  const target = useRef({
    rootY: 0, rootZ: 0, rootRotX: 0,
    torsoRotX: 0, torsoY: 0,
    armLZ: 0, armLX: 0, armRZ: 0, armRX: 0,
    forLX: 0, forRX: 0,
    legLX: 0, legLZ: 0, legRX: 0, legRZ: 0,
    shinLX: 0, shinRX: 0,
    headY: 0,
  });

  const timeRef = useRef(0);
  useFrame((_, delta) => {
    if (!paused) timeRef.current += delta;
    const t = timeRef.current;
    const g = root.current;
    if (!g) return;

    const tg = target.current;
    // reset targets
    tg.rootY = 0; tg.rootZ = 0; tg.rootRotX = 0;
    tg.torsoRotX = Math.sin(t * 1.8) * 0.02;
    tg.torsoY = Math.sin(t * 1.8) * 0.015;
    tg.armLZ = 0; tg.armLX = 0; tg.armRZ = 0; tg.armRX = 0;
    tg.forLX = 0; tg.forRX = 0;
    tg.legLX = 0; tg.legLZ = 0; tg.legRX = 0; tg.legRZ = 0;
    tg.shinLX = 0; tg.shinRX = 0;
    tg.headY = Math.cos(t * 2.2) * 0.06;

    const s = Math.sin(t * 2.4);

    switch (animationId) {
      case "squat": {
        const d = (Math.sin(t * 1.9) + 1) / 2;
        tg.rootY = -0.38 * d;
        tg.legLX = -0.95 * d; tg.legRX = -0.95 * d;
        tg.shinLX = 1.45 * d; tg.shinRX = 1.45 * d;
        tg.torsoRotX = 0.28 * d;
        tg.armLX = -0.6 - 0.45 * d; tg.armRX = -0.6 - 0.45 * d;
        break;
      }
      case "pushup": {
        tg.rootRotX = Math.PI / 2 - 0.12;
        tg.rootY = -0.6;
        const d = (Math.sin(t * 2.6) + 1) / 2;
        tg.rootZ = 0.22 * d;
        tg.armLZ = 0.62; tg.armRZ = -0.62;
        tg.forLX = -0.4 - d * 0.95; tg.forRX = -0.4 - d * 0.95;
        break;
      }
      case "plank": {
        tg.rootRotX = Math.PI / 2 - 0.12;
        tg.rootY = -0.6;
        tg.armLZ = 0.6; tg.armRZ = -0.6;
        tg.forLX = -0.82; tg.forRX = -0.82;
        break;
      }
      case "lunge": {
        const d = (Math.sin(t * 1.6) + 1) / 2;
        tg.rootY = -0.28 * d;
        tg.legRX = -0.65 - 0.45 * d;
        tg.shinRX = 0.45 + 0.4 * d;
        tg.legLX = 0.65; tg.shinLX = -0.65;
        tg.torsoRotX = 0.12;
        break;
      }
      case "jumpingjack": {
        const open = (Math.sin(t * 6) + 1) / 2;
        tg.rootY = 0.18 * open;
        tg.armLZ = 0.4 + open * 1.65; tg.armRZ = -0.4 - open * 1.65;
        tg.legLZ = -0.05 - open * 0.28; tg.legRZ = 0.05 + open * 0.28;
        break;
      }
      case "mountain_climber": {
        tg.rootRotX = Math.PI / 2 - 0.12;
        tg.rootY = -0.6;
        tg.armLZ = 0.6; tg.armRZ = -0.6;
        tg.legLX = -0.2 + s * 0.95;
        tg.legRX = -0.2 - s * 0.95;
        break;
      }
      case "glute_bridge": {
        tg.rootRotX = -Math.PI / 2 + 0.15;
        tg.rootY = -0.4;
        const d = (Math.sin(t * 2) + 1) / 2;
        tg.torsoY = d * 0.38;
        tg.legLX = 1.1; tg.legRX = 1.1;
        tg.shinLX = -1.1; tg.shinRX = -1.1;
        break;
      }
      case "curl": {
        const d = (Math.sin(t * 3) + 1) / 2;
        tg.armLZ = 0.15; tg.armRZ = -0.15;
        tg.forLX = -1.65 * d; tg.forRX = -1.65 * d;
        break;
      }
      case "lateral_raise": {
        const d = (Math.sin(t * 2.4) + 1) / 2;
        tg.armLZ = 0.2 + d * 1.55; tg.armRZ = -0.2 - d * 1.55;
        break;
      }
      case "burpee": {
        const phase = (t * 0.5) % 1;
        if (phase < 0.25) {
          const p = phase / 0.25;
          tg.rootY = -0.3 * p;
          tg.legLX = -1.0 * p; tg.legRX = -1.0 * p;
          tg.shinLX = 1.5 * p; tg.shinRX = 1.5 * p;
        } else if (phase < 0.75) {
          tg.rootRotX = Math.PI / 2 - 0.12;
          tg.rootY = -0.6;
          tg.armLZ = 0.6; tg.armRZ = -0.6;
        } else {
          tg.rootY = 0.22 * ((phase - 0.75) / 0.25);
          tg.armLZ = 1.85; tg.armRZ = -1.85;
        }
        break;
      }
    }

    // Critically-damped smoothing → springy but realistic (no overshoot spam).
    const lambda = 8; // higher = snappier
    const damp = THREE.MathUtils.damp;

    g.position.y = damp(g.position.y, tg.rootY, lambda, delta);
    g.position.z = damp(g.position.z, tg.rootZ, lambda, delta);
    g.rotation.x = damp(g.rotation.x, tg.rootRotX, lambda, delta);

    torso.current.rotation.x = damp(torso.current.rotation.x, tg.torsoRotX, lambda, delta);
    torso.current.position.y = damp(torso.current.position.y, tg.torsoY, lambda, delta);

    armL.current.rotation.z = damp(armL.current.rotation.z, tg.armLZ, lambda, delta);
    armL.current.rotation.x = damp(armL.current.rotation.x, tg.armLX, lambda, delta);
    armR.current.rotation.z = damp(armR.current.rotation.z, tg.armRZ, lambda, delta);
    armR.current.rotation.x = damp(armR.current.rotation.x, tg.armRX, lambda, delta);
    forearmL.current.rotation.x = damp(forearmL.current.rotation.x, tg.forLX, lambda, delta);
    forearmR.current.rotation.x = damp(forearmR.current.rotation.x, tg.forRX, lambda, delta);

    legL.current.rotation.x = damp(legL.current.rotation.x, tg.legLX, lambda, delta);
    legL.current.rotation.z = damp(legL.current.rotation.z, tg.legLZ, lambda, delta);
    legR.current.rotation.x = damp(legR.current.rotation.x, tg.legRX, lambda, delta);
    legR.current.rotation.z = damp(legR.current.rotation.z, tg.legRZ, lambda, delta);
    shinL.current.rotation.x = damp(shinL.current.rotation.x, tg.shinLX, lambda, delta);
    shinR.current.rotation.x = damp(shinR.current.rotation.x, tg.shinRX, lambda, delta);

    head.current.rotation.y = damp(head.current.rotation.y, tg.headY, 4, delta);
  });

  // PBR-flavoured materials — subtle metalness on skin, matte technical fabric.
  const skinMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#d9b590"),
        roughness: 0.55,
        metalness: 0.02,
      }),
    []
  );
  const shirtMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#12141a"),
        roughness: 0.85,
        metalness: 0.05,
        emissive: new THREE.Color("#b7ff52"),
        emissiveIntensity: 0.04,
      }),
    []
  );
  const shortsMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#1a1d24"),
        roughness: 0.8,
        metalness: 0.02,
      }),
    []
  );
  const shoeMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#0d0f13"),
        roughness: 0.4,
        metalness: 0.1,
        emissive: new THREE.Color("#b7ff52"),
        emissiveIntensity: 0.08,
      }),
    []
  );

  return (
    <group ref={root} position={[0, 0, 0]}>
      {/* Hips (torso root) */}
      <group ref={torso} position={[0, 1.35, 0]}>
        {/* Chest — tapered towards shoulders */}
        <group ref={chest} position={[0, 0.15, 0]}>
          <mesh castShadow material={shirtMat}>
            <capsuleGeometry args={[0.36, 0.55, 8, 20]} />
          </mesh>
          {/* Trapezius bump */}
          <mesh position={[0, 0.42, -0.02]} castShadow material={shirtMat}>
            <sphereGeometry args={[0.19, 20, 16]} />
          </mesh>
          {/* Neck */}
          <mesh position={[0, 0.55, 0]} castShadow material={skinMat}>
            <cylinderGeometry args={[0.09, 0.11, 0.18, 16]} />
          </mesh>
          {/* Head */}
          <group ref={head} position={[0, 0.78, 0]}>
            <mesh castShadow material={skinMat}>
              <sphereGeometry args={[0.22, 32, 28]} />
            </mesh>
            {/* Jaw hint */}
            <mesh position={[0, -0.12, 0.04]} castShadow material={skinMat}>
              <sphereGeometry args={[0.16, 20, 16]} />
            </mesh>
            {/* Eyes */}
            <mesh position={[-0.08, 0.03, 0.19]}>
              <sphereGeometry args={[0.022, 12, 10]} />
              <meshStandardMaterial color="#0a0a0a" roughness={0.2} />
            </mesh>
            <mesh position={[0.08, 0.03, 0.19]}>
              <sphereGeometry args={[0.022, 12, 10]} />
              <meshStandardMaterial color="#0a0a0a" roughness={0.2} />
            </mesh>
            {/* Hair cap */}
            <mesh position={[0, 0.11, -0.02]} castShadow>
              <sphereGeometry args={[0.225, 24, 20, 0, Math.PI * 2, 0, Math.PI / 2.1]} />
              <meshStandardMaterial color="#1a1614" roughness={0.55} />
            </mesh>
          </group>

          {/* Left arm */}
          <group ref={armL} position={[-0.42, 0.28, 0]}>
            {/* Deltoid */}
            <mesh position={[0, 0, 0]} castShadow material={skinMat}>
              <sphereGeometry args={[0.13, 20, 16]} />
            </mesh>
            {/* Bicep */}
            <mesh position={[0, -0.28, 0]} castShadow material={skinMat}>
              <capsuleGeometry args={[0.1, 0.4, 6, 14]} />
            </mesh>
            <group ref={forearmL} position={[0, -0.55, 0]}>
              {/* Forearm — tapered */}
              <mesh position={[0, -0.24, 0]} castShadow material={skinMat}>
                <capsuleGeometry args={[0.085, 0.4, 6, 14]} />
              </mesh>
              {/* Hand */}
              <mesh position={[0, -0.5, 0]} castShadow material={skinMat}>
                <boxGeometry args={[0.11, 0.14, 0.06]} />
              </mesh>
            </group>
          </group>

          {/* Right arm */}
          <group ref={armR} position={[0.42, 0.28, 0]}>
            <mesh position={[0, 0, 0]} castShadow material={skinMat}>
              <sphereGeometry args={[0.13, 20, 16]} />
            </mesh>
            <mesh position={[0, -0.28, 0]} castShadow material={skinMat}>
              <capsuleGeometry args={[0.1, 0.4, 6, 14]} />
            </mesh>
            <group ref={forearmR} position={[0, -0.55, 0]}>
              <mesh position={[0, -0.24, 0]} castShadow material={skinMat}>
                <capsuleGeometry args={[0.085, 0.4, 6, 14]} />
              </mesh>
              <mesh position={[0, -0.5, 0]} castShadow material={skinMat}>
                <boxGeometry args={[0.11, 0.14, 0.06]} />
              </mesh>
            </group>
          </group>
        </group>

        {/* Pelvis */}
        <mesh position={[0, -0.32, 0]} castShadow material={shortsMat}>
          <capsuleGeometry args={[0.3, 0.15, 6, 16]} />
        </mesh>
      </group>

      {/* Left leg */}
      <group ref={legL} position={[-0.16, 0.9, 0]}>
        {/* Quadricep */}
        <mesh position={[0, -0.32, 0]} castShadow material={shortsMat}>
          <capsuleGeometry args={[0.13, 0.5, 6, 16]} />
        </mesh>
        <group ref={shinL} position={[0, -0.72, 0]}>
          {/* Calf */}
          <mesh position={[0, -0.28, 0]} castShadow material={skinMat}>
            <capsuleGeometry args={[0.1, 0.48, 6, 14]} />
          </mesh>
          {/* Shoe */}
          <mesh position={[0, -0.58, 0.06]} castShadow material={shoeMat}>
            <boxGeometry args={[0.14, 0.09, 0.28]} />
          </mesh>
        </group>
      </group>

      {/* Right leg */}
      <group ref={legR} position={[0.16, 0.9, 0]}>
        <mesh position={[0, -0.32, 0]} castShadow material={shortsMat}>
          <capsuleGeometry args={[0.13, 0.5, 6, 16]} />
        </mesh>
        <group ref={shinR} position={[0, -0.72, 0]}>
          <mesh position={[0, -0.28, 0]} castShadow material={skinMat}>
            <capsuleGeometry args={[0.1, 0.48, 6, 14]} />
          </mesh>
          <mesh position={[0, -0.58, 0.06]} castShadow material={shoeMat}>
            <boxGeometry args={[0.14, 0.09, 0.28]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

function CameraRig({ angle }: { angle: CameraAngle }) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(...cameraPresets[angle]));

  useEffect(() => {
    targetPos.current.set(...cameraPresets[angle]);
  }, [angle]);

  useFrame((_, delta) => {
    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetPos.current.x, 4, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetPos.current.y, 4, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetPos.current.z, 4, delta);
    camera.lookAt(0, 1.15, 0);
    camera.updateProjectionMatrix();
  });

  return null;
}

export function Trainer3DViewer({ animationId, cameraAngle, paused }: Props) {
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

      {/* Studio lighting */}
      <ambientLight intensity={0.32} />
      <directionalLight
        position={[4, 6, 4]}
        intensity={1.35}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0005}
      />
      <pointLight position={[-3, 2.4, -1.5]} color="#b7ff52" intensity={0.9} distance={9} />
      <pointLight position={[3, 1.2, 3]} color="#5b8cff" intensity={0.35} distance={8} />

      <Suspense fallback={null}>
        <Environment preset="studio" background={false} />
        <Humanoid animationId={animationId} paused={paused} />
        <ContactShadows
          position={[0, 0.01, 0]}
          opacity={0.55}
          scale={6}
          blur={2.4}
          far={2.5}
          resolution={512}
        />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <circleGeometry args={[3.2, 64]} />
          <meshStandardMaterial color="#141519" roughness={0.75} metalness={0.15} />
        </mesh>
      </Suspense>

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        enableDamping
        dampingFactor={0.08}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 1.15, 0]}
      />
    </Canvas>
  );
}
