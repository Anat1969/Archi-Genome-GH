import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, Lightformer } from '@react-three/drei';

// A double helix whose base pairs are the colors of a palette — the visual
// metaphor of the app: a building's color "genome".

const PAIRS = 26;
const RADIUS = 1.35;
const RISE = 0.24;
const TWIST = 0.42;

function Helix({ colors }: { colors: string[] }) {
  const group = useRef<THREE.Group>(null);
  const nodes = useRef<THREE.InstancedMesh>(null);
  const rungs = useRef<THREE.InstancedMesh>(null);

  const palette = useMemo(() => colors.map(c => new THREE.Color(c)), [colors]);

  useEffect(() => {
    const m = new THREE.Matrix4();
    const up = new THREE.Vector3(0, 1, 0);
    const q = new THREE.Quaternion();
    const height = PAIRS * RISE;
    for (let i = 0; i < PAIRS; i++) {
      const y = i * RISE - height / 2;
      const a = i * TWIST;
      const p1 = new THREE.Vector3(Math.cos(a) * RADIUS, y, Math.sin(a) * RADIUS);
      const p2 = new THREE.Vector3(-Math.cos(a) * RADIUS, y, -Math.sin(a) * RADIUS);
      const c1 = palette[i % palette.length];
      const c2 = palette[(i + Math.ceil(palette.length / 2)) % palette.length];

      m.makeTranslation(p1.x, p1.y, p1.z);
      nodes.current!.setMatrixAt(i * 2, m);
      nodes.current!.setColorAt(i * 2, c1);
      m.makeTranslation(p2.x, p2.y, p2.z);
      nodes.current!.setMatrixAt(i * 2 + 1, m);
      nodes.current!.setColorAt(i * 2 + 1, c2);

      const mid = p1.clone().add(p2).multiplyScalar(0.5);
      const dir = p2.clone().sub(p1).normalize();
      q.setFromUnitVectors(up, dir);
      m.compose(mid, q, new THREE.Vector3(1, RADIUS * 2, 1));
      rungs.current!.setMatrixAt(i, m);
      rungs.current!.setColorAt(i, c1.clone().lerp(c2, 0.5));
    }
    nodes.current!.instanceMatrix.needsUpdate = true;
    rungs.current!.instanceMatrix.needsUpdate = true;
    if (nodes.current!.instanceColor) nodes.current!.instanceColor.needsUpdate = true;
    if (rungs.current!.instanceColor) rungs.current!.instanceColor.needsUpdate = true;
  }, [palette]);

  useFrame(({ clock, pointer }) => {
    if (!group.current) return;
    group.current.rotation.y = clock.elapsedTime * 0.35 + pointer.x * 0.4;
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -pointer.y * 0.18, 0.05);
  });

  return (
    <group ref={group} rotation={[0, 0, 0.32]}>
      <instancedMesh ref={nodes} args={[undefined, undefined, PAIRS * 2]}>
        <sphereGeometry args={[0.17, 24, 24]} />
        <meshPhysicalMaterial roughness={0.18} metalness={0.05} clearcoat={1} clearcoatRoughness={0.1}  />
      </instancedMesh>
      <instancedMesh ref={rungs} args={[undefined, undefined, PAIRS]}>
        <cylinderGeometry args={[0.03, 0.03, 1, 8]} />
        <meshStandardMaterial roughness={0.4} transparent opacity={0.75} />
      </instancedMesh>
    </group>
  );
}

export default function GenomeHelix({ colors }: { colors: string[] }) {
  return (
    <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 11], fov: 40 }} gl={{ alpha: true, antialias: true }}>
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 5]} intensity={2.2} />
      <pointLight position={[-4, -2, 3]} intensity={18} color="#77a5ff" />
      <Environment resolution={128} frames={1}>
        <Lightformer form="ring" intensity={3} position={[0, 4, 6]} scale={6} color="#ffffff" />
        <Lightformer form="rect" intensity={1.5} position={[-6, 0, 0]} rotation-y={Math.PI / 2} scale={[10, 6, 1]} color="#a7c5ff" />
      </Environment>
      <Float speed={1.4} rotationIntensity={0.15} floatIntensity={0.6}>
        <Helix colors={colors} />
      </Float>
    </Canvas>
  );
}
