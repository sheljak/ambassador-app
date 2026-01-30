import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useForm } from 'react-hook-form';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { FormInput, Button, Input } from '@/components/ui';
import { useTheme } from '@/theme';
import {
  useGetEmailLetterMutation,
  useSetEmailMutation,
} from '@/store/features/auth/api';
import { ToastService } from '@/services';

interface EmailFormData {
  email: string;
  password: string;
}

const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,16}$/i;

export default function ChangeEmailScreen() {
  const { colors, palette, spacing, shapes } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [getEmailLetter, { isLoading: isSendingLetter }] = useGetEmailLetterMutation();
  const [setEmail, { isLoading: isSettingEmail }] = useSetEmailMutation();

  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [newEmail, setNewEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  const { control, handleSubmit } = useForm<EmailFormData>({
    defaultValues: { email: '', password: '' },
  });

  // Step 1: Submit new email + password to get verification letter
  const onSubmitEmail = useCallback(
    async (values: EmailFormData) => {
      try {
        await getEmailLetter({
          email: values.email,
          password: values.password,
        }).unwrap();
        setNewEmail(values.email);
        setStep('verify');
        ToastService.success('Verification code sent to your new email');
      } catch (error: any) {
        const message = error?.data?.message || 'Failed to send verification code';
        ToastService.error(message);
      }
    },
    [getEmailLetter]
  );

  // Step 2: Submit verification code
  const onSubmitCode = useCallback(async () => {
    if (verificationCode.length !== 6) return;

    try {
      await setEmail({
        email: newEmail,
        verification_code: verificationCode.toLowerCase(),
      }).unwrap();
      ToastService.success('Email changed successfully');
      router.back();
    } catch (error: any) {
      const message = error?.data?.message || 'Failed to change email';
      ToastService.error(message);
    }
  }, [setEmail, newEmail, verificationCode, router]);

  const handleCodeChange = useCallback((text: string) => {
    const cleaned = text.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6);
    setVerificationCode(cleaned);
    if (cleaned.length === 6) {
      Keyboard.dismiss();
    }
  }, []);

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border.default }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={palette.primary[500]} />
        </Pressable>
        <ThemedText style={styles.headerTitle}>Change Email</ThemedText>
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
          {step === 'form' ? (
            <>
              {/* Icon */}
              <View style={styles.iconSection}>
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: palette.primary[100] },
                  ]}
                >
                  <Ionicons name="mail-outline" size={40} color={palette.primary[500]} />
                </View>
              </View>

              <ThemedText style={[styles.description, { color: colors.text.secondary }]}>
                Enter your new email address and current password to receive a verification code.
              </ThemedText>

              {/* Form */}
              <View style={styles.formContainer}>
                <FormInput
                  control={control}
                  name="email"
                  label="New Email"
                  placeholder="Enter your new email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={40}
                  rules={{
                    required: 'Enter your new email',
                    pattern: {
                      value: EMAIL_REGEX,
                      message: 'Invalid email address',
                    },
                  }}
                />

                <FormInput
                  control={control}
                  name="password"
                  label="Current Password"
                  placeholder="Enter your password"
                  secureTextEntry
                  showPasswordToggle
                  maxLength={40}
                  rules={{
                    required: 'Enter your password',
                    minLength: {
                      value: 6,
                      message: 'Must be 6 or more characters',
                    },
                  }}
                />
              </View>

              <Button
                title="Next"
                onPress={handleSubmit(onSubmitEmail)}
                loading={isSendingLetter}
                disabled={isSendingLetter}
                size="lg"
                style={{ marginTop: spacing.md }}
              />
            </>
          ) : (
            <>
              {/* Verification Step */}
              <View style={styles.iconSection}>
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: palette.primary[100] },
                  ]}
                >
                  <Ionicons name="shield-checkmark-outline" size={40} color={palette.primary[500]} />
                </View>
              </View>

              <ThemedText style={[styles.description, { color: colors.text.secondary }]}>
                Enter the 6-character confirmation code sent to your new email address.
              </ThemedText>

              <ThemedText style={[styles.emailHint, { color: palette.primary[500] }]}>
                {newEmail}
              </ThemedText>

              <View style={styles.formContainer}>
                <Input
                  label="Confirmation Code"
                  placeholder="Enter 6-character code"
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={6}
                  value={verificationCode}
                  onChangeText={handleCodeChange}
                  autoFocus
                />
              </View>

              <Button
                title="Submit"
                onPress={onSubmitCode}
                loading={isSettingEmail}
                disabled={isSettingEmail || verificationCode.length !== 6}
                size="lg"
                style={{ marginTop: spacing.md }}
              />
            </>
          )}
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
  iconSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  emailHint: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  formContainer: {
    gap: 4,
  },
});
