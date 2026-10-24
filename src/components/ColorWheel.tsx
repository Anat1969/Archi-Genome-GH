import React, { useMemo } from 'react';
import {
  CENTER, RINGS, SECTORS, OUTER_RADIUS, INNER_GAP, RING_THICKNESS,
  ROTATION_STEP_DEG, ringSectorPath, ringColor, sectorToBaseColor,
  polarToCartesian, sectorToNewtonName,
} from '@/hooks/useColorWheel';

interface ColorWheelProps {
  rotationOffset: number;
  isOpened: (ring: number, sector: number) => boolean;
  canSelectByMode: (ring: number, sector: number) => boolean;
  onCellClick: (ring: number, sector: number) => void;
  selectionLimit: number;
  openedCount: number;
  maskOpacity: number;
}

const ColorWheel: React.FC<ColorWheelProps> = ({
  rotationOffset, isOpened, canSelectByMode, onCellClick, selectionLimit, openedCount, maskOpacity,
}) => {
  const maskAlpha = maskOpacity / 100;

  const baseCells = useMemo(() => {
    const cells: { key: string; d: string; fill: string }[] = [];
    for (let ring = 0; ring < RINGS; ring++) {
      for (let sector = 0; sector < SECTORS; sector++) {
        const start = sector * ROTATION_STEP_DEG;
        const end = start + ROTATION_STEP_DEG;
        const innerR = INNER_GAP + ring * RING_THICKNESS;
        const outerR = INNER_GAP + (ring + 1) * RING_THICKNESS;
        cells.push({
          key: `base-${ring}-${sector}`,
          d: ringSectorPath(CENTER, CENTER, innerR, outerR, start, end),
          fill: ringColor(sectorToBaseColor(sector), ring),
        });
      }
    }
    return cells;
  }, []);

  const gridElements = useMemo(() => {
    const elements: React.ReactNode[] = [];
    for (let i = 1; i <= RINGS; i++) {
      elements.push(
        <circle key={`gc-${i}`} cx={CENTER} cy={CENTER} r={INNER_GAP + i * RING_THICKNESS}
          className="fill-none stroke-white/[0.78]" strokeWidth="3" />
      );
    }
    for (let s = 0; s < SECTORS; s++) {
      const angle = s * ROTATION_STEP_DEG;
      const p1 = polarToCartesian(CENTER, CENTER, INNER_GAP - 8, angle);
      const p2 = polarToCartesian(CENTER, CENTER, OUTER_RADIUS, angle);
      elements.push(
        <line key={`gl-${s}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
          className="stroke-white/[0.78]" strokeWidth="3" />
      );
    }
    return elements;
  }, []);

  const overlayCells = useMemo(() => {
    const cells: { key: string; d: string; ring: number; sector: number }[] = [];
    for (let ring = 0; ring < RINGS; ring++) {
      for (let sector = 0; sector < SECTORS; sector++) {
        const start = sector * ROTATION_STEP_DEG;
        const end = start + ROTATION_STEP_DEG;
        const innerR = INNER_GAP + ring * RING_THICKNESS;
        const outerR = INNER_GAP + (ring + 1) * RING_THICKNESS;
        cells.push({
          key: `ov-${ring}-${sector}`,
          d: ringSectorPath(CENTER, CENTER, innerR, outerR, start, end),
          ring, sector,
        });
      }
    }
    return cells;
  }, []);

  // Color name labels at the outer edge
  const colorLabels = useMemo(() => {
    const labels: React.ReactNode[] = [];
    for (let s = 0; s < SECTORS; s++) {
      const angle = (s + 0.5) * ROTATION_STEP_DEG;
      const pos = polarToCartesian(CENTER, CENTER, OUTER_RADIUS + 22, angle);
      const name = sectorToNewtonName(s);
      labels.push(
        <text key={`label-${s}`} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="central"
          className="fill-white/60 text-[10px] pointer-events-none select-none" fontFamily="system-ui">
          {name}
        </text>
      );
    }
    return labels;
  }, []);

  return (
    <div className="relative min-h-[420px] lg:min-h-[720px] grid place-items-center rounded-3xl border border-white/[0.08] overflow-hidden"
      style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))' }}>
      <svg viewBox="0 0 900 900" aria-label="גלגל צבעים אינטראקטיבי"
        className="w-[min(92vw,860px)] h-auto block">
        {/* Base color layer */}
        <g>
          {baseCells.map(cell => (
            <path key={cell.key} d={cell.d} fill={cell.fill} stroke="rgba(255,255,255,0.32)" strokeWidth="1.6" />
          ))}
        </g>

        {/* Overlay mask layer - rotates */}
        <g style={{
          transformOrigin: `${CENTER}px ${CENTER}px`,
          transform: `rotate(${rotationOffset * ROTATION_STEP_DEG}deg)`,
          transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          {overlayCells.map(cell => {
            const open = isOpened(cell.ring, cell.sector);
            const selectable = canSelectByMode(cell.ring, cell.sector);
            const canInteract = open || (openedCount < selectionLimit && selectable);

            return (
              <path
                key={cell.key}
                d={cell.d}
                className={`transition-opacity duration-150 ${canInteract ? 'cursor-pointer' : 'cursor-default'}`}
                fill={open ? 'transparent' : `hsl(var(--newton-mask) / ${maskAlpha})`}
                onClick={canInteract ? () => onCellClick(cell.ring, cell.sector) : undefined}
                aria-disabled={!canInteract}
              >
                <title>{sectorToNewtonName(cell.sector)} | טבעת {cell.ring + 1}</title>
              </path>
            );
          })}
        </g>

        {/* Grid lines */}
        <g>{gridElements}</g>

        {/* Center hole */}
        <circle cx={CENTER} cy={CENTER} r={INNER_GAP - 10}
          className="fill-[#f1f1ef] stroke-white/60" strokeWidth="2" />

        {/* Color labels */}
        {colorLabels}
      </svg>
    </div>
  );
};

export default React.memo(ColorWheel);
