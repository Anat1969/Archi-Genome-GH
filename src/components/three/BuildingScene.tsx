import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, OrbitControls, PerformanceMonitor, Sky, Stars } from '@react-three/drei';
import { EffectComposer, N8AO, Bloom, ToneMapping, Vignette, SMAA } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import type { Palette, SlotKey } from '@/store/genomeStore';
import { SLOT_ORDER } from '@/store/genomeStore';
import { finishTexture, FINISH_PHYSICS, worldBox } from './finishTextures';
import { sunColor, sunPosition } from '@/lib/sun';

// ---------------------------------------------------------------------------
// Building dimensions (meters). South facade faces +z.
// ---------------------------------------------------------------------------
const W = 24, D = 14, GROUND_H = 4.5, FLOOR_H = 3.2, FLOORS = 6;
const TOP = GROUND_H + FLOORS * FLOOR_H;
const BAY = { x0: 3.2, x1: 11.8, depth: 1.2 };
const BALCONY = { x0: -12, x1: 0.8, depth: 1.6 };

export type CameraPreset = 'street' | 'aerial' | 'elevation' | 'corner';

export const CAMERA_PRESETS: Record<CameraPreset, { label: string; pos: [number, number, number]; target: [number, number, number] }> = {
  street: { label: 'גובה הולך רגל', pos: [16, 1.7, 30], target: [0, 9, 4] },
  corner: { label: 'פינת רחוב', pos: [34, 14, 34], target: [0, 11, 0] },
  aerial: { label: 'מבט אווירי', pos: [-30, 48, 44], target: [0, 8, 0] },
  elevation: { label: 'חזית דרומית', pos: [0, 12.5, 62], target: [0, 12.5, 0] },
};

export interface SceneSettings {
  month: number;
  hour: number;
  quality: 'high' | 'eco';
  preset: CameraPreset;
  autoRotate: boolean;
  showPeople: boolean;
}

// ---------------------------------------------------------------------------
// Materials: one material per palette slot, colors ease toward their targets.
// ---------------------------------------------------------------------------
type SlotMaterials = Record<SlotKey, THREE.MeshStandardMaterial>;

