import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ParentMessage } from '@/store/types_that_will_used';
import { chatStyles as styles } from './styles';
import { getProfileLabel } from './utils';
import { useTheme } from '@/theme';

// ---------------------------------------------------------------------------
// Reply footer shown above input when composing a reply
// ---------------------------------------------------------------------------

interface ReplyFooterProps {
  replyTo: ParentMessage;
  onDismiss: () => void;
}

export const ReplyFooter: React.FC<ReplyFooterProps> = ({ replyTo, onDismiss }) => {
  const { colors } = useTheme();
  const userName = replyTo.user?.name ?? 'Deleted';
  const profileInfo = replyTo.user ? getProfileLabel(replyTo.user) : '';
  const displayName = profileInfo ? `${userName} (${profileInfo})` : userName;

  return (
    <View style={[styles.replyFooterContainer, { backgroundColor: colors.background.secondary, borderTopColor: colors.border.default }]}>
      <View style={[styles.replyFooterSeparator, { backgroundColor: colors.interactive.default }]} />
      <View style={styles.replyFooterContent}>
        <Text style={[styles.replyFooterName, { color: colors.interactive.default }]}>{displayName}</Text>
        <ScrollView style={{ maxHeight: 40 }}>
          <Text style={[styles.replyFooterText, { color: colors.text.secondary }]} numberOfLines={2}>
            {replyTo.content?.text ?? ''}
          </Text>
        </ScrollView>
      </View>
      <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
        <Ionicons name="close" size={20} color={colors.text.secondary} />
      </TouchableOpacity>
    </View>
  );
};

// ---------------------------------------------------------------------------
// Banner shown when chat is closed / archived / reported
// ---------------------------------------------------------------------------

interface ClosedBannerProps {
  type: 'closed' | 'archived' | 'reported';
  onReportPress?: () => void;
}

export const ClosedChatBanner: React.FC<ClosedBannerProps> = ({ type, onReportPress }) => {
  const { colors } = useTheme();

  if (type === 'reported') {
    return (
      <View style={[styles.closedBanner, { backgroundColor: colors.background.primary }]}>
        <Text style={[styles.closedBannerText, { color: colors.text.secondary }]}>
          Your
          <Text onPress={onReportPress} style={[styles.reportedLink, { color: colors.interactive.default }]}>
            {' '}message was reported
          </Text>
          . We need to explore the reason before you continue chatting
        </Text>
      </View>
    );
  }

  const text =
    type === 'closed'
      ? 'This chat is closed'
      : 'This chat was archived. Only admin user can reopen it';

  return (
    <View style={[styles.closedBanner, { backgroundColor: colors.background.primary }]}>
      <Text style={[styles.closedBannerText, { color: colors.text.secondary }]}>{text}</Text>
    </View>
  );
};
