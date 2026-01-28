import { StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/theme';

export default function NotificationsScreen() {
  const { colors, shapes } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <ThemedView style={styles.header}>
          <ThemedText type="title">Notifications</ThemedText>
          <ThemedText style={{ color: colors.text.secondary }}>
            Stay informed about activity
          </ThemedText>
        </ThemedView>

        {/* Placeholder notifications */}
        {[1, 2, 3].map((item) => (
          <ThemedView
            key={item}
            style={[
              styles.notificationItem,
              {
                backgroundColor: colors.background.secondary,
                borderRadius: shapes.radius.lg,
              },
            ]}
          >
            <ThemedView
              style={[
                styles.dot,
                { backgroundColor: colors.interactive.default },
              ]}
            />
            <ThemedView style={styles.notificationContent}>
              <ThemedText type="defaultSemiBold">Notification {item}</ThemedText>
              <ThemedText style={{ color: colors.text.secondary, marginTop: 4 }}>
                This is a placeholder notification. Real notifications will appear here.
              </ThemedText>
              <ThemedText
                style={{ color: colors.text.disabled, fontSize: 12, marginTop: 8 }}
              >
                {item} hour{item > 1 ? 's' : ''} ago
              </ThemedText>
            </ThemedView>
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
  notificationItem: {
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
    marginTop: 6,
  },
  notificationContent: {
    flex: 1,
  },
});
