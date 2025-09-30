# MapGlobe Smooth Zoom Without Reload - Solution

## Problem
When viewing user profiles, the globe would reload when clicking on locations, causing jarring re-initialization and losing the smooth zoom behavior.

## Root Causes Identified

### 1. **React Closure Issue in Animation Loop**
The `rotateCamera` function inside `startRotation()` was checking a stale value of `focusLocation` captured in the closure. When clicking a location, the rotation would continue because it wasn't seeing the updated `focusLocation` value.

**Solution:** Use a ref to track the current `focusLocation` value:
```typescript
const focusLocationRef = useRef(focusLocation)

// Keep ref in sync
useEffect(() => {
  focusLocationRef.current = focusLocation
}, [focusLocation])

// Check current value in animation loop
const rotateCamera = () => {
  if (!map.current || focusLocationRef.current) {
    return // Stop immediately when location is focused
  }
  // ... rotation logic
}
```

### 2. **Race Condition Between Two Rotation Effects**
Two separate useEffects were trying to start rotation, causing timing conflicts:
- Auto-rotation effect: Started rotation after 500ms when `autoRotate && !focusLocation`
- Focus location effect: Started rotation after 2000ms when returning to global view

**Solution:** Make auto-rotation effect only handle initial load, let focus effect handle restarts:
```typescript
// Only start on initial load (no focus marker exists)
if (autoRotate && !focusLocation && !focusMarker.current) {
  const timeout = setTimeout(() => startRotation(), 500)
  return () => clearTimeout(timeout)
}
```

### 3. **Map Reloading on Every State Change**
The visits array was being recreated on every render, causing the MapGlobe's main useEffect (with `[visits]` dependency) to reinitialize the entire map.

**Solution:** Use `useMemo` to memoize the formatted visits array:
```typescript
const formattedVisits = useMemo(() => visits.map((v) => ({
  // ... format visit
})), [visits]) // Only recreate when visits actually change
```

**CRITICAL:** All `useMemo` hooks must be called BEFORE any conditional returns (early returns) due to React's Rules of Hooks.

### 4. **Inconsistent Zoom-Out Behavior**
Zoom out used different settings than initial load, and rotation restarted too early.

**Solution:**
- Match initial zoom settings: `zoom: 1.2, pitch: 0, bearing: 0`
- Wait for flyTo animation to complete: `setTimeout(..., 2100)` (slightly longer than 2000ms animation)
- Clear any existing timeout before setting new one to prevent overlap

## Key Implementation Details

### Props Pattern for User Profile Page
```typescript
<MapGlobe
  visits={formattedVisits}        // Memoized to prevent reloads
  onVisitSelect={handleVisitSelect}
  autoRotate={true}                // Enables rotation for viewing others
  autoZoom={true}                  // Enables smooth zoom on focus
  focusLocation={focusLocation}    // Memoized location state
/>
```

### State Management
```typescript
const [selectedLocation, setSelectedLocation] = useState(null)
const focusLocation = useMemo(() => selectedLocation, [selectedLocation])
```

### Disabling User Interaction (View Profile Only)
```typescript
if (autoRotate) {
  map.current.scrollZoom.disable()
  map.current.boxZoom.disable()
  map.current.dragRotate.disable()
  map.current.dragPan.disable()
  map.current.keyboard.disable()
  map.current.doubleClickZoom.disable()
  map.current.touchZoomRotate.disable()
}
```

## Tips for Future Similar Issues

1. **Check for closure issues** in animation loops or callbacks - use refs for values that need to be "current"
2. **Look for race conditions** when multiple effects manage the same behavior
3. **Memoize arrays/objects** passed as props to prevent unnecessary re-renders
4. **Remember Rules of Hooks** - all hooks before any conditional returns
5. **Add timing buffers** when coordinating animations (e.g., 2100ms for 2000ms animation)
6. **Use refs for timeouts** that need to be cleared to prevent overlapping timers

## Files Modified
- `/src/components/MapGlobe.tsx` - Added focusLocationRef, fixed rotation logic, disabled interactions conditionally
- `/src/app/users/[username]/page.tsx` - Added useMemo for formattedVisits and focusLocation, proper state management
