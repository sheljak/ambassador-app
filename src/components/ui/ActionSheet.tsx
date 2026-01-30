import React, { useCallback, useMemo, forwardRef, useImperativeHandle, useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';

export interface ActionSheetOption {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  destructive?: boolean;
}

export interface ActionSheetRef {
  open: () => void;
  close: () => void;
}

interface ActionSheetProps {
  title?: string;
  options: ActionSheetOption[];
  onClose?: () => void;
}

export const ActionSheet = forwardRef<ActionSheetRef, ActionSheetProps>(
  ({ title, options, onClose }, ref) => {
    const { colors, shapes } = useTheme();
    const insets = useSafeAreaInsets();
    const bottomSheetRef = useRef<BottomSheet>(null);

    useImperativeHandle(ref, () => ({
      open: () => bottomSheetRef.current?.expand(),
      close: () => bottomSheetRef.current?.close(),
    }));

    const snapPoints = useMemo(() => {
      const itemHeight = 56;
      const titleHeight = title ? 48 : 0;
      const padding = 24 + insets.bottom;
      const content = titleHeight + options.length * itemHeight + padding;
      return [content];
    }, [options.length, title, insets.bottom]);

    const handleClose = useCallback(() => {
      onClose?.();
    }, [onClose]);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.4}
        />
      ),
      []
    );

    const handleOptionPress = useCallback(
      (option: ActionSheetOption) => {
        bottomSheetRef.current?.close();
        // Small delay to let the sheet animate closed
        setTimeout(() => option.onPress(), 200);
      },
      []
    );

    return (
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={handleClose}
        backdropComponent={renderBackdrop}
        backgroundStyle={{
          backgroundColor: colors.background.primary,
          borderRadius: shapes.radius.lg,
        }}
        handleIndicatorStyle={{ backgroundColor: colors.text.disabled }}
      >
        <BottomSheetView style={styles.content}>
          {title && (
            <Text style={[styles.title, { color: colors.text.secondary }]}>
              {title}
            </Text>
          )}
          {options.map((option, index) => (
            <Pressable
              key={index}
              style={({ pressed }) => [
                styles.option,
                pressed && { backgroundColor: colors.background.tertiary },
                index < options.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: colors.border.default,
                },
              ]}
              onPress={() => handleOptionPress(option)}
            >
              {option.icon && (
                <Ionicons
                  name={option.icon}
                  size={22}
                  color={option.destructive ? colors.status.error : colors.text.primary}
                  style={styles.optionIcon}
                />
              )}
              <Text
                style={[
                  styles.optionLabel,
                  {
                    color: option.destructive
                      ? colors.status.error
                      : colors.text.primary,
                  },
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

ActionSheet.displayName = 'ActionSheet';

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  optionIcon: {
    marginRight: 12,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
});
