import { StyleSheet, ScrollView, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/theme';
import { useAuth } from '@/hooks';

export default function ProfileScreen() {
  const { colors, shapes, spacing } = useTheme();
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
        <ThemedView style={styles.header}>
          <ThemedText type="title">Profile</ThemedText>
        </ThemedView>

        {/* Profile Avatar */}
        <View style={styles.avatarContainer}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: colors.interactive.default },
            ]}
          >
            <ThemedText style={[styles.avatarText, { color: colors.text.inverse }]}>
              {user?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
            </ThemedText>
          </View>
          <ThemedText type="subtitle" style={styles.userName}>
            {user?.first_name
              ? `${user.first_name} ${user.last_name || ''}`
              : 'User'}
          </ThemedText>
          <ThemedText style={{ color: colors.text.secondary }}>
            {user?.email}
          </ThemedText>
        </View>

        {/* Profile Options */}
        <ThemedView
          style={[
            styles.section,
            {
              backgroundColor: colors.background.secondary,
              borderRadius: shapes.radius.lg,
            },
          ]}
        >
          {['Edit Profile', 'Settings', 'Help & Support', 'Privacy Policy'].map(
            (option, index) => (
              <Pressable
                key={option}
                style={({ pressed }) => [
                  styles.optionItem,
                  pressed && { backgroundColor: colors.background.tertiary },
                  index < 3 && {
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border.default,
                  },
                ]}
              >
                <ThemedText>{option}</ThemedText>
                <ThemedText style={{ color: colors.text.secondary }}>→</ThemedText>
              </Pressable>
            )
          )}
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
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  userName: {
    marginBottom: 4,
  },
  section: {
    marginBottom: 24,
    overflow: 'hidden',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  signOutButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderWidth: 1,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
