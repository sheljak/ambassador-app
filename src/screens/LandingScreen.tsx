import { StyleSheet, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Asset } from 'expo-asset';
import { SvgUri } from 'react-native-svg';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/theme';

export function LandingScreen() {
  const { colors, spacing, shapes } = useTheme();
  const insets = useSafeAreaInsets();
  const logoAsset = Asset.fromModule(require('../../assets/svg/idp-logo.svg'));

  const handleGetStarted = () => {
    router.push('/sign-in' as any);
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <SvgUri uri={logoAsset.uri} width={300} height={300} />
        </View>
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
