import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { useTheme, createStyles } from '@/theme';

const DURATION = 1500;

interface LoaderProps {
  size?: 'small' | 'large';
  paddingBottom?: number;
  inline?: boolean;
  style?: object;
}

function PulseDot({ color, delay, dotSize }: { color: string; delay: number; dotSize: number }) {
  const scale = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(scale, {
          toValue: 1,
          duration: DURATION * 0.3,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.4,
          duration: DURATION * 0.3,
          useNativeDriver: true,
        }),
        Animated.delay(DURATION * 0.4 - delay),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [scale, delay]);

  return (
    <Animated.View
      style={{
        width: dotSize,
        height: dotSize,
        borderRadius: dotSize / 2,
        backgroundColor: color,
        transform: [{ scale }],
      }}
    />
  );
}

export function Loader({ size = 'large', paddingBottom = 0, inline = false, style }: LoaderProps) {
  const { spacing, palette } = useTheme();
  const styles = useStyles();
  const dotSize = size === 'small' ? spacing.xs * 2.5 : spacing.md;
  const dotSpacing = size === 'small' ? spacing.sm : spacing.sm * 1.5;
  const dotColors = [palette.primary[500], palette.secondary?.[500] ?? palette.primary[300], palette.primary[300]];

  return (
    <View
      style={[
        styles.container,
        !inline && size === 'small' && styles.containerSmall,
        inline && styles.containerInline,
        { paddingBottom },
        style,
      ]}
    >
      <View style={[styles.dotsRow, { gap: dotSpacing }]}>
        {dotColors.map((color, i) => (
          <PulseDot key={i} color={color} delay={i * (DURATION / 6)} dotSize={dotSize} />
        ))}
      </View>
    </View>
  );
}

const useStyles = createStyles(({ spacing }) => ({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerSmall: {
    flex: 0,
    padding: spacing.md,
  },
  containerInline: {
    flex: 0,
    padding: 0,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
}));