function useSlotMaterials(palette: Palette): SlotMaterials {
  const mats = useMemo(() => {
    const out = {} as SlotMaterials;
    for (const k of SLOT_ORDER) {
      out[k] = new THREE.MeshStandardMaterial({ color: palette[k].color });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // finish → textures & physical response (instant)
  useEffect(() => {
    for (const k of SLOT_ORDER) {
      const m = mats[k];
      const f = palette[k].finish;
      const phys = FINISH_PHYSICS[f];
      m.map = finishTexture(f, 'albedo');
      m.bumpMap = finishTexture(f, 'bump');
      m.bumpScale = phys.bumpScale;
      m.roughness = phys.roughness;
      m.metalness = phys.metalness;
      m.needsUpdate = true;
    }
  }, [mats, palette]);

  // color → smooth transition
  const targets = useMemo(() => {
    const t = {} as Record<SlotKey, THREE.Color>;
    for (const k of SLOT_ORDER) t[k] = new THREE.Color(palette[k].color);
    return t;
  }, [palette]);

  useFrame((_, dt) => {
    const a = 1 - Math.pow(0.002, dt);
    for (const k of SLOT_ORDER) mats[k].color.lerp(targets[k], a);
  });

  return mats;
}

// ---------------------------------------------------------------------------
// Window layout
// ---------------------------------------------------------------------------
interface WindowSpec { x: number; y: number; z: number; ry: number; w: number; h: number }

function computeWindows(): WindowSpec[] {
  const out: WindowSpec[] = [];
  for (let f = 0; f < FLOORS; f++) {
    const base = GROUND_H + f * FLOOR_H;
    // South: balcony doors on the left wing
    for (const x of [-10, -6.2, -2.4]) out.push({ x, y: base + 0.15 + 1.25, z: D / 2 + 0.01, ry: 0, w: 2.8, h: 2.5 });
    // South: bay windows
    for (const x of [5.4, 9.6]) out.push({ x, y: base + 0.8 + 0.85, z: D / 2 + BAY.depth + 0.01, ry: 0, w: 2.8, h: 1.7 });
    // North
    for (const x of [-9.5, -5.7, -1.9, 1.9, 5.7, 9.5]) out.push({ x, y: base + 0.9 + 0.75, z: -D / 2 - 0.01, ry: Math.PI, w: 1.6, h: 1.5 });
    // East & West
    for (const z of [-4, 0, 4]) {
      out.push({ x: W / 2 + 0.01, y: base + 0.9 + 0.75, z, ry: Math.PI / 2, w: 1.4, h: 1.5 });
      out.push({ x: -W / 2 - 0.01, y: base + 0.9 + 0.75, z, ry: -Math.PI / 2, w: 1.4, h: 1.5 });
    }
  }
  return out;
}

function deterministicLit(i: number) {
  return ((i * 9301 + 49297) % 233280) / 233280 > 0.45;
}

function Windows({ frames, nightFactor }: { frames: THREE.Material; nightFactor: number }) {
  const windows = useMemo(computeWindows, []);
  const glassRef = useRef<THREE.InstancedMesh>(null);
  const litRef = useRef<THREE.InstancedMesh>(null);
  const frameRef = useRef<THREE.InstancedMesh>(null);
  const revealRef = useRef<THREE.InstancedMesh>(null);

  const lit = useMemo(() => windows.map((_, i) => deterministicLit(i)), [windows]);

  const glassMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: '#40566a', roughness: 0.06, metalness: 0.55, envMapIntensity: 2.6, clearcoat: 1, clearcoatRoughness: 0.04 }),
    [],
  );
  const litMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2a2018', emissive: '#ffb866', emissiveIntensity: 0, roughness: 0.3 }), []);
  const revealMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#15181b', roughness: 0.9 }), []);

  useEffect(() => {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
    const e = new THREE.Euler();
    let gi = 0, li = 0, fi = 0;
    windows.forEach((win, i) => {
      e.set(0, win.ry, 0);
      q.setFromEuler(e);
      const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(q);
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(q);
      // dark reveal (recess illusion) behind the glass
      p.set(win.x, win.y, win.z).addScaledVector(normal, 0.005);
      s.set(win.w + 0.12, win.h + 0.12, 1);
      m.compose(p, q, s);
      revealRef.current!.setMatrixAt(i, m);

      p.set(win.x, win.y, win.z).addScaledVector(normal, 0.02);
      s.set(win.w, win.h, 1);
      m.compose(p, q, s);
      if (lit[i]) litRef.current!.setMatrixAt(li++, m);
      else glassRef.current!.setMatrixAt(gi++, m);

      // frame: top, bottom (sill), left, right, mullion
      const t = 0.07, depth = 0.12;
      const bars: [number, number, number, number, number][] = [
        [0, win.h / 2, win.w + t, t, depth],
        [0, -win.h / 2, win.w + 0.25, t * 1.4, depth * 2.2],
        [-win.w / 2, 0, t, win.h, depth],
        [win.w / 2, 0, t, win.h, depth],
        [0, 0, t * 0.8, win.h, depth * 0.8],
      ];
      for (const [dx, dy, bw, bh, bd] of bars) {
        p.set(win.x, win.y + dy, win.z).addScaledVector(right, dx).addScaledVector(normal, bd / 2);
        s.set(bw, bh, bd);
        m.compose(p, q, s);
        frameRef.current!.setMatrixAt(fi++, m);
      }
    });
    for (const r of [glassRef, litRef, frameRef, revealRef]) r.current!.instanceMatrix.needsUpdate = true;
    glassRef.current!.count = gi;
    litRef.current!.count = li;
  }, [windows, lit]);

  useFrame((_, dt) => {
    litMat.emissiveIntensity = THREE.MathUtils.lerp(litMat.emissiveIntensity, nightFactor * 2.4, 1 - Math.pow(0.01, dt));
    const night = nightFactor > 0.3;
    litMat.color.set(night ? '#3a2a18' : '#40566a');
    litMat.roughness = night ? 0.5 : 0.06;
    litMat.metalness = night ? 0 : 0.55;
    litMat.envMapIntensity = night ? 1 : 2.6;
  });

  const n = windows.length;
  return (
    <group>
      <instancedMesh ref={revealRef} args={[undefined, undefined, n]} material={revealMat} receiveShadow>
        <planeGeometry />
      </instancedMesh>
      <instancedMesh ref={glassRef} args={[undefined, undefined, n]} material={glassMat} receiveShadow>
        <planeGeometry />
      </instancedMesh>
      <instancedMesh ref={litRef} args={[undefined, undefined, n]} material={litMat}>
        <planeGeometry />
      </instancedMesh>
      <instancedMesh ref={frameRef} args={[undefined, undefined, n * 5]} material={frames} castShadow receiveShadow>
        <boxGeometry />
      </instancedMesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Building massing
// ---------------------------------------------------------------------------
function Block({ size, position, material, cast = true }: {
  size: [number, number, number]; position: [number, number, number]; material: THREE.Material; cast?: boolean;
}) {
  const [w, h, d] = size;
  const geo = useMemo(() => worldBox(w, h, d), [w, h, d]);
  useEffect(() => () => geo.dispose(), [geo]);
  return <mesh geometry={geo} position={position} material={material} castShadow={cast} receiveShadow />;
}

function Building({ palette, nightFactor }: { palette: Palette; nightFactor: number }) {
  const m = useSlotMaterials(palette);

  const railGlass = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: '#a9c4cc', transparent: true, opacity: 0.28, roughness: 0.05, metalness: 0, envMapIntensity: 1.2 }),
    [],
  );
  const storefront = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: '#3a4d5c', roughness: 0.05, metalness: 0.5, clearcoat: 1, envMapIntensity: 2.4, emissive: '#ffcf8a', emissiveIntensity: 0 }),
    [],
  );
  const mech = useMemo(() => new THREE.MeshStandardMaterial({ color: '#8d8f91', roughness: 0.8 }), []);

  useFrame((_, dt) => {
    storefront.emissiveIntensity = THREE.MathUtils.lerp(storefront.emissiveIntensity, nightFactor * 0.9, 1 - Math.pow(0.01, dt));
  });

  const floors = Array.from({ length: FLOORS }, (_, f) => GROUND_H + f * FLOOR_H);
  const bayW = BAY.x1 - BAY.x0, bayX = (BAY.x0 + BAY.x1) / 2;
  const balW = BALCONY.x1 - BALCONY.x0, balX = (BALCONY.x0 + BALCONY.x1) / 2;
  const finCount = 12;

  return (
    <group>
      {/* Ground floor: recessed base with storefront */}
      <Block size={[W - 1.2, GROUND_H, D - 1.2]} position={[0, GROUND_H / 2, 0]} material={m.base} />
      {Array.from({ length: 8 }, (_, i) => {
        const x = -9.6 + i * 2.75;
        if (Math.abs(x) < 1.6) return null;
        return <mesh key={i} position={[x, 1.95, D / 2 - 0.58]} material={storefront} receiveShadow>
          <planeGeometry args={[2.55, 3.3]} />
        </mesh>;
      })}
      {Array.from({ length: 9 }, (_, i) => (
        <Block key={`mul${i}`} size={[0.1, 3.4, 0.14]} position={[-11 + i * 2.75, 1.9, D / 2 - 0.52]} material={m.frames} />
      ))}
      {/* Entrance door + canopy */}
      <mesh position={[0, 1.4, D / 2 - 0.57]} material={storefront}><planeGeometry args={[2.6, 2.8]} /></mesh>
      <Block size={[6.4, 0.16, 2.6]} position={[0, 3.6, D / 2 + 0.7]} material={m.accent} />
      {/* Pilotis under the overhang */}
      {[-11.4, -5.7, 5.7, 11.4].map(x => (
        <Block key={`col${x}`} size={[0.45, GROUND_H, 0.45]} position={[x, GROUND_H / 2, D / 2 - 0.35]} material={m.secondary} />
      ))}

      {/* Main body */}
      <Block size={[W, TOP - GROUND_H, D]} position={[0, (TOP + GROUND_H) / 2, 0]} material={m.body} />

      {/* Slab edge bands */}
      {floors.map(y => (
        <Block key={`band${y}`} size={[W + 0.1, 0.22, D + 0.1]} position={[0, y, 0]} material={m.secondary} cast={false} />
      ))}

      {/* Projecting bay */}
      <Block size={[bayW, TOP - GROUND_H, BAY.depth]} position={[bayX, (TOP + GROUND_H) / 2, D / 2 + BAY.depth / 2]} material={m.secondary} />
      {/* Vertical fins on the bay */}
      {Array.from({ length: finCount }, (_, i) => (
        <Block key={`fin${i}`} size={[0.07, TOP - GROUND_H - 0.4, 0.5]}
          position={[BAY.x0 + 0.35 + (i * (bayW - 0.7)) / (finCount - 1), (TOP + GROUND_H) / 2, D / 2 + BAY.depth + 0.3]}
          material={m.accent} />
      ))}

      {/* Balconies with glass rails */}
      {floors.map(y => (
        <group key={`bal${y}`}>
          <Block size={[balW, 0.22, BALCONY.depth]} position={[balX, y + 0.02, D / 2 + BALCONY.depth / 2]} material={m.secondary} />
          <mesh position={[balX, y + 0.62, D / 2 + BALCONY.depth - 0.04]} material={railGlass}>
            <planeGeometry args={[balW - 0.1, 0.95]} />
          </mesh>
          <Block size={[balW, 0.06, 0.08]} position={[balX, y + 1.1, D / 2 + BALCONY.depth - 0.04]} material={m.frames} />
          {Array.from({ length: 6 }, (_, i) => (
            <Block key={i} size={[0.05, 1.0, 0.05]} position={[BALCONY.x0 + 0.1 + i * ((balW - 0.2) / 5), y + 0.6, D / 2 + BALCONY.depth - 0.04]} material={m.frames} cast={false} />
          ))}
        </group>
      ))}

      <Windows frames={m.frames} nightFactor={nightFactor} />

      {/* Roof: parapet, mechanical room, pergola */}
      <Block size={[W + 0.3, 1.1, 0.3]} position={[0, TOP + 0.55, D / 2]} material={m.roof} />
      <Block size={[W + 0.3, 1.1, 0.3]} position={[0, TOP + 0.55, -D / 2]} material={m.roof} />
      <Block size={[0.3, 1.1, D]} position={[W / 2, TOP + 0.55, 0]} material={m.roof} />
      <Block size={[0.3, 1.1, D]} position={[-W / 2, TOP + 0.55, 0]} material={m.roof} />
      <Block size={[5, 2.6, 4]} position={[6.5, TOP + 1.3, -3]} material={mech} />
      {Array.from({ length: 4 }, (_, i) => (
        <Block key={`pp${i}`} size={[0.18, 2.6, 0.18]} position={[-9 + (i % 2) * 7, TOP + 1.3, -2 + Math.floor(i / 2) * 6]} material={m.frames} />
      ))}
      {Array.from({ length: 16 }, (_, i) => (
        <Block key={`slat${i}`} size={[0.08, 0.22, 6.4]} position={[-9.2 + i * 0.48, TOP + 2.7, 1]} material={m.accent} />
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Site
// ---------------------------------------------------------------------------
function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const leaves = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(1, 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const k = 0.82 + (Math.sin(i * 12.9898) * 43758.5453 % 1 + 1) % 1 * 0.36;
      pos.setXYZ(i, pos.getX(i) * k, pos.getY(i) * k * 0.85, pos.getZ(i) * k);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1.6, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.2, 3.2, 8]} />
        <meshStandardMaterial color="#5b4636" roughness={0.95} />
      </mesh>
      <mesh geometry={leaves} position={[0, 4.2, 0]} scale={[2.2, 2.2, 2.2]} castShadow receiveShadow>
        <meshStandardMaterial color="#4f6b3a" roughness={0.9} flatShading />
      </mesh>
      <mesh geometry={leaves} position={[0.9, 3.6, 0.5]} scale={[1.3, 1.3, 1.3]} castShadow>
        <meshStandardMaterial color="#5d7a42" roughness={0.9} flatShading />
      </mesh>
    </group>
  );
}

function Person({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.82, 0]} castShadow>
        <capsuleGeometry args={[0.2, 1.0, 4, 10]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.6, 0]} castShadow>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color="#c9a78a" roughness={0.7} />
      </mesh>
    </group>
  );
}

