import { StyleSheet, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/theme';

export function LandingScreen() {
  const { colors, spacing, shapes } = useTheme();
  const insets = useSafeAreaInsets();

  const handleGetStarted = () => {
    router.push('/sign-in' as any);
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View
            style={[
              styles.logoPlaceholder,
              {
                backgroundColor: colors.interactive.default,
                borderRadius: shapes.radius['2xl'],
              },
            ]}
          >
            <ThemedText style={[styles.logoText, { color: colors.text.inverse }]}>
              A
            </ThemedText>
          </View>
        </View>

        <ThemedText type="title" style={styles.title}>
          Welcome to Ambassador
        </ThemedText>

        <ThemedText style={[styles.subtitle, { color: colors.text.secondary }]}>
          Connect, share, and grow with your community
        </ThemedText>
      </View>

      <View style={[styles.buttonContainer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: pressed
                ? colors.interactive.pressed
                : colors.interactive.default,
              borderRadius: shapes.radius.lg,
              paddingVertical: spacing.md,
            },
          ]}
          onPress={handleGetStarted}
        >
          <ThemedText style={[styles.buttonText, { color: colors.text.inverse }]}>
            Get Started
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    marginBottom: 32,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 24,
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
