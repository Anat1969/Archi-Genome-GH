

# Newton's Color Wheel - Convert to React & Enhance

## Summary
Convert the standalone HTML Newton's Color Wheel app into a polished React/TypeScript application within your Lovable project. The app will be fully RTL Hebrew, interactive, and enhanced with better UX, animations, and educational value.

## What the app does today
- Interactive SVG color wheel with 4 rings x 12 sectors
- Black overlay mask that reveals Newton's 7 colors when clicked
- Selection modes: free, same ring, same sector, symmetric
- Rotation of the mask layer (+/- 1 sector)
- Logical and psychological color analysis text (Hebrew)
- Selection limit (1-7 cells)

## Plan

### 1. Create the core color wheel component
Build `src/components/ColorWheel.tsx` - the SVG wheel with base color layer, overlay mask layer, grid lines, and center hole. All SVG generation logic (polar math, ring/sector paths, color mixing) moves here as clean TypeScript functions.

### 2. Create the controls panel component
Build `src/components/WheelControls.tsx` - the RTL sidebar with:
- Selection limit chips (1-7)
- Mode selection buttons (free, same ring, same sector, symmetric)
- Action buttons (rotate +/-, reset, new pattern)
- Status display and Newton's 7 colors legend

### 3. Create the analysis panel component
Build `src/components/ColorAnalysis.tsx` - the summary cards showing logical interpretation, psychological-spatial interpretation, decomposition text, and palette preview dots.

### 4. Create state management hook
Build `src/hooks/useColorWheel.ts` - custom hook managing all state (opened cells, rotation offset, selection limit, mode, anchor) and exposing handlers for click, rotate, reset, mode change. Contains the analysis logic (temperature, contrast, saturation).

### 5. Build the Index page
Replace `src/pages/Index.tsx` with the full layout: two-column grid (controls sidebar + wheel/analysis main area), dark theme background, RTL direction, responsive breakpoints for mobile.

### 6. Enhancements over the original

**Visual polish:**
- Smooth CSS transitions on rotation (transform with transition instead of instant snap)
- Hover glow effect on cells
- Animated reveal when a cell is opened (scale + fade)
- Better typography with font size hierarchy

**UX improvements:**
- Visual indicator showing which cells are valid to select in current mode (dim unavailable cells)
- Tooltip on hover showing color name and ring number
- Keyboard support: arrow keys to navigate, Enter/Space to select
- Undo last selection (not just full reset)

**Educational value:**
- Color name labels on the wheel (Newton's 7 color names in Hebrew)
- Brief explanation tooltip for each mode

**Responsive:**
- Single column on mobile with controls collapsible
- Touch-friendly larger tap targets

### 7. Update CSS theme
Add dark theme CSS variables to `src/index.css` matching the original's dark palette (`--bg: #0f1115`, accent blue `#8ab4ff`), applied via a wrapper class so it doesn't affect the rest of the app.

## Technical details

- All original vanilla JS logic is preserved but refactored into React patterns (useState, useCallback, useMemo)
- SVG stays inline (not an image) for interactivity
- No new dependencies needed - uses existing Tailwind, lucide-react icons, and shadcn components (Button, Tooltip, Card)
- RTL handled via `dir="rtl"` on the page wrapper
- Type-safe with interfaces for `CellPosition`, `WheelState`, `AnalysisResult`

## Files to create/modify
- `src/pages/Index.tsx` - main page layout
- `src/components/ColorWheel.tsx` - SVG wheel
- `src/components/WheelControls.tsx` - controls panel
- `src/components/ColorAnalysis.tsx` - analysis cards
- `src/hooks/useColorWheel.ts` - state & logic
- `src/index.css` - add dark theme variables

