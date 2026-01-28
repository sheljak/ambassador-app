import { View, type ViewProps } from 'react-native';

import { useTheme, type SpacingKey, type RadiusKey, type ShadowKey } from '@/theme';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  padding?: SpacingKey;
  paddingHorizontal?: SpacingKey;
  paddingVertical?: SpacingKey;
  margin?: SpacingKey;
  marginHorizontal?: SpacingKey;
  marginVertical?: SpacingKey;
  borderRadius?: RadiusKey;
  shadow?: ShadowKey;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  padding,
  paddingHorizontal,
  paddingVertical,
  margin,
  marginHorizontal,
  marginVertical,
  borderRadius,
  shadow,
  ...otherProps
}: ThemedViewProps) {
  const { colors, colorScheme, spacing, shapes, getShadow } = useTheme();

  // Allow explicit color overrides
  const colorFromProps = colorScheme === 'dark' ? darkColor : lightColor;
  const backgroundColor = colorFromProps ?? colors.background.primary;

  // Build spacing styles
  const spacingStyles = {
    ...(padding !== undefined && { padding: spacing[padding] }),
    ...(paddingHorizontal !== undefined && { paddingHorizontal: spacing[paddingHorizontal] }),
    ...(paddingVertical !== undefined && { paddingVertical: spacing[paddingVertical] }),
    ...(margin !== undefined && { margin: spacing[margin] }),
    ...(marginHorizontal !== undefined && { marginHorizontal: spacing[marginHorizontal] }),
    ...(marginVertical !== undefined && { marginVertical: spacing[marginVertical] }),
  };

  // Build shape styles
  const shapeStyles = {
    ...(borderRadius !== undefined && { borderRadius: shapes.radius[borderRadius] }),
  };

  // Build shadow styles
  const shadowStyles = shadow !== undefined ? getShadow(shadow) : {};

  return (
    <View
      style={[
        { backgroundColor },
        spacingStyles,
        shapeStyles,
        shadowStyles,
        style,
      ]}
      {...otherProps}
    />
  );
}
