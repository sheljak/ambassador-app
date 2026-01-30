import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Pressable,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { FormInput, Button } from '@/components/ui';
import { useTheme } from '@/theme';
import { useAuth } from '@/hooks';
import { BiometricService, ToastService } from '@/services';

interface SignInFormData {
  email: string;
  password: string;
}

const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

export function SignInScreen() {
  const { colors, spacing, shapes, palette } = useTheme();
  const insets = useSafeAreaInsets();
  const { signIn, isLoading } = useAuth();

  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState('Face ID');
  const [biometricTypeCode, setBiometricTypeCode] = useState<number | null>(null);

  // Post-login prompt state
  const [showBiometricPrompt, setShowBiometricPrompt] = useState(false);
  const [promptPassword, setPromptPassword] = useState('');
  const [promptEmail, setPromptEmail] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur',
  });

  // Check biometric state on mount
  useEffect(() => {
    const check = async () => {
      const available = await BiometricService.isAvailable();
      setBiometricAvailable(available);
      if (available) {
        const [type, enabled] = await Promise.all([
          BiometricService.getType(),
          BiometricService.isEnabled(),
        ]);
        setBiometricType(type);
        setBiometricEnabled(enabled);

        // Get raw type code for icon selection (1 = fingerprint, 2 = face)
        const types = await BiometricService.getRawTypes();
        const code = types.find((t) => t) ?? null;
        setBiometricTypeCode(code);
      }
    };
    check();
  }, []);

  const navigateToTabs = useCallback(() => {
    router.replace('/(tabs)' as any);
  }, []);

  // After successful login, check if we should prompt user to enable biometric
  const checkBiometricPrompt = useCallback(
    async (email: string, password: string) => {
      const available = await BiometricService.isAvailable();
      if (!available) {
        navigateToTabs();
        return;
      }
      const enabled = await BiometricService.isEnabled();
      if (enabled) {
        // Already enabled — update stored credentials silently
        await BiometricService.enable(email, password);
        navigateToTabs();
        return;
      }
      const dismissed = await BiometricService.isPromptDismissed();
      if (dismissed) {
        navigateToTabs();
        return;
      }
      // Show the prompt
      setPromptEmail(email);
      setPromptPassword(password);
      setShowBiometricPrompt(true);
    },
    [navigateToTabs]
  );

  const onSubmit = async (data: SignInFormData) => {
    const result = await signIn(data.email.trim(), data.password);
    if (result.success) {
      await checkBiometricPrompt(data.email.trim(), data.password);
    }
  };

  // Biometric login (icon press)
  const handleBiometricLogin = useCallback(async () => {
    const credentials = await BiometricService.getCredentials();
    if (!credentials) {
      ToastService.error('No stored credentials. Please sign in with password first.');
      return;
    }

    const authenticated = await BiometricService.authenticate(
      `Sign in with ${biometricType}`
    );
    if (!authenticated) return;

    const result = await signIn(credentials.email, credentials.password);
    if (result.success) {
      router.replace('/(tabs)' as any);
    }
  }, [biometricType, signIn]);

  // Prompt: enable biometric
  const handleEnableBiometric = useCallback(async () => {
    const enrolled = await BiometricService.isAvailable();
    if (!enrolled) {
      Alert.alert(
        `No ${biometricType} record found`,
        'Please add it in your device settings.',
        [{ text: 'OK' }]
      );
      return;
    }
    const authenticated = await BiometricService.authenticate(
      `Enable ${biometricType}`
    );
    if (!authenticated) {
      ToastService.error(`${biometricType} verification failed`);
      return;
    }
    await BiometricService.enable(promptEmail, promptPassword);
    await BiometricService.resetPromptDismissed();
    setShowBiometricPrompt(false);
    setBiometricEnabled(true);
    ToastService.success(`${biometricType} enabled`);
    navigateToTabs();
  }, [biometricType, promptEmail, promptPassword, navigateToTabs]);

  // Prompt: skip
  const handleSkipBiometric = useCallback(async () => {
    await BiometricService.dismissPrompt();
    setShowBiometricPrompt(false);
    navigateToTabs();
  }, [navigateToTabs]);

  const handleBack = () => {
    router.back();
  };

  const biometricIconName =
    biometricTypeCode === 1 ? 'finger-print-outline' : 'scan-outline';

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={handleBack} style={styles.backButton}>
              <ThemedText style={{ color: colors.interactive.default }}>
                ← Back
              </ThemedText>
            </Pressable>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <ThemedText type="title" style={styles.title}>
              Sign In
            </ThemedText>

            <ThemedText style={[styles.subtitle, { color: colors.text.secondary }]}>
              Welcome back! Please sign in to continue.
            </ThemedText>

            {/* Email input */}
            <FormInput
              control={control}
              name="email"
              label="Email"
              placeholder="Enter your email"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
              disabled={isLoading}
              rules={{
                required: 'Email is required',
                pattern: {
                  value: EMAIL_REGEX,
                  message: 'Please enter a valid email address',
                },
              }}
            />

            {/* Password input */}
            <FormInput
              control={control}
              name="password"
              label="Password"
              placeholder="Enter your password"
              secureTextEntry
              showPasswordToggle
              textContentType="password"
              autoComplete="password"
              disabled={isLoading}
              rules={{
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              }}
            />

            {/* Sign In button + biometric icon */}
            <View style={styles.signInRow}>
              <Button
                title="Sign In"
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
                disabled={isLoading}
                size="lg"
                style={styles.signInButton}
              />
              {biometricAvailable && biometricEnabled && (
                <Pressable
                  onPress={handleBiometricLogin}
                  style={({ pressed }) => [
                    styles.biometricButton,
                    {
                      borderColor: colors.border.default,
                      borderRadius: shapes.radius.md,
                      backgroundColor: colors.background.secondary,
                    },
                    pressed && { opacity: 0.6 },
                  ]}
                >
                  <Ionicons
                    name={biometricIconName as any}
                    size={28}
                    color={palette.primary[500]}
                  />
                </Pressable>
              )}
            </View>

            {/* Forgot password link */}
            <Pressable
              style={styles.forgotPassword}
              onPress={() => {
                // TODO: Navigate to forgot password
              }}
            >
              <ThemedText
                style={[styles.forgotPasswordText, { color: colors.interactive.default }]}
              >
                Forgot password?
              </ThemedText>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Post-login biometric enable prompt */}
      <Modal
        visible={showBiometricPrompt}
        transparent
        animationType="fade"
        onRequestClose={handleSkipBiometric}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.background.primary,
                borderRadius: shapes.radius.lg,
              },
            ]}
          >
            <Ionicons
              name={biometricTypeCode === 1 ? 'finger-print' : 'scan'}
              size={48}
              color={palette.primary[500]}
              style={styles.modalIcon}
            />
            <ThemedText style={styles.modalTitle}>
              Enable {biometricType}?
            </ThemedText>
            <ThemedText style={[styles.modalDescription, { color: colors.text.secondary }]}>
              Sign in faster next time using {biometricType}. You can change
              this anytime from settings.
            </ThemedText>
            <View style={styles.modalButtons}>
              <Button
                title={`Enable ${biometricType}`}
                size="md"
                onPress={handleEnableBiometric}
                style={styles.modalButton}
              />
              <Button
                title="Skip"
                variant="outline"
                size="md"
                onPress={handleSkipBiometric}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    paddingVertical: 8,
    paddingRight: 16,
    alignSelf: 'flex-start',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 32,
    fontSize: 16,
  },
  signInRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    gap: 12,
  },
  signInButton: {
    flex: 1,
  },
  biometricButton: {
    width: 52,
    height: 52,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  forgotPassword: {
    alignSelf: 'center',
    marginTop: 24,
    padding: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 32,
  },
  modalContent: {
    width: '100%',
    padding: 24,
    alignItems: 'center',
  },
  modalIcon: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalButtons: {
    width: '100%',
    gap: 10,
  },
  modalButton: {
    width: '100%',
  },
});
