/**
 * Responsive breakpoints for consistent cross-platform layouts
 */

export const breakpoints = {
  sm: 0,      // Mobile phones (default)
  md: 768,    // Tablets
  lg: 1024,   // Desktop
  xl: 1280,   // Large desktop
} as const;

export type BreakpointKey = keyof typeof breakpoints;
export type BreakpointValue = (typeof breakpoints)[BreakpointKey];

/**
 * Get the current breakpoint name based on screen width
 */
export function getBreakpoint(width: number): BreakpointKey {
  if (width >= breakpoints.xl) return 'xl';
  if (width >= breakpoints.lg) return 'lg';
  if (width >= breakpoints.md) return 'md';
  return 'sm';
}

/**
 * Check if screen width is at or above a breakpoint
 */
export function isAtLeast(width: number, breakpoint: BreakpointKey): boolean {
  return width >= breakpoints[breakpoint];
}
