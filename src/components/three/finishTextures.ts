import * as THREE from 'three';
import type { Finish } from '@/store/genomeStore';

// Procedural surface textures: generated once on a canvas, no network needed.
// Each finish yields a light grayscale "albedo" (multiplied by the slot color)
// and a bump/roughness map for believable micro-relief.

const SIZE = 512;

function rand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function canvas() {
  const c = document.createElement('canvas');
  c.width = c.height = SIZE;
  return [c, c.getContext('2d')!] as const;
}

function speckle(ctx: CanvasRenderingContext2D, r: () => number, amount: number, base: number, spread: number, size = 2) {
  for (let i = 0; i < amount; i++) {
    const v = Math.round(base + (r() - 0.5) * spread);
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.fillRect(r() * SIZE, r() * SIZE, size * r() + 0.6, size * r() + 0.6);
  }
}

function drawFinish(finish: Finish, ctx: CanvasRenderingContext2D, forBump: boolean) {
  const r = rand(finish.length * 977 + (forBump ? 13 : 1));
  const base = forBump ? 128 : 236;
  ctx.fillStyle = `rgb(${base},${base},${base})`;
  ctx.fillRect(0, 0, SIZE, SIZE);

  switch (finish) {
    case 'plaster':
      speckle(ctx, r, 26000, base, forBump ? 70 : 18, 2.2);
      break;
    case 'stone': {
      // Ashlar courses: 4 rows, staggered blocks, recessed joints
      const rows = 4, rowH = SIZE / rows;
      for (let row = 0; row < rows; row++) {
        const blocks = 2;
        const offset = row % 2 ? SIZE / blocks / 2 : 0;
        for (let b = -1; b < blocks + 1; b++) {
          const shade = Math.round(base + (r() - 0.5) * (forBump ? 30 : 26));
          ctx.fillStyle = `rgb(${shade},${shade - (forBump ? 0 : 4)},${shade - (forBump ? 0 : 10)})`;
          ctx.fillRect(b * (SIZE / blocks) + offset + 3, row * rowH + 3, SIZE / blocks - 6, rowH - 6);
        }
      }
      speckle(ctx, r, 18000, base, forBump ? 60 : 22, 2.5);
      ctx.fillStyle = forBump ? 'rgb(40,40,40)' : 'rgb(200,196,188)';
      for (let row = 0; row <= rows; row++) ctx.fillRect(0, row * rowH - 2, SIZE, 4);
      for (let row = 0; row < rows; row++) {
        const offset = row % 2 ? SIZE / 4 : 0;
        for (let b = 0; b <= 2; b++) ctx.fillRect(b * (SIZE / 2) + offset - 2, row * rowH, 4, rowH);
      }
      break;
    }
    case 'concrete': {
      speckle(ctx, r, 20000, base, forBump ? 50 : 26, 2);
      // bug holes
      for (let i = 0; i < 260; i++) {
        ctx.fillStyle = forBump ? 'rgb(60,60,60)' : 'rgb(190,190,190)';
        ctx.beginPath();
        ctx.arc(r() * SIZE, r() * SIZE, r() * 2.2 + 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      // formwork panel joints and tie holes
      ctx.fillStyle = forBump ? 'rgb(70,70,70)' : 'rgb(205,205,205)';
      ctx.fillRect(0, SIZE / 2 - 1, SIZE, 2);
      ctx.fillRect(SIZE / 2 - 1, 0, 2, SIZE);
      for (const x of [SIZE / 8, (3 * SIZE) / 8, (5 * SIZE) / 8, (7 * SIZE) / 8])
        for (const y of [SIZE / 4, (3 * SIZE) / 4]) {
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      break;
    }
    case 'wood': {
      for (let x = 0; x < SIZE; x += 2) {
        const v = Math.round(base + Math.sin(x * 0.09 + r() * 0.6) * (forBump ? 40 : 14) + (r() - 0.5) * 10);
        ctx.fillStyle = `rgb(${v},${v},${v})`;
        ctx.fillRect(x, 0, 2, SIZE);
      }
      ctx.fillStyle = forBump ? 'rgb(30,30,30)' : 'rgb(170,170,170)';
      for (let x = 0; x < SIZE; x += SIZE / 8) ctx.fillRect(x, 0, 3, SIZE);
      break;
    }
    case 'metal':
      for (let y = 0; y < SIZE; y++) {
        const v = Math.round(base + (r() - 0.5) * (forBump ? 24 : 8));
        ctx.fillStyle = `rgb(${v},${v},${v})`;
        ctx.fillRect(0, y, SIZE, 1);
      }
      break;
  }
}

const cache = new Map<string, THREE.CanvasTexture>();

export function finishTexture(finish: Finish, kind: 'albedo' | 'bump'): THREE.CanvasTexture {
  const key = `${finish}:${kind}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const [c, ctx] = canvas();
  drawFinish(finish, ctx, kind === 'bump');
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  if (kind === 'albedo') tex.colorSpace = THREE.SRGBColorSpace;
  const t = 1 / FINISH_PHYSICS[finish].tile;
  tex.repeat.set(t, t);
  cache.set(key, tex);
  return tex;
}

/** `tile` is the real-world size in meters covered by one texture repeat. */
export const FINISH_PHYSICS: Record<Finish, { roughness: number; metalness: number; bumpScale: number; tile: number }> = {
  plaster: { roughness: 0.92, metalness: 0, bumpScale: 0.6, tile: 3 },
  stone: { roughness: 0.82, metalness: 0, bumpScale: 2.2, tile: 1.2 },
  concrete: { roughness: 0.88, metalness: 0, bumpScale: 1.4, tile: 2.4 },
  metal: { roughness: 0.38, metalness: 0.75, bumpScale: 0.25, tile: 2 },
  wood: { roughness: 0.7, metalness: 0, bumpScale: 1.2, tile: 1.6 },
};

/**
 * Box geometry whose UVs are expressed in meters, so a texture with
 * repeat = 1/tile keeps the same physical scale on every face and size.
 */
export function worldBox(w: number, h: number, d: number): THREE.BoxGeometry {
  const g = new THREE.BoxGeometry(w, h, d);
  const uv = g.attributes.uv as THREE.BufferAttribute;
  // face order: +x, -x, +y, -y, +z, -z — 4 vertices each
  const dims: [number, number][] = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) {
    for (let v = 0; v < 4; v++) {
      const i = f * 4 + v;
      uv.setXY(i, uv.getX(i) * dims[f][0], uv.getY(i) * dims[f][1]);
    }
  }
  uv.needsUpdate = true;
  return g;
}
