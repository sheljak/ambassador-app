import React, { useState, useRef, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GiftedChat, Avatar, SystemMessage, Send } from 'react-native-gifted-chat';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import type { ChatViewProps, ChatMessage } from '../types';
import { getChatConfig } from '../types';
import { useChat } from '../hooks/useChat';
import { ChatBubble } from './ChatBubble';
import { ChatMenu } from './ChatMenu';
import { ReplyFooter, ClosedChatBanner } from './ChatInput';
import { chatStyles as styles } from './styles';
import { useTheme } from '@/theme';

export const ChatView: React.FC<ChatViewProps> = ({
  dialogId,
  dialogName,
  chatType,
  config: configOverride,
  searchTerm,
  onBack,
  onAvatarPress,
}) => {
  const router = useRouter();
  const { colors } = useTheme();
  const config = configOverride ?? getChatConfig(chatType);

  const {
    messages,
    dialog,
    currentUserId,
    isLoadingMore,
    hasMore,
    onSend,
    onLoadEarlier,
    replyTo,
    startReply,
    cancelReply,
    dialogClosed,
    dialogArchived,
  } = useChat({ dialogId, chatType, config, searchTerm });

  const giftedChatRef = useRef<any>(null);
  const [showMenu, setShowMenu] = useState(false);

  const handleBack = useCallback(() => {
    onBack ? onBack() : router.back();
  }, [onBack, router]);

  const handleReply = useCallback(
    (message: ChatMessage) => {
      startReply(message);
    },
    [startReply],
  );

  const inputDisabled = dialogClosed;

  const renderSend = useCallback(
    (props: any) => (
      <Send {...props} containerStyle={styles.sendContainer}>
        <View style={[styles.sendButton, { backgroundColor: colors.interactive.default }]}>
          <Ionicons name="send" size={14} color={colors.text.inverse} />
        </View>
      </Send>
    ),
    [colors],
  );

  const renderSystemMessage = useCallback(
    (props: any) => (
      <SystemMessage
        {...props}
        containerStyle={styles.systemMessageContainer}
        textStyle={styles.systemMessageText}
        wrapperStyle={styles.systemMessageWrapper}
      />
    ),
    [],
  );

  const renderAvatar = useCallback(
    (props: any) => (
      <Avatar
        {...props}
        containerStyle={{
          left: styles.avatarContainerLeft,
          right: styles.avatarContainerRight,
        }}
        imageStyle={{
          left: styles.avatarImage,
          right: styles.avatarImage,
        }}
        onPressAvatar={onAvatarPress}
      />
    ),
    [onAvatarPress],
  );

  const renderBubble = useCallback(
    (props: any) => (
      <ChatBubble
        {...props}
        showReplyAction={config.showReplyFeature}
        onReply={handleReply}
      />
    ),
    [config.showReplyFeature, handleReply],
  );

  const renderChatFooter = useCallback(() => {
    if (replyTo) {
      return <ReplyFooter replyTo={replyTo} onDismiss={cancelReply} />;
    }
    return null;
  }, [replyTo, cancelReply]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background.primary }]} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border.default }]}>
        <Pressable onPress={handleBack} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </Pressable>
        <View style={styles.headerTitle}>
          <Text style={[styles.headerTitleText, { color: colors.text.primary }]} numberOfLines={1}>
            {dialogName || dialog?.dialog_name || 'Chat'}
          </Text>
        </View>
        {config.showMenuFeature && (
          <Pressable onPress={() => setShowMenu((p) => !p)} style={styles.headerBtn}>
            <Ionicons name="menu" size={24} color={colors.text.primary} />
          </Pressable>
        )}
      </View>

      <View style={[styles.container, dialogClosed && styles.containerClosed]}>
        {config.showMenuFeature && showMenu && (
          <ChatMenu visible={showMenu} items={config.menuItems ?? []} />
        )}

        <GiftedChat<ChatMessage>
          messagesContainerRef={giftedChatRef}
          messages={messages}
          onSend={onSend}
          user={{ _id: currentUserId }}
          timeFormat="HH:mm"
          minInputToolbarHeight={inputDisabled ? 0 : 52}
          isAvatarOnTop
          loadEarlierMessagesProps={{
            isAvailable: hasMore && !searchTerm,
            isLoading: isLoadingMore,
            onPress: onLoadEarlier,
          }}
          isUserAvatarVisible
          renderSystemMessage={renderSystemMessage}
          renderSend={renderSend}
          renderAvatar={renderAvatar}
          renderBubble={renderBubble}
          renderChatFooter={renderChatFooter}
          renderInputToolbar={inputDisabled ? null : undefined}
          onPressAvatar={onAvatarPress as any}
          textInputStyle={{
            fontSize: 15,
            lineHeight: 20,
            paddingHorizontal: 12,
            paddingTop: 10,
            paddingBottom: 10,
            color: colors.text.primary,
            backgroundColor: colors.background.secondary,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: colors.border.default,
            marginLeft: 10,
            marginRight: 4,
            marginBottom: 6,
            marginTop: 6,
          }}
          textInputProps={{
            placeholderTextColor: colors.text.disabled,
            placeholder: 'Type a message...',
          }}
        />

        {dialogClosed && !dialogArchived && <ClosedChatBanner type="closed" />}
        {dialogArchived && <ClosedChatBanner type="archived" />}
      </View>
    </SafeAreaView>
  );
};
