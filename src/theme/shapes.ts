/**
 * Shape tokens - border radius scale
 */

export const shapes = {
  radius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 24,
    full: 9999,
  },
} as const;

export type RadiusKey = keyof typeof shapes.radius;
export type RadiusValue = (typeof shapes.radius)[RadiusKey];
