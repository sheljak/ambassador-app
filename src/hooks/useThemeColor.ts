/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { useColorScheme } from '@/hooks/useColorScheme';
import { semanticColors, type SemanticColors } from '@/theme';

// Legacy color keys for backwards compatibility
type LegacyColorKey = 'text' | 'background' | 'tint' | 'icon' | 'tabIconDefault' | 'tabIconSelected';

// Map legacy color keys to new semantic color paths
function getLegacyColor(colors: SemanticColors, colorName: LegacyColorKey): string {
  switch (colorName) {
    case 'text':
      return colors.text.primary;
    case 'background':
      return colors.background.primary;
    case 'tint':
      return colors.tint;
    case 'icon':
      return colors.icon;
    case 'tabIconDefault':
      return colors.tabIconDefault;
    case 'tabIconSelected':
      return colors.tabIconSelected;
    default:
      return colors.text.primary;
  }
}

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: LegacyColorKey
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return getLegacyColor(semanticColors[theme], colorName);
  }
}
