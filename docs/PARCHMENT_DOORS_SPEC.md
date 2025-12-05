# Parchment Doors - Feature Specification

## Overview
Add a theatrical "opening doors" animation to the app launch experience. Two parchment-textured panels cover the main insult list and slide apart when the user taps a latch button, revealing the content beneath.

## Visual Design

### Parchment Panels
- Textured parchment PNG image (color variations for depth/authenticity)
- Split vertically into left and right "doors"
- Covers the entire screen below the safe area
- No decorative elements initially (can enhance later)

### Featured Insult
- Random insult from the database
- Displayed approximately 30% down from top of doors
- Centered horizontally
- BlackChancery font (existing app font)
- Appropriate size for readability (~24-28pt)

### Latch Button
- Ornate medieval latch/handle style
- Positioned near the bottom of the screen
- Offset to one side (like a real door handle)
- Tappable to trigger door opening animation

## Behavior

### Trigger
- Appears **only on cold start** (fresh app launch)
- Does NOT appear when:
  - Returning from background
  - Navigating back from other screens
  - Hot reload during development

### Animation
- **Duration:** 300-400ms (snappy, not sluggish)
- **Style:** Left panel slides left, right panel slides right
- **Easing:** Ease-out or similar for natural deceleration
- Panels slide completely off-screen

### After Opening
- Doors component unmounts or becomes invisible
- Main insult list is fully interactive
- Doors do not return until next cold start

## Technical Implementation

### New Files
1. `src/components/ParchmentDoors.jsx` - Main doors component
2. `assets/images/parchment-texture.png` - Texture image (user to source)

### Modified Files
1. `src/mobile/InsultPage.jsx` - Wrap content with ParchmentDoors overlay

### Component Structure
```jsx
<ParchmentDoors
  insult={randomInsult}
  onOpen={() => setDoorsOpen(true)}
  visible={!doorsOpen}
>
  {/* Existing InsultPage content */}
</ParchmentDoors>
```

### State Management
- `doorsOpen` state in InsultPage (or App level)
- Once set to true, stays true for session
- Resets on cold start (natural behavior)

### Animation Approach
- Use React Native `Animated` API
- Two `Animated.View` components for left/right panels
- `Animated.timing` with `translateX` transform
- Left panel: translateX from 0 to -screenWidth/2
- Right panel: translateX from 0 to +screenWidth/2

### Image Handling
- Single parchment image used for both panels
- Left panel shows left half of image
- Right panel shows right half of image
- Use `overflow: 'hidden'` and image positioning

## Image Requirements

### Specifications
- **Format:** PNG (preferred) or JPG
- **Dimensions:** Minimum 1200x2000px (portrait)
- **File Size:** Under 500KB recommended
- **Style:** Aged parchment with texture/color variations

### Sourcing
Free image sites:
- Unsplash (unsplash.com)
- Pexels (pexels.com)
- Textures.com
- Freepik (freepik.com) - check license
- Subtle Patterns (subtlepatterns.com)

### Search Terms
- "parchment texture"
- "old paper background"
- "aged paper texture"
- "vintage paper"

## Future Enhancements (Optional)
- Sound effect on door open (creaky door, page turn)
- Decorative elements (torn edges, wax seal on latch)
- "Insult of the Day" instead of random
- Subtle shadow/depth between panels
- Parallax effect on insult text during open

## Version Target
- Version: 2.12.0 (or next minor release)
- Depends on: Parchment texture image asset

---

*Spec created: December 2024*
*Status: Awaiting parchment texture image*
