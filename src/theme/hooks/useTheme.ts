/**
 * Theme access hook - provides access to all theme tokens with automatic light/dark mode resolution
 */

import { useColorScheme } from 'react-native';
import { spacing } from '../spacing';
import { palette, semanticColors, type ColorScheme, type SemanticColors } from '../colors';
import { typography, textPresets } from '../typography';
import { shapes } from '../shapes';
import { shadows, getShadow } from '../shadows';
import { breakpoints } from '../breakpoints';

export interface Theme {
  colorScheme: ColorScheme;
  colors: SemanticColors;
  palette: typeof palette;
  spacing: typeof spacing;
  typography: typeof typography;
  textPresets: typeof textPresets;
  shapes: typeof shapes;
  shadows: typeof shadows;
  breakpoints: typeof breakpoints;
  getShadow: typeof getShadow;
}

export function useTheme(): Theme {
  const systemColorScheme = useColorScheme();
  const colorScheme: ColorScheme = systemColorScheme ?? 'light';

  return {
    colorScheme,
    colors: semanticColors[colorScheme],
    palette,
    spacing,
    typography,
    textPresets,
    shapes,
    shadows,
    breakpoints,
    getShadow,
  };
}

/**
 * Get theme colors for a specific color scheme (useful for static styles)
 */
export function getThemeColors(colorScheme: ColorScheme) {
  return semanticColors[colorScheme];
}