function Site({ showPeople, nightFactor }: { showPeople: boolean; nightFactor: number }) {
  const paving = useMemo(() => {
    const t = finishTexture('stone', 'albedo').clone();
    t.repeat.set(30, 6);
    t.needsUpdate = true;
    return t;
  }, []);
  const lampMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#fff3d6', emissive: '#ffd9a0', emissiveIntensity: 0 }), []);
  useFrame(() => { lampMat.emissiveIntensity = nightFactor * 4; });

  return (
    <group>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[260, 260]} />
        <meshStandardMaterial color="#6f7368" roughness={1} />
      </mesh>
      {/* Sidewalk */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0, 10]} receiveShadow>
        <planeGeometry args={[90, 6]} />
        <meshStandardMaterial map={paving} color="#c9c3b6" roughness={0.85} />
      </mesh>
      {/* Plaza around building */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} receiveShadow>
        <planeGeometry args={[34, 20]} />
        <meshStandardMaterial color="#b9b2a4" roughness={0.9} />
      </mesh>
      {/* Curb */}
      <mesh position={[0, 0.08, 13.05]} receiveShadow castShadow>
        <boxGeometry args={[90, 0.16, 0.2]} />
        <meshStandardMaterial color="#9c9a94" roughness={0.9} />
      </mesh>
      {/* Street */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 20]} receiveShadow>
        <planeGeometry args={[90, 14]} />
        <meshStandardMaterial color="#2d2f32" roughness={0.95} />
      </mesh>
      {Array.from({ length: 14 }, (_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-42 + i * 6.5, 0.0, 20]}>
          <planeGeometry args={[3, 0.15]} />
          <meshStandardMaterial color="#e8e4d8" roughness={0.6} />
        </mesh>
      ))}
      {/* Trees & lamps */}
      {[-16, -6, 4, 14, 24].map((x, i) => <Tree key={x} position={[x, 0, 11.6]} scale={0.9 + (i % 3) * 0.12} />)}
      {[-20, 9, 30].map(x => (
        <group key={`lamp${x}`} position={[x, 0, 12.5]}>
          <mesh position={[0, 2.5, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.07, 5, 8]} />
            <meshStandardMaterial color="#2b2e31" metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh position={[0, 5.05, 0]} material={lampMat}>
            <sphereGeometry args={[0.18, 12, 12]} />
          </mesh>
          {nightFactor > 0.2 && <pointLight position={[0, 4.8, 0]} intensity={nightFactor * 30} distance={14} color="#ffd9a0" />}
        </group>
      ))}
      {showPeople && (
        <>
          <Person position={[3.2, 0, 9.4]} color="#3d5a80" />
          <Person position={[4.0, 0, 10.1]} color="#b5523b" />
          <Person position={[-8.5, 0, 9.0]} color="#4a4a4a" />
        </>
      )}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Lighting, camera rig, capture
