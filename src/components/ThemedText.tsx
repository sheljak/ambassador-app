import { StyleSheet, Text, type TextProps } from 'react-native';

import { useTheme, textPresets, palette } from '@/theme';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const { colors, colorScheme } = useTheme();

  // Allow explicit color overrides
  const colorFromProps = colorScheme === 'dark' ? darkColor : lightColor;
  const color = colorFromProps ?? colors.text.primary;

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: textPresets.body.fontSize,
    lineHeight: textPresets.body.lineHeight,
  },
  defaultSemiBold: {
    fontSize: textPresets.body.fontSize,
    lineHeight: textPresets.body.lineHeight,
    fontWeight: '600',
  },
  title: {
    fontSize: textPresets.heading2.fontSize,
    fontWeight: 'bold',
    lineHeight: textPresets.heading2.lineHeight,
  },
  subtitle: {
    fontSize: textPresets.heading3.fontSize,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: textPresets.body.fontSize,
    color: palette.primary[500],
  },
});
