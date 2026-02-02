import React, { useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';

const SHEET_HEIGHT = 320;

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    paddingHorizontal: 16,
  },
  handleRow: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  options: {
    gap: 10,
    marginBottom: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  optionHint: {
    fontSize: 12,
    marginTop: 2,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
