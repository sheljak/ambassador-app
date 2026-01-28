import { StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useTheme, useResponsive } from '@/theme';

export function LandingScreen() {
  const { colors, spacing, shapes } = useTheme();
  const { responsive } = useResponsive();

  const handleGetStarted = () => {
    router.push('/(tabs)');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Welcome to Ambassador
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Your journey starts here
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.buttonContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: pressed
                ? colors.interactive.pressed
                : colors.interactive.default,
              borderRadius: shapes.radius.lg,
              paddingVertical: spacing.md,
              paddingHorizontal: responsive({ sm: spacing.xl, md: spacing['2xl'] }),
            },
          ]}
          onPress={handleGetStarted}
        >
          <ThemedText
            style={[styles.buttonText, { color: colors.text.inverse }]}
          >
            Get Started
          </ThemedText>
        </Pressable>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
