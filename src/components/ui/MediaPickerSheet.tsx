import React, { useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  Animated,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, createStyles, spacing as spacingTokens } from '@/theme';

const SHEET_HEIGHT = spacingTokens.xs * 80;

interface MediaPickerSheetProps {
  visible: boolean;
  onClose: () => void;
  onCamera: () => void;
  onLibrary: () => void;
}

export function MediaPickerSheet({
  visible,
  onClose,
  onCamera,
  onLibrary,
}: MediaPickerSheetProps) {
  const { colors, shapes } = useTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();

  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT + insets.bottom)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 20,
          stiffness: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      slideAnim.setValue(SHEET_HEIGHT + insets.bottom);
      backdropAnim.setValue(0);
    }
  }, [visible, slideAnim, backdropAnim, insets.bottom]);

  const animateClose = useCallback(
    (then?: () => void) => {
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SHEET_HEIGHT + insets.bottom,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onClose();
        then?.();
      });
    },
    [backdropAnim, slideAnim, insets.bottom, onClose],
  );

  const handleCamera = useCallback(() => {
    animateClose(onCamera);
  }, [animateClose, onCamera]);

  const handleLibrary = useCallback(() => {
    animateClose(onLibrary);
  }, [animateClose, onLibrary]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={() => animateClose()}
    >
      <View style={styles.container}>
        {/* Backdrop */}
        <Animated.View
          style={[styles.backdrop, { opacity: backdropAnim }]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={() => animateClose()} />
        </Animated.View>

        {/* Sheet */}
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.background.primary,
              borderTopLeftRadius: shapes.radius.xl,
              borderTopRightRadius: shapes.radius.xl,
              paddingBottom: insets.bottom + 12,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Handle */}
          <View style={styles.handleRow}>
            <View style={[styles.handle, { backgroundColor: colors.text.disabled }]} />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text.primary }]}>
            Change Photo
          </Text>

          {/* Options */}
          <View style={styles.options}>
            <Pressable
              style={({ pressed }) => [
                styles.option,
                {
                  backgroundColor: colors.background.secondary,
                  borderRadius: shapes.radius.lg,
                },
                pressed && { opacity: 0.7 },
              ]}
              onPress={handleCamera}
            >
              <View style={[styles.iconWrap, { backgroundColor: colors.interactive.default }]}>
                <Ionicons name="camera" size={24} color="#fff" />
              </View>
              <View style={styles.optionText}>
                <Text style={[styles.optionLabel, { color: colors.text.primary }]}>
                  Take Photo
                </Text>
                <Text style={[styles.optionHint, { color: colors.text.secondary }]}>
                  Use your camera
                </Text>
              </View>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.option,
                {
                  backgroundColor: colors.background.secondary,
                  borderRadius: shapes.radius.lg,
                },
                pressed && { opacity: 0.7 },
              ]}
              onPress={handleLibrary}
            >
              <View style={[styles.iconWrap, { backgroundColor: colors.interactive.default }]}>
                <Ionicons name="images" size={24} color="#fff" />
              </View>
              <View style={styles.optionText}>
                <Text style={[styles.optionLabel, { color: colors.text.primary }]}>
                  Choose from Library
                </Text>
                <Text style={[styles.optionHint, { color: colors.text.secondary }]}>
                  Select an existing photo
                </Text>
              </View>
            </Pressable>
          </View>

          {/* Cancel */}
          <Pressable
            style={({ pressed }) => [
              styles.cancelBtn,
              {
                backgroundColor: colors.background.secondary,
                borderRadius: shapes.radius.lg,
              },
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => animateClose()}
          >
            <Text style={[styles.cancelText, { color: colors.status.error }]}>Cancel</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const useStyles = createStyles(({ spacing, typography, shapes }) => ({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    paddingHorizontal: spacing.md,
  },
  handleRow: {
    alignItems: 'center',
    paddingVertical: spacing.xs * 2.5,
  },
  handle: {
    width: spacing.xs * 9,
    height: spacing.xs,
    borderRadius: shapes.radius.sm,
  },
  title: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  options: {
    gap: spacing.xs * 2.5,
    marginBottom: spacing.sm * 1.5,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xs * 3.5,
    gap: spacing.sm * 1.5,
  },
  iconWrap: {
    width: spacing.xs * 11,
    height: spacing.xs * 11,
    borderRadius: shapes.radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
  optionHint: {
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs / 2,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  cancelText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
}));
