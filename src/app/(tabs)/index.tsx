import { StyleSheet, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/theme';
import { useAuth } from '@/hooks';

export default function HomeScreen() {
  const { colors, spacing, shapes } = useTheme();
  const { user, signOut } = useAuth();
  const insets = useSafeAreaInsets();

  const handleSignOut = () => {
    signOut();
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedText type="title">Home</ThemedText>
          <ThemedText style={{ color: colors.text.secondary }}>
            Welcome back{user?.first_name ? `, ${user.first_name}` : ''}!
          </ThemedText>
        </ThemedView>

        {/* User Info Card */}
        <ThemedView
          style={[
            styles.card,
            {
              backgroundColor: colors.background.secondary,
              borderRadius: shapes.radius.lg,
            },
          ]}
        >
          <ThemedText type="subtitle" style={styles.cardTitle}>
            Your Account
          </ThemedText>
          {user && (
            <>
              <ThemedText style={{ color: colors.text.secondary }}>
                Email: {user.email}
              </ThemedText>
              {user.first_name && (
                <ThemedText style={{ color: colors.text.secondary }}>
                  Name: {user.first_name} {user.last_name}
                </ThemedText>
              )}
            </>
          )}
        </ThemedView>

        {/* Placeholder content */}
        <ThemedView
          style={[
            styles.card,
            {
              backgroundColor: colors.background.secondary,
              borderRadius: shapes.radius.lg,
            },
          ]}
        >
          <ThemedText type="subtitle" style={styles.cardTitle}>
            Quick Actions
          </ThemedText>
          <ThemedText style={{ color: colors.text.secondary }}>
            Your dashboard content will appear here.
          </ThemedText>
        </ThemedView>

        {/* Sign Out button */}
        <Pressable
          style={({ pressed }) => [
            styles.signOutButton,
            {
              backgroundColor: pressed
                ? colors.status.error + '20'
                : 'transparent',
              borderColor: colors.status.error,
              borderRadius: shapes.radius.lg,
            },
          ]}
          onPress={handleSignOut}
        >
          <ThemedText style={[styles.signOutText, { color: colors.status.error }]}>
            Sign Out
          </ThemedText>
        </Pressable>
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
  card: {
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    marginBottom: 12,
  },
  signOutButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderWidth: 1,
    marginTop: 16,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
