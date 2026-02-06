import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Asset } from 'expo-asset';
import { SvgUri } from 'react-native-svg';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useTheme, createStyles } from '@/theme';

export function LandingScreen() {
  const { colors, spacing, shapes } = useTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const logoAsset = Asset.fromModule(require('../../assets/svg/idp-logo.svg'));
  const logoSize = spacing.xs * 75;

  const handleGetStarted = () => {
    router.push('/sign-in' as any);
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <SvgUri uri={logoAsset.uri} width={logoSize} height={logoSize} />
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

const useStyles = createStyles(({ spacing, typography }) => ({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  logoContainer: {
    marginBottom: spacing['2xl'],
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.sm * 1.5,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: typography.fontSize.base,
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: spacing.lg,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
}));
