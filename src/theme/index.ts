/**
 * Universal Styles System
 * Main export - combines all theme tokens and utilities
 */

// Token exports
export { spacing, type SpacingKey, type SpacingValue } from './spacing';
export {
  palette,
  semanticColors,
  type ColorScheme,
  type SemanticColors,
} from './colors';
export {
  typography,
  textPresets,
  type FontSizeKey,
  type FontWeightKey,
  type LineHeightKey,
  type TextPresetKey,
} from './typography';
export { shapes, type RadiusKey, type RadiusValue } from './shapes';
export { shadows, getShadow, type ShadowKey } from './shadows';
export {
  breakpoints,
  getBreakpoint,
  isAtLeast,
  type BreakpointKey,
  type BreakpointValue,
} from './breakpoints';
export { createStyles } from './createStyles';

// Hook exports
export { useTheme, getThemeColors, type Theme } from './hooks/useTheme';
export {
  useResponsive,
  createResponsiveValue,
} from './hooks/useResponsive';
