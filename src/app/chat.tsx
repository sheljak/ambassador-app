import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/theme';

export default function ChatScreen() {
  const { colors, palette } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { dialogId, dialogName, dialogTypeKey } = useLocalSearchParams<{
    dialogId: string;
    dialogName: string;
    dialogTypeKey: string;
  }>();

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border.default }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={palette.primary[500]} />
        </Pressable>
        <View style={styles.headerTitleContainer}>
          <ThemedText style={styles.headerTitle} numberOfLines={1}>
            {dialogName || 'Chat'}
          </ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: colors.text.secondary }]}>
            {dialogTypeKey || 'chat'}
          </ThemedText>
        </View>
      </View>

      {/* Placeholder content */}
      <View style={styles.content}>
        <ThemedText style={[styles.placeholderText, { color: colors.text.secondary }]}>
          Dialog #{dialogId}
        </ThemedText>
        <ThemedText style={[styles.placeholderSubtext, { color: colors.text.disabled }]}>
          Chat messages will appear here
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 12,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 14,
  },
});