// ---------------------------------------------------------------------------
function SunLight({ month, hour }: { month: number; hour: number }) {
  const ref = useRef<THREE.DirectionalLight>(null);
  const sun = useMemo(() => sunPosition(month, hour), [month, hour]);
  const color = useMemo(() => new THREE.Color(sunColor(sun.altitude)), [sun.altitude]);
  const intensity = sun.altitude <= 0 ? 0 : Math.min(3.2, 0.6 + Math.sin((sun.altitude * Math.PI) / 180) * 3.2);
  const pos: [number, number, number] = [sun.direction[0] * 80, Math.max(sun.direction[1], 0.02) * 80, sun.direction[2] * 80];

  useEffect(() => {
    if (ref.current) ref.current.target.position.set(0, 8, 0);
    ref.current?.target.updateMatrixWorld();
  });

  return (
    <>
      <directionalLight
        ref={ref}
        position={pos}
        intensity={intensity}
        color={color}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-camera-left={-36}
        shadow-camera-right={36}
        shadow-camera-top={36}
        shadow-camera-bottom={-36}
        shadow-camera-near={1}
        shadow-camera-far={200}
      />
      <hemisphereLight args={[sun.altitude > 0 ? '#cfe3ff' : '#1d2a4a', '#5b5245', sun.altitude > 0 ? 0.55 : 0.18]} />
      <Sky
        distance={4500}
        sunPosition={pos}
        turbidity={sun.altitude < 10 ? 8 : 2.2}
        rayleigh={sun.altitude < 10 ? 3 : 2.2}
        mieCoefficient={0.004}
        mieDirectionalG={0.85}
      />
      {sun.altitude < 2 && <Stars radius={300} depth={60} count={2500} factor={4} fade speed={0.6} />}
    </>
  );
}

