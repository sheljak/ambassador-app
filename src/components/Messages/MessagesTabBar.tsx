import React, { memo } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/theme';
import type { ActivityTab } from '@/store/types_that_will_used';

interface TabData {
  key: ActivityTab;
  label: string;
  count: number;
}

interface MessagesTabBarProps {
  tabs: TabData[];
  activeTab: ActivityTab;
  onTabChange: (tab: ActivityTab) => void;
}

const MessagesTabBar: React.FC<MessagesTabBarProps> = ({
  tabs,
  activeTab,
  onTabChange,
}) => {
  const { colors, palette } = useTheme();

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <Pressable
            key={tab.key}
            style={[
              styles.tab,
              isActive && { borderBottomColor: palette.primary[500], borderBottomWidth: 2 },
            ]}
            onPress={() => onTabChange(tab.key)}
          >
            <View style={styles.tabContent}>
              <ThemedText
                style={[
                  styles.tabLabel,
                  { color: isActive ? palette.primary[500] : colors.text.secondary },
                ]}
              >
                {tab.label}
              </ThemedText>
              {tab.count > 0 && (
                <View style={[styles.badge, { backgroundColor: palette.primary[500] }]}>
                  <Text style={styles.badgeText}>
                    {tab.count > 99 ? '99+' : tab.count}
                  </Text>
                </View>
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  badge: {
    marginLeft: 6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '700',
    textAlign: 'center',
    includeFontPadding: false,
  },
});

export default memo(MessagesTabBar);
