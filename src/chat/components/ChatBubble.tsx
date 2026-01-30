import React, { useCallback } from 'react';
import { View, Text, Clipboard, Pressable } from 'react-native';
import { Bubble, MessageText } from 'react-native-gifted-chat';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { Ionicons } from '@expo/vector-icons';
import type { ChatMessage } from '../types';
import { chatStyles as styles, COLORS } from './styles';
import { isSameUser, isSameDay, getProfileLabel } from './utils';

interface ChatBubbleProps {
  currentMessage: ChatMessage;
  previousMessage?: ChatMessage;
  nextMessage?: ChatMessage;
  position: 'left' | 'right';
  showReplyAction?: boolean;
  onReply?: (message: ChatMessage) => void;
  [key: string]: any;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  currentMessage,
  previousMessage,
  nextMessage,
  position,
  showReplyAction = false,
  onReply,
  ...props
}) => {
  const { showActionSheetWithOptions } = useActionSheet();

  const sameUserMsg = isSameUser(currentMessage, previousMessage);
  const sameDayMsg = isSameDay(currentMessage, previousMessage);
  const sameUserNext = isSameUser(currentMessage, nextMessage);

  const positionOffset = position === 'left' ? { marginLeft: 28 } : { marginRight: 28 };

  const timeStr = currentMessage.createdAt
    ? new Date(currentMessage.createdAt as number | string).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    : '';

  const user = currentMessage._raw?.user;
  const profileInfo = user ? getProfileLabel(user as any) : '';
  const prevUser = previousMessage?._raw?.user;
  const showProfile = !prevUser || prevUser.id !== user?.id;

  const parentMessage = currentMessage.parentMessage;

  const handleLongPress = useCallback(() => {
    const options: string[] = [];
    const icons: React.ReactElement[] = [];

    if (showReplyAction) {
      options.push('Reply');
      icons.push(<Ionicons name="arrow-undo" size={20} color={COLORS.text} />);
    }
    options.push('Copy');
    icons.push(<Ionicons name="copy-outline" size={20} color={COLORS.text} />);
    options.push('Cancel');
    icons.push(<Ionicons name="close" size={20} color={COLORS.error} />);

    showActionSheetWithOptions(
      {
        options,
        icons,
        cancelButtonIndex: options.length - 1,
        title: 'Message',
      },
      (index) => {
        if (index === undefined) return;
        if (showReplyAction && index === 0) {
          onReply?.(currentMessage);
        } else if (index === (showReplyAction ? 1 : 0)) {
          Clipboard.setString(currentMessage.text ?? '');
        }
      },
    );
  }, [showReplyAction, onReply, currentMessage, showActionSheetWithOptions]);

  const renderMessageText = (textProps: any) => {
    const { isUserBlocked, isHidden } = currentMessage;
    return (
      <MessageText
        {...textProps}
        containerStyle={{
          left: styles.messageTextContainer,
          right: styles.messageTextContainer,
        }}
        textStyle={{
          left: [styles.messageText, (isUserBlocked || isHidden) && styles.messageTextItalic],
          right: [styles.messageText, (isUserBlocked || isHidden) && styles.messageTextItalic],
        }}
      />
    );
  };

  return (
    <Pressable onLongPress={handleLongPress}>
      <View
        style={[
          styles.bubbleContainer,
          position === 'left' ? styles.bubbleContainerLeft : styles.bubbleContainerRight,
          sameUserMsg && sameDayMsg ? positionOffset : null,
          {
            marginBottom: sameUserNext ? 3 : 20,
            borderColor: COLORS.primary,
            borderWidth: currentMessage.isSearchedMessage || currentMessage.isPinnedMessage ? 1 : 0,
          },
        ]}
      >
        {/* Name + time */}
        <View style={styles.bubbleTopContainer}>
          <View style={styles.bubbleNameContainer}>
            <View style={styles.bubbleNameRow}>
              {currentMessage.isPinnedMessage && (
                <View style={styles.pinnedDot} />
              )}
              <Text style={[styles.bubbleNameText, position === 'right' && styles.bubbleNameTextRight]}>
                {currentMessage.user?.name ?? ''}
              </Text>
              {currentMessage.isUserBlocked && (
                <Text style={styles.bubbleBlockedText}>-blocked</Text>
              )}
            </View>
            {showProfile && position === 'left' && profileInfo ? (
              <Text style={styles.bubbleProfileInfo}>{profileInfo}</Text>
            ) : null}
          </View>
          <View style={styles.bubbleTimeContainer}>
            <Text style={styles.bubbleTimeText}>{timeStr}</Text>
          </View>
        </View>

        {/* Reply reference */}
        {parentMessage && (
          <View style={styles.replyMessageContainer}>
            <Text style={styles.replyMessageName} numberOfLines={1}>
              {parentMessage.user?.name ?? 'Deleted'}
            </Text>
            <Text style={styles.replyMessageText} numberOfLines={1}>
              {parentMessage.content?.text ?? ''}
            </Text>
          </View>
        )}

        {/* Message bubble */}
        <Bubble
          {...props}
          currentMessage={currentMessage}
          previousMessage={previousMessage}
          nextMessage={nextMessage}
          position={position}
          containerStyle={{ left: {}, right: {} }}
          wrapperStyle={{
            left: styles.bubbleWrapperLeft,
            right: styles.bubbleWrapperRight,
          }}
          bottomContainerStyle={{
            left: styles.bubbleBottomHidden,
            right: styles.bubbleBottomHidden,
          }}
          renderMessageText={renderMessageText}
        />
      </View>
    </Pressable>
  );
};