function CameraRig({ preset }: { preset: CameraPreset }) {
  const { camera, controls } = useThree() as unknown as { camera: THREE.PerspectiveCamera; controls: { target: THREE.Vector3; update: () => void } | null };
  const flying = useRef(true);
  const goal = useMemo(() => ({
    pos: new THREE.Vector3(...CAMERA_PRESETS[preset].pos),
    target: new THREE.Vector3(...CAMERA_PRESETS[preset].target),
  }), [preset]);

  useEffect(() => { flying.current = true; }, [goal]);

  useFrame((_, dt) => {
    if (!flying.current || !controls) return;
    const a = 1 - Math.pow(0.02, dt);
    camera.position.lerp(goal.pos, a);
    controls.target.lerp(goal.target, a);
    controls.update();
    if (camera.position.distanceTo(goal.pos) < 0.05) flying.current = false;
  });

  useEffect(() => {
    const stop = () => { flying.current = false; };
    window.addEventListener('pointerdown', stop);
    window.addEventListener('wheel', stop);
    return () => { window.removeEventListener('pointerdown', stop); window.removeEventListener('wheel', stop); };
  }, []);

  return null;
}

function CaptureBridge({ onReady }: { onReady?: (capture: () => string) => void }) {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    onReady?.(() => {
      gl.render(scene, camera);
      return gl.domElement.toDataURL('image/png');
    });
  }, [gl, scene, camera, onReady]);
  return null;
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------
export default function BuildingScene({ palette, settings, onCaptureReady }: {
  palette: Palette;
  settings: SceneSettings;
  onCaptureReady?: (capture: () => string) => void;
}) {
  const sun = sunPosition(settings.month, settings.hour);
  const nightFactor = THREE.MathUtils.clamp((4 - sun.altitude) / 10, 0, 1);
  const high = settings.quality === 'high';
  // Drop resolution automatically on slow GPUs, raise it back when there is headroom.
  const [dpr, setDpr] = useState(() => Math.min(window.devicePixelRatio || 1, high ? 2 : 1.25));

  return (
    <Canvas
      shadows
      dpr={dpr}
      gl={{ preserveDrawingBuffer: true, antialias: !high, powerPreference: 'high-performance' }}
      camera={{ position: CAMERA_PRESETS.corner.pos, fov: 38, near: 0.3, far: 6000 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.NoToneMapping;
      }}
    >
      <PerformanceMonitor
        onDecline={() => setDpr(d => Math.max(0.75, d - 0.25))}
        onIncline={() => setDpr(d => Math.min(high ? 2 : 1.25, window.devicePixelRatio || 1, d + 0.25))}
      />
      <color attach="background" args={['#0b0d11']} />
      <fog attach="fog" args={[sun.altitude > 0 ? '#bfd0e2' : '#0d1424', 160, 900]} />
      <SunLight month={settings.month} hour={settings.hour} />
      <Environment resolution={256} frames={1}>
        <color attach="background" args={['#9fb6cf']} />
        <Lightformer form="rect" intensity={2.4} position={[0, 60, 0]} rotation-x={Math.PI / 2} scale={[200, 200, 1]} color="#cfe0f5" />
        <Lightformer form="rect" intensity={2} position={[0, 30, -40]} scale={[80, 30, 1]} color="#dfe9f5" />
        <Lightformer form="rect" intensity={1.4} position={[0, 12, 60]} rotation-y={Math.PI} scale={[160, 18, 1]} color="#e9f1fb" />
        <Lightformer form="rect" intensity={0.8} position={[-50, 10, 0]} rotation-y={Math.PI / 2} scale={[60, 20, 1]} color="#ffe8cf" />
        <Lightformer form="rect" intensity={0.6} position={[50, 10, 0]} rotation-y={-Math.PI / 2} scale={[60, 20, 1]} color="#cfe0ff" />
        <Lightformer form="rect" intensity={0.4} position={[0, -5, 40]} rotation-x={Math.PI} scale={[100, 10, 1]} color="#8a8070" />
      </Environment>

      <Building palette={palette} nightFactor={nightFactor} />
      <Site showPeople={settings.showPeople} nightFactor={nightFactor} />

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={6}
        maxDistance={140}
        maxPolarAngle={Math.PI / 2 - 0.02}
        autoRotate={settings.autoRotate}
        autoRotateSpeed={0.5}
        target={CAMERA_PRESETS.corner.target}
      />
      <CameraRig preset={settings.preset} />
      <CaptureBridge onReady={onCaptureReady} />

      {high ? (
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <N8AO aoRadius={1.6} intensity={2.2} distanceFalloff={1} quality="medium" halfRes />
          <Bloom intensity={0.55} luminanceThreshold={0.92} luminanceSmoothing={0.2} mipmapBlur />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          <Vignette offset={0.25} darkness={0.55} />
          <SMAA />
        </EffectComposer>
      ) : (
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
