import {
  StyleSheet,
  Pressable,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { FormInput, Button } from '@/components/ui';
import { useTheme } from '@/theme';
import { useAuth } from '@/hooks';

interface SignInFormData {
  email: string;
  password: string;
}

const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

export function SignInScreen() {
  const { colors, spacing, shapes } = useTheme();
  const insets = useSafeAreaInsets();
  const { signIn, isLoading } = useAuth();

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

  const onSubmit = async (data: SignInFormData) => {
    const result = await signIn(data.email.trim(), data.password);

    if (result.success) {
      router.replace('/(tabs)' as any);
    }
    // Error toast is shown by useAuth hook
  };

  const handleBack = () => {
    router.back();
  };

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

            {/* Sign In button */}
            <Button
              title="Sign In"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              disabled={isLoading}
              size="lg"
              style={{ marginTop: spacing.lg }}
            />

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
  forgotPassword: {
    alignSelf: 'center',
    marginTop: 24,
    padding: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
