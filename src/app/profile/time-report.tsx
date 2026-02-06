import React from 'react';
import { View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useTheme, createStyles } from '@/theme';

export default function TimeReportScreen() {
  const { colors, palette } = useTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: colors.border.default }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={palette.primary[500]} />
        </Pressable>
        <ThemedText style={styles.headerTitle}>Time Report</ThemedText>
        <View style={styles.headerSpacer} />
      </View>
      <View style={styles.content}>
        <ThemedText style={[styles.placeholder, { color: colors.text.secondary }]}>
          Time report details will appear here.
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const useStyles = createStyles(({ spacing, typography }) => ({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm * 1.5,
    borderBottomWidth: 1,
  },
  backButton: { padding: spacing.sm },
  headerTitle: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
    marginRight: spacing.xs * 10,
  },
  headerSpacer: { width: 0 },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
  },
  placeholder: { fontSize: typography.fontSize.base, textAlign: 'center' },
}));
