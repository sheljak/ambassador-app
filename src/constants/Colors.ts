/**
 * @deprecated Use the new theme system instead: import { useTheme, semanticColors } from '@/theme'
 *
 * This file is kept for backwards compatibility.
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { semanticColors } from '@/theme';

// Re-export in legacy format for backwards compatibility
export const Colors = {
  light: {
    text: semanticColors.light.text.primary,
    background: semanticColors.light.background.primary,
    tint: semanticColors.light.tint,
    icon: semanticColors.light.icon,
    tabIconDefault: semanticColors.light.tabIconDefault,
    tabIconSelected: semanticColors.light.tabIconSelected,
  },
  dark: {
    text: semanticColors.dark.text.primary,
    background: semanticColors.dark.background.primary,
    tint: semanticColors.dark.tint,
    icon: semanticColors.dark.icon,
    tabIconDefault: semanticColors.dark.tabIconDefault,
    tabIconSelected: semanticColors.dark.tabIconSelected,
  },
};
