# CSS Restoration Guide

## If the MapLibre/Cesium CSS removal breaks anything:

### Step 1: Restore original globals.css
```bash
cp src/app/globals.css.backup src/app/globals.css
```

### Step 2: Verify backup exists
The backup was created with current content including:
- MapLibre CSS import (line 6)
- Cesium CSS import (line 9)
- All positioning override rules (lines 39-68)

### Step 3: If positioning still broken after restore
The original issue was MapLibre CSS overriding Tailwind. The backup contains all the !important fixes.

### Original problematic lines that will be removed:
```css
/* Line 6 */
@import 'maplibre-gl/dist/maplibre-gl.css';

/* Line 9 */
@import 'cesium/Build/Cesium/Widgets/widgets.css';
```

### Components that have their own CSS imports (should work fine):
- MapGlobe.tsx: imports 'mapbox-gl/dist/mapbox-gl.css'
- SimpleMap.tsx: imports 'maplibre-gl/dist/maplibre-gl.css'
- WorkingGlobe.tsx: imports 'maplibre-gl/dist/maplibre-gl.css'

## Quick Restoration Command:
```bash
cp src/app/globals.css.backup src/app/globals.css && echo "CSS restored to original state"
```