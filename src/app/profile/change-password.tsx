import React, { useCallback, useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useForm } from 'react-hook-form';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { FormInput, Button } from '@/components/ui';
import { useTheme } from '@/theme';
import {
  useGetPasswordLetterMutation,
  useSetPasswordMutation,
} from '@/store/features/auth/api';
import { ToastService } from '@/services';

interface PasswordFormData {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

const CODE_LENGTH = 6;

export default function ChangePasswordScreen() {
  const { colors, palette, spacing, shapes } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [getPasswordLetter, { isLoading: isSendingCode }] = useGetPasswordLetterMutation();
  const [setPassword, { isLoading: isSettingPassword }] = useSetPasswordMutation();

  const [step, setStep] = useState<'form' | 'code'>('form');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [code, setCode] = useState('');
  const codeInputRef = useRef<TextInput>(null);

  const { control, handleSubmit } = useForm<PasswordFormData>({
    defaultValues: {
      old_password: '',
      new_password: '',
      confirm_password: '',
    },
  });

  const onSubmitPasswords = useCallback(
    async (values: PasswordFormData) => {
      try {
        await getPasswordLetter({ old_password: values.old_password }).unwrap();
        setOldPassword(values.old_password);
        setNewPassword(values.new_password);
        setStep('code');
        setTimeout(() => codeInputRef.current?.focus(), 300);
      } catch {
        ToastService.error('Incorrect password or failed to send code');
      }
    },
    [getPasswordLetter]
  );

  const onSubmitCode = useCallback(async () => {
    try {
      await setPassword({
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: newPassword,
        verification_code: code.toLowerCase(),
      }).unwrap();
      ToastService.success('Your password was changed');
      router.back();
    } catch {
      ToastService.error('Failed to change password');
    }
  }, [setPassword, oldPassword, newPassword, code, router]);

  const handleCodeChange = useCallback(
    (text: string) => {
      const cleaned = text.replace(/[^a-zA-Z0-9]/g, '').slice(0, CODE_LENGTH);
      setCode(cleaned);
      if (cleaned.length === CODE_LENGTH) {
        Keyboard.dismiss();
      }
    },
    []
  );

  const renderPasswordForm = () => (
    <View style={styles.formSection}>
      <FormInput
        control={control}
        name="old_password"
        label="Old password"
        placeholder="Enter current password"
        secureTextEntry
        maxLength={40}
        rules={{
          required: 'Enter your password',
          minLength: { value: 6, message: 'Must be at least 6 characters' },
        }}
      />
      <FormInput
        control={control}
        name="new_password"
        label="New password"
        placeholder="Enter new password"
        secureTextEntry
        maxLength={40}
        rules={{
          required: 'Enter new password',
          minLength: { value: 6, message: 'Must be at least 6 characters' },
        }}
      />
      <FormInput
        control={control}
        name="confirm_password"
        label="Confirm password"
        placeholder="Confirm new password"
        secureTextEntry
        maxLength={40}
        rules={{
          required: 'Confirm your password',
          minLength: { value: 6, message: 'Must be at least 6 characters' },
          validate: (value: string, formValues: PasswordFormData) =>
            value === formValues.new_password || "Passwords don't match",
        }}
      />
      <Button
        title="Next"
        onPress={handleSubmit(onSubmitPasswords)}
        loading={isSendingCode}
        disabled={isSendingCode}
        size="lg"
        style={{ marginTop: spacing.md }}
      />
    </View>
  );

  const renderCodeStep = () => (
    <View style={styles.codeSection}>
      <ThemedText style={styles.codeTitle}>Enter Confirmation Code</ThemedText>
      <ThemedText style={[styles.codeSubtitle, { color: palette.primary[500] }]}>
        (check your email address)
      </ThemedText>

      <View style={styles.codeInputContainer}>
        <TextInput
          ref={codeInputRef}
          style={[
            styles.codeInput,
            {
              color: colors.text.primary,
              borderColor: colors.border.default,
              borderRadius: shapes.radius.md,
              backgroundColor: colors.background.secondary,
            },
          ]}
          value={code}
          onChangeText={handleCodeChange}
          maxLength={CODE_LENGTH}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="default"
          textContentType="oneTimeCode"
          placeholder="Enter code"
          placeholderTextColor={colors.text.disabled}
          textAlign="center"
        />
      </View>

      <Button
        title="Submit"
        onPress={onSubmitCode}
        loading={isSettingPassword}
        disabled={code.length !== CODE_LENGTH || isSettingPassword}
        size="lg"
        style={{ marginTop: spacing.lg }}
      />
    </View>
  );

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: colors.border.default }]}>
        <Pressable
          onPress={() => {
            if (step === 'code') {
              setStep('form');
              setCode('');
            } else {
              router.back();
            }
          }}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={palette.primary[500]} />
        </Pressable>
        <ThemedText style={styles.headerTitle}>Change Password</ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {step === 'form' ? renderPasswordForm() : renderCodeStep()}
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    marginRight: 40,
  },
  headerSpacer: {
    width: 0,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  formSection: {
    gap: 4,
  },
  codeSection: {
    alignItems: 'center',
    paddingTop: 20,
  },
  codeTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 6,
  },
  codeSubtitle: {
    fontSize: 14,
    marginBottom: 24,
  },
  codeInputContainer: {
    width: '100%',
  },
  codeInput: {
    fontSize: 24,
    fontWeight: '600',
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 56,
  },
});
