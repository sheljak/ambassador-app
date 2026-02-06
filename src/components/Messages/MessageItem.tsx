import React, { memo, useCallback, useMemo } from 'react';
import { View, Pressable, Image, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { useTheme, createStyles, spacing as spacingTokens } from '@/theme';
import type { Dialog, DialogTypeKey } from '@/store/types_that_will_used';
import { formatRelativeTime } from '@/helpers/common';

/** Renders text with search term highlighted */
const HighlightedText = ({
  text,
  highlight,
  style,
  highlightColor,
  numberOfLines,
}: {
  text: string;
  highlight?: string;
  style?: any;
  highlightColor: string;
  numberOfLines?: number;
}) => {
  if (!highlight || !highlight.trim()) {
    return (
      <ThemedText style={style} numberOfLines={numberOfLines}>
        {text}
      </ThemedText>
    );
  }

  const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <ThemedText style={style} numberOfLines={numberOfLines}>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <Text key={i} style={{ backgroundColor: highlightColor, fontWeight: '700' }}>
            {part}
          </Text>
        ) : (
          part
        )
      )}
    </ThemedText>
  );
};

interface MessageItemProps {
  item: Dialog;
  searchTerm?: string;
  onPress: (dialog: Dialog) => void;
}

const AVATAR_SIZE = spacingTokens.xs * 12;
const SMALL_AVATAR_SIZE = spacingTokens.xs * 8;

// Get dialog type display info
const getDialogTypeInfo = (typeKey?: DialogTypeKey): { label: string; routeType: string; defaultMessage: string } => {
  switch (typeKey) {
    case 'chat':
      return { label: 'Chat', routeType: 'TextChat', defaultMessage: 'No messages' };
    case 'group-chat':
      return { label: 'Group Chat', routeType: 'GroupChat', defaultMessage: 'No messages' };
    case 'content-group':
      return { label: 'Content', routeType: 'ContentGroup', defaultMessage: 'No posts in this group' };
    case 'faq':
      return { label: 'FAQ', routeType: 'DiscoverChat', defaultMessage: 'No answers to this question' };
    case 'live-stream-chat':
      return { label: 'Streams', routeType: 'LiveStream', defaultMessage: 'No messages in this stream' };
    case 'community-chat':
      return { label: 'Community Chat', routeType: 'CommunityChat', defaultMessage: 'No messages' };
    case 'community-1-to-1-chat':
      return { label: 'Chat', routeType: 'CommunityOneToOneChat', defaultMessage: 'No messages' };
    default:
      return { label: 'Chat', routeType: 'TextChat', defaultMessage: 'No messages' };
  }
};

// Format dialog name (remove "Chat between X and Y" format)
const formatDialogName = (name?: string, typeKey?: DialogTypeKey): string => {
  if (!name) return 'Dialog';

  if (typeKey === 'chat' || typeKey === 'community-1-to-1-chat') {
    const match = name.match(/^Chat between (.+?) and (.+)$/i);
    if (match) {
      return `Chat with ${match[1].trim()}`;
    }
  }

  return name;
};

// Get last message text
const getLastMessageText = (item: Dialog, defaultMessage: string): string => {
  if (!item.last_message) return defaultMessage;

  const { type, content } = item.last_message;

  switch (type) {
    case 'text':
    case 'blocked':
    case 'closed':
    case 'reopened':
    case 'archived':
    case 'unarchived':
    case 'joined':
    case 'delete':
    case 'autotext':
    case 'search-text':
      return (content as { text?: string })?.text || 'No messages';
    case 'post':
      return 'Sent content';
    case 'flagged':
      return 'Chat has been reported';
    case 'unflagged':
      return 'Chat has been unreported';
    default:
      return defaultMessage;
  }
};

