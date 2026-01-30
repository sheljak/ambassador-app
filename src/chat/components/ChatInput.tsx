import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ParentMessage } from '@/store/types_that_will_used';
import { chatStyles as styles, COLORS } from './styles';
import { getProfileLabel } from './utils';

// ---------------------------------------------------------------------------
// Reply footer shown above input when composing a reply
// ---------------------------------------------------------------------------

interface ReplyFooterProps {
  replyTo: ParentMessage;
  onDismiss: () => void;
}

export const ReplyFooter: React.FC<ReplyFooterProps> = ({ replyTo, onDismiss }) => {
  const userName = replyTo.user?.name ?? 'Deleted';
  const profileInfo = replyTo.user ? getProfileLabel(replyTo.user) : '';
  const displayName = profileInfo ? `${userName} (${profileInfo})` : userName;

  return (
    <View style={styles.replyFooterContainer}>
      <View style={styles.replyFooterSeparator} />
      <View style={styles.replyFooterContent}>
        <Text style={styles.replyFooterName}>{displayName}</Text>
        <ScrollView style={{ maxHeight: 40 }}>
          <Text style={styles.replyFooterText} numberOfLines={2}>
            {replyTo.content?.text ?? ''}
          </Text>
        </ScrollView>
      </View>
      <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
        <Ionicons name="close" size={20} color="rgba(38, 46, 69, 0.6)" />
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
  if (type === 'reported') {
    return (
      <View style={styles.closedBanner}>
        <Text style={styles.closedBannerText}>
          Your
          <Text onPress={onReportPress} style={styles.reportedLink}>
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
    <View style={styles.closedBanner}>
      <Text style={styles.closedBannerText}>{text}</Text>
    </View>
  );
};
