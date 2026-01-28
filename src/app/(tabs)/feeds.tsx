import { StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/theme';

export default function FeedsScreen() {
  const { colors, shapes } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <ThemedView style={styles.header}>
          <ThemedText type="title">Feeds</ThemedText>
          <ThemedText style={{ color: colors.text.secondary }}>
            Stay updated with latest posts
          </ThemedText>
        </ThemedView>

        {/* Placeholder feed items */}
        {[1, 2, 3].map((item) => (
          <ThemedView
            key={item}
            style={[
              styles.feedItem,
              {
                backgroundColor: colors.background.secondary,
                borderRadius: shapes.radius.lg,
              },
            ]}
          >
            <ThemedText type="defaultSemiBold">Feed Item {item}</ThemedText>
            <ThemedText style={{ color: colors.text.secondary, marginTop: 8 }}>
              This is a placeholder for feed content. Real content will be loaded from the API.
            </ThemedText>
          </ThemedView>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  feedItem: {
    padding: 20,
    marginBottom: 16,
  },
});
