import React, { memo } from 'react';
import { View, Pressable, Text } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { useTheme, createStyles } from '@/theme';
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
  const styles = useStyles();

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
            <View>
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

const useStyles = createStyles(({ spacing, typography, shapes }) => ({
  container: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm * 1.5,
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  badge: {
    position: 'absolute',
    right: -spacing.xs * 4.25,
    top: -spacing.sm,
    minWidth: spacing.xs * 4,
    height: spacing.xs * 4,
    borderRadius: shapes.radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xs * 0.75,
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

export default memo(MessagesTabBar);
