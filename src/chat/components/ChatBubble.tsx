import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, Clipboard, Pressable, Image } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Bubble, MessageText } from 'react-native-gifted-chat';
import type { ChatMessage } from '../types';
import { chatStyles as styles } from './styles';
import { isSameUser, isSameDay, getProfileLabel } from './utils';
import { useTheme } from '@/theme';
import { MessageActionsPopover } from './MessageActionsPopover';

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
  const { colors, palette: themePalette } = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);

  const media = useMemo(() => {
    const raw = currentMessage._raw ?? (currentMessage as any);
    if (!raw) return null;

    const image =
      raw.image?.sizes?.['240x240'] ||
      raw.image?.original ||
      raw.content?.post?.images?.[0]?.original ||
      raw.file?.original;

    const video =
      (typeof raw.video === 'string' ? raw.video : raw.video?.original || raw.video?.url) ||
      raw.content?.post?.videos?.[0]?.original;

    if (raw.type === 'video' && video) return { type: 'video' as const, uri: video };
    if (raw.type === 'image' && image) return { type: 'image' as const, uri: image };

    if (image) return { type: 'image' as const, uri: image };
    if (video) return { type: 'video' as const, uri: video };

    return null;
  }, [currentMessage]);

  const sameUserMsg = isSameUser(currentMessage, previousMessage);
  const sameDayMsg = isSameDay(currentMessage, previousMessage);
  const sameUserNext = isSameUser(currentMessage, nextMessage);
  const canShowActions = !media;

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

  const isOwnMessage = position === 'right';

  const handleCopy = useCallback(() => {
    Clipboard.setString(currentMessage.text ?? '');
    setMenuVisible(false);
  }, [currentMessage.text]);

  const handleReply = useCallback(() => {
    onReply?.(currentMessage);
    setMenuVisible(false);
  }, [onReply, currentMessage]);

  const renderMessageText = (textProps: any) => {
    const { isUserBlocked, isHidden } = currentMessage;
    if (!textProps?.currentMessage?.text) {
      return null;
    }
    return (
      <MessageText
        {...textProps}
        containerStyle={{
          left: styles.messageTextContainer,
          right: styles.messageTextContainer,
        }}
        textStyle={{
          left: [styles.messageText, { color: colors.text.primary }, (isUserBlocked || isHidden) && styles.messageTextItalic],
          right: [styles.messageText, { color: colors.text.primary }, (isUserBlocked || isHidden) && styles.messageTextItalic],
        }}
      />
    );
  };

  const renderCustomView = useCallback(() => {
    if (!media) return null;

    if (media.type === 'image') {
      return (
        <View style={styles.mediaContainer}>
          <Image source={{ uri: media.uri }} style={styles.mediaImage} resizeMode="cover" />
        </View>
      );
    }

    return (
      <View style={styles.mediaContainer}>
        <Video
          source={{ uri: media.uri }}
          style={styles.mediaVideo}
          resizeMode={ResizeMode.CONTAIN}
          useNativeControls
          isLooping={false}
        />
      </View>
    );
  }, [media]);

  return (
    <View style={styles.bubbleRow}>
      {isOwnMessage && canShowActions && (
        <MessageActionsPopover
          visible={menuVisible}
          onRequestClose={() => setMenuVisible(false)}
          onCopy={handleCopy}
          onReply={handleReply}
          showReply={showReplyAction && !isOwnMessage}
        >
          <Pressable
            onPress={() => setMenuVisible(true)}
            style={[styles.messageActionButton, styles.messageActionButtonLeft]}
          >
            <Text style={[styles.messageActionDots, { color: colors.text.secondary }]}>•••</Text>
          </Pressable>
        </MessageActionsPopover>
      )}

      <View
        style={[
          styles.bubbleContainer,
          position === 'left'
            ? [styles.bubbleContainerLeft, { backgroundColor: colors.background.secondary }]
            : [styles.bubbleContainerRight, { backgroundColor: themePalette.primary[50] }],
          sameUserMsg && sameDayMsg ? positionOffset : null,
          {
            marginBottom: sameUserNext ? 3 : 20,
            borderColor: colors.interactive.default,
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
              <Text style={[styles.bubbleNameText, { color: colors.interactive.default }, position === 'right' && { color: themePalette.primary[400] }]}>
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
            <Text style={[styles.bubbleTimeText, { color: colors.text.secondary }]}>{timeStr}</Text>
          </View>
        </View>

        {/* Reply reference */}
        {parentMessage && (
          <View style={[styles.replyMessageContainer, { backgroundColor: colors.background.secondary, borderLeftColor: colors.interactive.default }]}>
            <Text style={[styles.replyMessageName, { color: colors.interactive.default }]} numberOfLines={1}>
              {parentMessage.user?.name ?? 'Deleted'}
            </Text>
            <Text style={[styles.replyMessageText, { color: colors.text.secondary }]} numberOfLines={1}>
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
          renderCustomView={renderCustomView}
        />
      </View>

      {!isOwnMessage && canShowActions && (
        <MessageActionsPopover
          visible={menuVisible}
          onRequestClose={() => setMenuVisible(false)}
          onCopy={handleCopy}
          onReply={handleReply}
          showReply={showReplyAction && !isOwnMessage}
        >
          <Pressable
            onPress={() => setMenuVisible(true)}
            style={[styles.messageActionButton, styles.messageActionButtonRight]}
          >
            <Text style={[styles.messageActionDots, { color: colors.text.secondary }]}>•••</Text>
          </Pressable>
        </MessageActionsPopover>
      )}
    </View>
  );
};
