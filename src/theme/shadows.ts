/**
 * Shadow tokens - cross-platform elevation system
 * Includes both iOS shadow properties and Android elevation
 */

import { Platform, type ViewStyle } from 'react-native';

type ShadowStyle = Pick<
  ViewStyle,
  'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'
>;

const baseShadowColor = '#000000';

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  } as ShadowStyle,

  sm: {
    shadowColor: baseShadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  } as ShadowStyle,

  md: {
    shadowColor: baseShadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  } as ShadowStyle,

  lg: {
    shadowColor: baseShadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  } as ShadowStyle,

  xl: {
    shadowColor: baseShadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  } as ShadowStyle,
} as const;

/**
 * Helper to get platform-appropriate shadow styles
 * On web, converts to CSS box-shadow
 */
export function getShadow(level: keyof typeof shadows): ViewStyle {
  const shadow = shadows[level];

  if (Platform.OS === 'web') {
    // For web, React Native handles the conversion
    return shadow;
  }

  return shadow;
}

export type ShadowKey = keyof typeof shadows;
