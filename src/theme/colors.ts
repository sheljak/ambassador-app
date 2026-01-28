/**
 * Color palette and semantic color tokens
 * Extended from current teal accent with full semantic colors
 */

// Base color palette
export const palette = {
  // Primary - Teal shades
  primary: {
    50: '#E6F7FA',
    100: '#CCF0F5',
    200: '#99E0EB',
    300: '#66D1E0',
    400: '#33C1D6',
    500: '#0a7ea4', // Main teal
    600: '#086583',
    700: '#064C62',
    800: '#043242',
    900: '#021921',
  },

  // Neutral - Gray shades for text/backgrounds
  neutral: {
    0: '#FFFFFF',
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
    950: '#151718',
  },

  // Semantic colors
  success: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },

  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },

  info: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
} as const;

// Semantic color tokens for light and dark themes
export const semanticColors = {
  light: {
    // Backgrounds
    background: {
      primary: palette.neutral[0],
      secondary: palette.neutral[50],
      tertiary: palette.neutral[100],
    },

    // Text colors
    text: {
      primary: palette.neutral[900],
      secondary: palette.neutral[600],
      disabled: palette.neutral[400],
      inverse: palette.neutral[0],
    },

    // Border colors
    border: {
      default: palette.neutral[200],
      focused: palette.primary[500],
      error: palette.error[500],
    },

    // Interactive elements
    interactive: {
      default: palette.primary[500],
      pressed: palette.primary[600],
      disabled: palette.neutral[300],
    },

    // Status colors
    status: {
      success: palette.success[500],
      warning: palette.warning[500],
      error: palette.error[500],
      info: palette.info[500],
    },

    // Legacy support (for existing Colors.ts compatibility)
    tint: palette.primary[500],
    icon: palette.neutral[500],
    tabIconDefault: palette.neutral[500],
    tabIconSelected: palette.primary[500],
  },

  dark: {
    // Backgrounds
    background: {
      primary: palette.neutral[950],
      secondary: palette.neutral[900],
      tertiary: palette.neutral[800],
    },

    // Text colors
    text: {
      primary: palette.neutral[100],
      secondary: palette.neutral[400],
      disabled: palette.neutral[600],
      inverse: palette.neutral[900],
    },

    // Border colors
    border: {
      default: palette.neutral[700],
      focused: palette.primary[400],
      error: palette.error[400],
    },

    // Interactive elements
    interactive: {
      default: palette.primary[400],
      pressed: palette.primary[500],
      disabled: palette.neutral[700],
    },

    // Status colors
    status: {
      success: palette.success[400],
      warning: palette.warning[400],
      error: palette.error[400],
      info: palette.info[400],
    },

    // Legacy support (for existing Colors.ts compatibility)
    tint: palette.neutral[0],
    icon: palette.neutral[400],
    tabIconDefault: palette.neutral[400],
    tabIconSelected: palette.neutral[0],
  },
} as const;

export type ColorScheme = 'light' | 'dark';

// Define the semantic colors type structure (not tied to specific color values)
export interface SemanticColors {
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  text: {
    primary: string;
    secondary: string;
    disabled: string;
    inverse: string;
  };
  border: {
    default: string;
    focused: string;
    error: string;
  };
  interactive: {
    default: string;
    pressed: string;
    disabled: string;
  };
  status: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  tint: string;
  icon: string;
  tabIconDefault: string;
  tabIconSelected: string;
}
