import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { chatStyles as styles } from './styles';

interface ChatMenuProps {
  visible: boolean;
  items: Array<{
    label: string;
    onPress: () => void;
    hidden?: boolean;
  }>;
}

export const ChatMenu: React.FC<ChatMenuProps> = ({ visible, items }) => {
  if (!visible) return null;

  const visibleItems = items.filter((item) => !item.hidden);
  if (visibleItems.length === 0) return null;

  return (
    <View style={styles.menuContainer}>
      {visibleItems.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.menuItem, index < visibleItems.length - 1 && styles.menuItemBorder]}
          activeOpacity={0.7}
          onPress={item.onPress}
        >
          <Text style={styles.menuItemText}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
