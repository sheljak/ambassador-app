import { StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/theme';

export default function MessagesScreen() {
  const { colors, shapes } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <ThemedView style={styles.header}>
          <ThemedText type="title">Messages</ThemedText>
          <ThemedText style={{ color: colors.text.secondary }}>
            Your conversations
          </ThemedText>
        </ThemedView>

        {/* Placeholder message items */}
        {[1, 2, 3].map((item) => (
          <ThemedView
            key={item}
            style={[
              styles.messageItem,
              {
                backgroundColor: colors.background.secondary,
                borderRadius: shapes.radius.lg,
              },
            ]}
          >
            <ThemedView style={styles.avatar}>
              <ThemedText style={{ color: colors.text.inverse }}>U{item}</ThemedText>
            </ThemedView>
            <ThemedView style={styles.messageContent}>
              <ThemedText type="defaultSemiBold">User {item}</ThemedText>
              <ThemedText
                style={{ color: colors.text.secondary }}
                numberOfLines={1}
              >
                This is a placeholder message preview...
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
  messageItem: {
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0a7ea4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  messageContent: {
    flex: 1,
  },
});
