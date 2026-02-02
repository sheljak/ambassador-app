import React, { useCallback, useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  ScrollView,
  Switch,
  Alert,
  Linking,
  Modal,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui';
import { useTheme } from '@/theme';
import {
  useGetAccountQuery,
  useToggleEmailNotificationMutation,
  useDeleteAccountMutation,
} from '@/store/features/auth/api';
import { useAuth } from '@/hooks/useAuth';
import { ToastService, BiometricService } from '@/services';

export default function ManageAccountScreen() {
  const { colors, palette, spacing, shapes } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signOut } = useAuth();

  const { data: accountResponse } = useGetAccountQuery();
  const account = (accountResponse?.data as any)?.account ?? accountResponse?.data;

  const [toggleEmailNotification] = useToggleEmailNotificationMutation();
  const [deleteAccountMutation, { isLoading: isDeleting }] = useDeleteAccountMutation();

  const [emailNotification, setEmailNotification] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState('Face ID');
  const [showBiometricPasswordModal, setShowBiometricPasswordModal] = useState(false);
  const [biometricPassword, setBiometricPassword] = useState('');

  const isSso = account?.is_sso_activated === true;
  const universityPrivacyPolicy = account?.university?.privacy_policy;
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  useEffect(() => {
    if (account?.notifications_from_prospect != null) {
      setEmailNotification(!!account.notifications_from_prospect);
    }
  }, [account?.notifications_from_prospect]);

  // Check biometric availability
  useEffect(() => {
    const checkBiometric = async () => {
      const available = await BiometricService.isAvailable();
      setBiometricAvailable(available);
      if (available) {
        const [type, enabled] = await Promise.all([
          BiometricService.getType(),
          BiometricService.isEnabled(),
        ]);
        setBiometricType(type);
        setBiometricEnabled(enabled);
      }
    };
    checkBiometric();
  }, []);

  const handleToggleNotification = useCallback(
    async (value: boolean) => {
      setEmailNotification(value);
      try {
        await toggleEmailNotification().unwrap();
      } catch {
        setEmailNotification(!value);
        ToastService.error('Failed to update notification settings');
      }
    },
    [toggleEmailNotification]
  );

  const handleToggleBiometric = useCallback(
    async (value: boolean) => {
      if (value) {
        setShowBiometricPasswordModal(true);
        setBiometricPassword('');
      } else {
        await BiometricService.disable();
        setBiometricEnabled(false);
        ToastService.success(`${biometricType} disabled`);
      }
    },
    [biometricType]
  );

  const handleConfirmBiometricEnable = useCallback(async () => {
    if (biometricPassword.length < 6) {
      ToastService.error('Password must be at least 6 characters');
      return;
    }
    const authenticated = await BiometricService.authenticate(
      `Confirm ${biometricType} setup`
    );
    if (!authenticated) {
      ToastService.error(`${biometricType} authentication failed`);
      return;
    }
    const email = account?.email || '';
    await BiometricService.enable(email, biometricPassword);
    await BiometricService.resetPromptDismissed();
    setBiometricEnabled(true);
    setShowBiometricPasswordModal(false);
    setBiometricPassword('');
    ToastService.success(`${biometricType} enabled`);
  }, [biometricType, biometricPassword, account?.email]);

  const handleChangePassword = useCallback(() => {
    router.push('/profile/change-password' as any);
  }, [router]);

  const openUrl = useCallback(async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Cannot open URL');
      }
    } catch {
      Alert.alert('Error', 'Failed to open URL');
    }
  }, []);

  const handleTapPrivacy = useCallback(() => {
    openUrl('https://tap.st/privacy');
  }, [openUrl]);

  const handleUniPrivacy = useCallback(() => {
    if (universityPrivacyPolicy) {
      openUrl(universityPrivacyPolicy);
    } else {
      openUrl('https://tap.st/privacy');
    }
  }, [openUrl, universityPrivacyPolicy]);

  const handleDeleteAccount = useCallback(async () => {
    setShowDeleteModal(false);
    try {
      await deleteAccountMutation().unwrap();
      await signOut();
    } catch {
      ToastService.error('Failed to delete account');
    }
  }, [deleteAccountMutation, signOut]);

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: colors.border.default }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={palette.primary[500]} />
        </Pressable>
        <ThemedText style={styles.headerTitle}>Manage Account</ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Settings rows */}
        <View style={styles.section}>
          {/* Change password (hidden for SSO users) */}
          {!isSso && (
            <Pressable
              style={({ pressed }) => [
                styles.row,
                { borderBottomColor: colors.border.default },
                pressed && { opacity: 0.7 },
              ]}
              onPress={handleChangePassword}
            >
              <View style={styles.rowLeft}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.text.primary} style={styles.rowIcon} />
                <ThemedText style={styles.rowText}>Change password</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.text.secondary} />
            </Pressable>
          )}

          {/* TAP Privacy Policy */}
          <Pressable
            style={({ pressed }) => [
              styles.row,
              { borderBottomColor: colors.border.default },
              pressed && { opacity: 0.7 },
            ]}
            onPress={handleTapPrivacy}
          >
            <View style={styles.rowLeft}>
              <Ionicons name="shield-checkmark-outline" size={20} color={colors.text.primary} style={styles.rowIcon} />
              <ThemedText style={styles.rowText}>TAP Privacy Policy</ThemedText>
            </View>
            <Ionicons name="open-outline" size={16} color={colors.text.secondary} />
          </Pressable>

          {/* Institution Privacy Policy */}
          <Pressable
            style={({ pressed }) => [
              styles.row,
              { borderBottomColor: colors.border.default },
              pressed && { opacity: 0.7 },
            ]}
            onPress={handleUniPrivacy}
          >
            <View style={styles.rowLeft}>
              <Ionicons name="school-outline" size={20} color={colors.text.primary} style={styles.rowIcon} />
              <ThemedText style={styles.rowText}>Institution Privacy Policy</ThemedText>
            </View>
            <Ionicons name="open-outline" size={16} color={colors.text.secondary} />
          </Pressable>

          {/* Email notifications toggle */}
          <View style={[styles.row, { borderBottomColor: colors.border.default }]}>
            <View style={styles.rowLeft}>
              <Ionicons name="mail-outline" size={20} color={colors.text.primary} style={styles.rowIcon} />
              <ThemedText style={styles.rowText}>Receive email notifications</ThemedText>
            </View>
            <Switch
              value={emailNotification}
              onValueChange={handleToggleNotification}
              trackColor={{ false: colors.border.default, true: palette.primary[300] }}
              thumbColor={emailNotification ? palette.primary[500] : '#f4f3f4'}
            />
          </View>

          {/* Biometric toggle (hidden for SSO users and devices without biometrics) */}
          {!isSso && biometricAvailable && (
            <View style={[styles.row, { borderBottomColor: colors.border.default }]}>
              <View style={styles.rowLeft}>
                <Ionicons
                  name={biometricType === 'Face ID' ? 'scan-outline' : 'finger-print-outline'}
                  size={20}
                  color={colors.text.primary}
                  style={styles.rowIcon}
                />
                <ThemedText style={styles.rowText}>Enable {biometricType}</ThemedText>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={handleToggleBiometric}
                trackColor={{ false: colors.border.default, true: palette.primary[300] }}
                thumbColor={biometricEnabled ? palette.primary[500] : '#f4f3f4'}
              />
            </View>
          )}
        </View>

        {/* Delete account + version */}
        <View style={styles.footer}>
          <Pressable
            onPress={() => setShowDeleteModal(true)}
            style={({ pressed }) => [pressed && { opacity: 0.7 }]}
          >
            <ThemedText style={[styles.deleteText, { color: colors.status.error }]}>
              Delete account
            </ThemedText>
          </Pressable>
          <ThemedText style={[styles.versionText, { color: colors.text.secondary }]}>
            v{appVersion}
          </ThemedText>
        </View>
      </ScrollView>

      {/* Delete confirmation modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background.primary, borderRadius: shapes.radius.lg }]}>
            <ThemedText style={styles.modalTitle}>Delete My Profile?</ThemedText>
            <ThemedText style={[styles.modalDescription, { color: colors.text.secondary }]}>
              This action cannot be undone. All your data will be permanently removed.
            </ThemedText>
            <View style={styles.modalButtons}>
              <Button
                title="Yes, delete"
                variant="danger"
                size="md"
                onPress={handleDeleteAccount}
                loading={isDeleting}
                style={styles.modalButton}
              />
              <Button
                title="No, go back"
                variant="outline"
                size="md"
                onPress={() => setShowDeleteModal(false)}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Biometric password confirmation modal */}
      <Modal
        visible={showBiometricPasswordModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBiometricPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background.primary, borderRadius: shapes.radius.lg }]}>
            <ThemedText style={styles.modalTitle}>Enable {biometricType}</ThemedText>
            <ThemedText style={[styles.modalDescription, { color: colors.text.secondary }]}>
              Enter your password to enable {biometricType} login
            </ThemedText>
            <TextInput
              style={[
                styles.biometricPasswordInput,
                {
                  color: colors.text.primary,
                  borderColor: colors.border.default,
                  borderRadius: shapes.radius.md,
                  backgroundColor: colors.background.secondary,
                },
              ]}
              value={biometricPassword}
              onChangeText={setBiometricPassword}
              placeholder="Enter your password"
              placeholderTextColor={colors.text.disabled}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.modalButtons}>
              <Button
                title={`Enable ${biometricType}`}
                size="md"
                onPress={handleConfirmBiometricEnable}
                disabled={biometricPassword.length < 6}
                style={styles.modalButton}
              />
              <Button
                title="Cancel"
                variant="outline"
                size="md"
                onPress={() => {
                  setShowBiometricPasswordModal(false);
                  setBiometricPassword('');
                }}
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
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  section: {
    marginTop: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  rowIcon: {
    marginRight: 12,
  },
  rowText: {
    fontSize: 15,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 32,
    paddingHorizontal: 4,
  },
  deleteText: {
    fontSize: 15,
    fontWeight: '500',
  },
  versionText: {
    fontSize: 13,
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
  biometricPasswordInput: {
    width: '100%',
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    marginBottom: 16,
  },
});
