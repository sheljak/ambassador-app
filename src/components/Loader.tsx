import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

const DURATION = 1500;
const DOT_COLORS = ['#E07400', '#B4E646', '#0874E7'];

interface LoaderProps {
  size?: 'small' | 'large';
  paddingBottom?: number;
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

export function Loader({ size = 'large', paddingBottom = 0 }: LoaderProps) {
  const dotSize = size === 'small' ? 10 : 16;
  const dotSpacing = size === 'small' ? 8 : 12;

  return (
    <View style={[styles.container, size === 'small' && styles.containerSmall, { paddingBottom }]}>
      <View style={[styles.dotsRow, { gap: dotSpacing }]}>
        {DOT_COLORS.map((color, i) => (
          <PulseDot key={i} color={color} delay={i * (DURATION / 6)} dotSize={dotSize} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerSmall: {
    flex: 0,
    padding: 16,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
