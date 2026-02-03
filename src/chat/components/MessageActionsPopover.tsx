import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Popover from 'react-native-popover-view';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';

interface MessageActionsPopoverProps {
  visible: boolean;
  onRequestClose: () => void;
  onCopy: () => void;
  onReply?: () => void;
  showReply?: boolean;
  children: React.ReactElement;
}

export const MessageActionsPopover: React.FC<MessageActionsPopoverProps> = ({
  visible,
  onRequestClose,
  onCopy,
  onReply,
  showReply = false,
  children,
}) => {
  const { colors, spacing, shapes } = useTheme();

  return (
    <Popover
      isVisible={visible}
      onRequestClose={onRequestClose}
      from={children}
      placement="auto"
      backgroundStyle={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
      popoverStyle={[
        styles.card,
        {
          backgroundColor: colors.background.primary,
          borderRadius: shapes.radius.lg,
          paddingVertical: spacing.xs,
          paddingHorizontal: spacing.sm,
        },
      ]}
    >
      <View>
        {showReply && (
          <Pressable style={styles.actionRow} onPress={onReply}>
            <Ionicons name="arrow-undo" size={18} color={colors.text.primary} />
            <Text style={[styles.actionText, { color: colors.text.primary }]}>Reply</Text>
          </Pressable>
        )}
        <Pressable style={styles.actionRow} onPress={onCopy}>
          <Ionicons name="copy-outline" size={18} color={colors.text.primary} />
          <Text style={[styles.actionText, { color: colors.text.primary }]}>Copy</Text>
        </Pressable>
      </View>
    </Popover>
  );
};

const styles = StyleSheet.create({
  card: {
    minWidth: 160,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
