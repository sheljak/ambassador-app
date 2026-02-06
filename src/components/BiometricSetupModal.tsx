import React, { useState, useCallback } from 'react';
import { View, Modal, Pressable } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { FormInput, Button } from '@/components/ui';
import { useTheme, createStyles } from '@/theme';
import { BiometricService } from '@/services/biometric';
import { ToastService } from '@/services/toast';
import { useForm } from 'react-hook-form';

interface BiometricSetupModalProps {
  visible: boolean;
  biometricType: string;
  email: string;
  onComplete: () => void;
  onSkip: () => void;
}

interface PasswordForm {
  password: string;
}

export function BiometricSetupModal({
  visible,
  biometricType,
  email,
  onComplete,
  onSkip,
}: BiometricSetupModalProps) {
  const { colors, shapes, spacing } = useTheme();
  const styles = useStyles();
  const [isEnabling, setIsEnabling] = useState(false);

  const { control, handleSubmit, reset } = useForm<PasswordForm>({
    defaultValues: { password: '' },
  });

  const handleEnable = useCallback(
    async (data: PasswordForm) => {
      setIsEnabling(true);
      try {
        const success = await BiometricService.authenticate(
          `Confirm ${biometricType} setup`
        );
        if (!success) {
          ToastService.error(`${biometricType} authentication failed`);
          setIsEnabling(false);
          return;
        }
        await BiometricService.enable(email, data.password);
        ToastService.success(`${biometricType} enabled`);
        reset();
        onComplete();
      } catch {
        ToastService.error('Failed to enable biometric login');
      } finally {
        setIsEnabling(false);
      }
    },
    [biometricType, email, onComplete, reset]
  );

  const handleSkip = useCallback(() => {
    BiometricService.dismissPrompt();
    reset();
    onSkip();
  }, [onSkip, reset]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View
          style={[
            styles.content,
            {
              backgroundColor: colors.background.primary,
              borderRadius: shapes.radius.lg,
            },
          ]}
        >
          <ThemedText style={styles.title}>
            Enable {biometricType}?
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: colors.text.secondary }]}>
            Sign in quickly using {biometricType}. Enter your password to confirm.
          </ThemedText>

          <View style={styles.inputContainer}>
            <FormInput
              control={control}
              name="password"
              label="Password"
              placeholder="Enter your password"
              secureTextEntry
              showPasswordToggle
              rules={{
                required: 'Password is required',
                minLength: { value: 6, message: 'At least 6 characters' },
              }}
            />
          </View>

          <Button
            title={`Enable ${biometricType}`}
            onPress={handleSubmit(handleEnable)}
            loading={isEnabling}
            disabled={isEnabling}
            size="lg"
            style={{ marginTop: spacing.sm }}
          />

          <Pressable onPress={handleSkip} style={styles.skipButton}>
            <ThemedText style={[styles.skipText, { color: colors.text.secondary }]}>
              Skip
            </ThemedText>
          </Pressable>

          <ThemedText style={[styles.note, { color: colors.text.disabled }]}>
            You can change this anytime in Settings
          </ThemedText>
        </View>
      </View>
    </Modal>
  );
}

const useStyles = createStyles(({ spacing, typography }) => ({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: spacing['2xl'],
  },
  content: {
    width: '100%',
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
    marginBottom: spacing.xs * 5,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  inputContainer: {
    width: '100%',
  },
  skipButton: {
    alignSelf: 'center',
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  skipText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  note: {
    fontSize: typography.fontSize.xs,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
}));
