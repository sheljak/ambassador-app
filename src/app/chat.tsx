import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { ChatView, mapDialogTypeKeyToChatType, getChatConfig } from '@/chat';

export default function ChatScreen() {
  const { dialogId, dialogName, dialogTypeKey } = useLocalSearchParams<{
    dialogId: string;
    dialogName: string;
    dialogTypeKey: string;
  }>();

  const chatType = mapDialogTypeKeyToChatType(dialogTypeKey);

  return (
    <ChatView
      dialogId={Number(dialogId)}
      dialogName={dialogName}
      chatType={chatType}
      config={getChatConfig(chatType)}
    />
  );
}