const MessageItem: React.FC<MessageItemProps> = ({ item, searchTerm, onPress }) => {
  const { colors, palette } = useTheme();
  const styles = useStyles();
  const highlightColor = palette.primary[100] ?? '#FFF3CD';

  const typeInfo = useMemo(() => getDialogTypeInfo(item.dialog_type_key), [item.dialog_type_key]);
  const dialogName = useMemo(
    () => formatDialogName(item.dialog_name || item.name, item.dialog_type_key),
    [item.dialog_name, item.name, item.dialog_type_key]
  );
  const lastMessage = useMemo(
    () => getLastMessageText(item, typeInfo.defaultMessage),
    [item, typeInfo.defaultMessage]
  );
  const relativeTime = useMemo(
    () => formatRelativeTime(item.dialog_last_activity),
    [item.dialog_last_activity]
  );

  const isDisabled = !item.is_enabled;
  const isClosed = item.dialog_closed && !item.is_feedback_required;
  const hasNewMessages = (item.new_messages || 0) > 0;
  const isBlocked = item.isProspectBlocked ||
    (item.dialog_reported && item.dialog_type_key === 'community-1-to-1-chat');

  const handlePress = useCallback(() => {
    onPress(item);
  }, [item, onPress]);

  // Render avatar
  const renderAvatar = () => {
    const members = item.members || [];

    // Dialog has avatar
    if (item.avatar) {
      const uri = item.avatar.sizes?.['70x70'] || item.avatar.original;
      return (
        <Image
          style={styles.avatar}
          source={{ uri }}
        />
      );
    }

    // Group chat with multiple members
    if (members.length > 1) {
      const studentMembers = members
        .filter(m => m.role_key === 'univercity-student')
        .slice(0, 2);

      if (studentMembers.length > 1) {
        return (
          <View style={styles.groupAvatarContainer}>
            {studentMembers.map((member, i) => {
              const uri = member.avatar?.sizes?.['70x70'] || member.avatar?.original;
              if (uri) {
                return (
                  <Image
                    key={member.id}
                    style={[
                      styles.groupAvatar,
                      i === 0 && styles.groupAvatarFirst,
                      i === 1 && styles.groupAvatarSecond,
                    ]}
                    source={{ uri }}
                  />
                );
              }
              // Fallback for members without avatar
              return (
                <View
                  key={member.id}
                  style={[
                    styles.groupAvatar,
                    styles.defaultAvatar,
                    { backgroundColor: colors.background.tertiary },
                    i === 0 && styles.groupAvatarFirst,
                    i === 1 && styles.groupAvatarSecond,
                  ]}
                >
                  <Ionicons name="person" size={16} color={colors.text.secondary} />
                </View>
              );
            })}
          </View>
        );
      }
    }

    // FAQ with color
    if (item.dialog_type_key === 'faq') {
      const bgColor = item.color || 'rgb(68,89,107)';
      const textColor = item.color !== '#ffffff' ? '#ffffff' : '#000000';
      return (
        <View style={[styles.defaultAvatar, { backgroundColor: bgColor }]}>
          <ThemedText style={[styles.defaultAvatarText, { color: textColor }]}>
            {dialogName.charAt(0).toUpperCase()}
          </ThemedText>
        </View>
      );
    }

    // Default avatar with icon
    return (
      <View style={[styles.defaultAvatar, { backgroundColor: colors.background.tertiary }]}>
        <Ionicons name="chatbubble-outline" size={24} color={colors.text.secondary} />
      </View>
    );
  };

  return (
    <Pressable
      style={[
        styles.container,
        { backgroundColor: colors.background.primary },
        (isClosed || isDisabled) && styles.disabled,
      ]}
      onPress={handlePress}
      disabled={isDisabled}
    >
      <View style={styles.avatarContainer}>
        {renderAvatar()}
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <HighlightedText
            text={dialogName}
            highlight={searchTerm}
            style={styles.name}
            highlightColor={highlightColor}
            numberOfLines={1}
          />
          <ThemedText style={[styles.time, { color: colors.text.secondary }]}>
            {relativeTime}
          </ThemedText>
        </View>

        <View style={styles.bottomRow}>
          {isBlocked ? (
            <View style={[styles.blockedBadge, { backgroundColor: palette.error[100] }]}>
              <ThemedText style={[styles.blockedText, { color: palette.error[500] }]}>
                Blocked
              </ThemedText>
            </View>
          ) : (
            <HighlightedText
              text={lastMessage}
              highlight={searchTerm}
              style={[
                styles.message,
                { color: hasNewMessages ? colors.text.primary : colors.text.secondary },
              ]}
              highlightColor={highlightColor}
              numberOfLines={1}
            />
          )}

          <View style={styles.infoContainer}>
            {(item.dialog_type_key === 'chat' ||
              item.dialog_type_key === 'group-chat' ||
              item.dialog_type_key === 'community-chat' ||
              item.dialog_type_key === 'community-1-to-1-chat') && (
              <ThemedText
                style={[
                  styles.typeLabel,
                  { color: hasNewMessages ? colors.text.secondary : colors.text.disabled }
                ]}
              >
                {typeInfo.label}
              </ThemedText>
            )}

            {hasNewMessages && !item.dialog_closed && (
              <View style={[styles.badge, { backgroundColor: palette.primary[500] }]}>
                <Text style={styles.badgeText}>
                  {(item.new_messages || 0) > 99 ? '99+' : item.new_messages}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const useStyles = createStyles(({ spacing, typography, shapes }) => ({
  container: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm * 1.5,
  },
  disabled: {
    opacity: 0.4,
  },
  avatarContainer: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    marginRight: spacing.sm * 1.5,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: shapes.radius.full,
  },
  groupAvatarContainer: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    position: 'relative',
  },
  groupAvatar: {
    width: SMALL_AVATAR_SIZE,
    height: SMALL_AVATAR_SIZE,
    borderRadius: shapes.radius.full,
    position: 'absolute',
  },
  groupAvatarFirst: {
    top: 0,
    left: 0,
    zIndex: 2,
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  groupAvatarSecond: {
    bottom: 0,
    right: 0,
    zIndex: 1,
  },
  defaultAvatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: shapes.radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultAvatarText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  name: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    marginRight: spacing.sm,
  },
  time: {
    fontSize: typography.fontSize.xs,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  message: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    marginRight: spacing.sm,
  },
  blockedBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: shapes.radius.sm,
  },
  blockedText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeLabel: {
    fontSize: typography.fontSize.xs,
    marginRight: spacing.xs * 1.5,
  },
  badge: {
    minWidth: spacing.xs * 5,
    height: spacing.xs * 5,
    borderRadius: shapes.radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xs * 1.25,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.xs,
    lineHeight: typography.fontSize.xs * typography.lineHeight.tight,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
    includeFontPadding: false,
  },
}));

export default memo(MessageItem);
