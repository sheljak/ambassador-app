import React, { useCallback, useState, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useForm } from 'react-hook-form';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { FormInput, Button, Select } from '@/components/ui';
import type { SelectItem } from '@/components/ui';
import { MediaPickerSheet } from '@/components/ui/MediaPickerSheet';
import { Loader } from '@/components/Loader';
import { useTheme } from '@/theme';
import {
  useGetAmbassadorDataQuery,
  useChangeAmbassadorDataMutation,
  useSetAvatarMutation,
  useGetCountriesQuery,
} from '@/store/features/auth/api';
import { ToastService, ImagePickerService } from '@/services';

interface AccountFormData {
  name: string;
  last_name: string;
  region: string;
}

export default function AccountInformationScreen() {
  const { colors, palette, spacing, shapes } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { data: ambassadorResponse, isLoading: isLoadingProfile, fulfilledTimeStamp } = useGetAmbassadorDataQuery();
  const ambassadorData = (ambassadorResponse?.data as any)?.ambassadorData;

  const { data: countriesResponse } = useGetCountriesQuery();
  const countriesData = countriesResponse?.data as any;
  const countries: SelectItem[] = (Array.isArray(countriesData) ? countriesData : countriesData?.countries ?? []) as SelectItem[];

  const [changeAmbassadorData, { isLoading: isSaving }] = useChangeAmbassadorDataMutation();
  const [setAvatar, { isLoading: isUploadingAvatar }] = useSetAvatarMutation();

  const [selectedCountryId, setSelectedCountryId] = useState<number | string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Determine profile type
  const profileKey = ambassadorData?.user_tags?.profile?.[0]?.key;
  const isStaff = profileKey === 'staff';
  const isSchoolStudent = profileKey === 'school_student';
  const showCountryFields = !isStaff;

  // Current country from ambassador data
  const currentCountry = ambassadorData?.user_tags?.countries?.[0];
  const countryValue = selectedCountryId ?? currentCountry?.id ?? null;

  const rawAvatarUri = ambassadorData?.avatar?.original;
  const cachedAvatarUri = rawAvatarUri
    ? `${rawAvatarUri}${rawAvatarUri.includes('?') ? '&' : '?'}t=${fulfilledTimeStamp || ''}`
    : null;
  const avatarUri = avatarPreview || cachedAvatarUri;
  const initials = (ambassadorData?.name?.[0] || '?').toUpperCase();

  const { control, handleSubmit } = useForm<AccountFormData>({
    values: {
      name: ambassadorData?.name || '',
      last_name: ambassadorData?.last_name || '',
      region: ambassadorData?.region || '',
    },
  });

  // Country select handler
  const handleCountrySelect = useCallback((item: SelectItem) => {
    setSelectedCountryId(item.id);
  }, []);

  const [pickerVisible, setPickerVisible] = useState(false);
  const [pendingPickerSource, setPendingPickerSource] = useState<'camera' | 'library' | null>(null);

  const handlePickImage = useCallback(
    async (source: 'camera' | 'library') => {
      const pickerFn =
        source === 'camera'
          ? ImagePickerService.openCamera
          : ImagePickerService.openPicker;

      const image = await pickerFn({ useFrontCamera: true });
      if (!image) return;

      setAvatarPreview(image.uri);

      try {
        await setAvatar({ file: image.base64 }).unwrap();
        ToastService.success('Avatar updated');
      } catch (error) {
        console.error('Failed to upload avatar:', error);
        ToastService.error('Failed to upload avatar');
      }
    },
    [setAvatar]
  );

  // Launch picker after the sheet modal has fully closed
  useEffect(() => {
    if (!pickerVisible && pendingPickerSource) {
      const source = pendingPickerSource;
      setPendingPickerSource(null);
      // Small delay to ensure Modal is fully unmounted on iOS
      setTimeout(() => handlePickImage(source), 300);
    }
  }, [pickerVisible, pendingPickerSource, handlePickImage]);

  const handleChangePhoto = useCallback(() => {
    setPickerVisible(true);
  }, []);

  // Save handler
  const onSubmit = useCallback(
    async (values: AccountFormData) => {
      try {
        const data: Record<string, unknown> = {
          name: values.name,
          lastName: values.last_name,
          region: values.region,
        };
        if (countryValue) {
          data.countryId = String(countryValue);
        }

        await changeAmbassadorData(data).unwrap();
        ToastService.success('Changes saved');
      } catch (error) {
        console.error('Failed to save:', error);
        ToastService.error('Failed to save changes');
      }
    },
    [changeAmbassadorData, countryValue]
  );

  if (isLoadingProfile && !ambassadorData) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={[styles.header, { borderBottomColor: colors.border.default }]}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={palette.primary[500]} />
          </Pressable>
          <ThemedText style={styles.headerTitle}>Account Information</ThemedText>
          <View style={styles.headerSpacer} />
        </View>
        <Loader />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: colors.border.default }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={palette.primary[500]} />
        </Pressable>
        <ThemedText style={styles.headerTitle}>Account Information</ThemedText>
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
          {/* Avatar */}
          <View style={styles.avatarSection}>
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                style={[styles.avatar, { borderColor: palette.primary[500] }]}
              />
            ) : (
              <View
                style={[
                  styles.avatar,
                  styles.avatarPlaceholder,
                  { backgroundColor: palette.primary[100], borderColor: palette.primary[500] },
                ]}
              >
                <ThemedText style={[styles.avatarInitials, { color: palette.primary[600] }]}>
                  {initials}
                </ThemedText>
              </View>
            )}
            <Pressable
              style={({ pressed }) => [
                styles.changePhotoButton,
                pressed && { opacity: 0.7 },
              ]}
              onPress={handleChangePhoto}
              disabled={isUploadingAvatar}
            >
              <Ionicons name="add" size={18} color={palette.primary[500]} />
              <ThemedText style={[styles.changePhotoText, { color: palette.primary[500] }]}>
                {isUploadingAvatar ? 'Uploading...' : 'Change photo'}
              </ThemedText>
            </Pressable>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            <FormInput
              control={control}
              name="name"
              label="First Name"
              placeholder="Enter your first name"
              maxLength={40}
              rules={{ required: 'Enter your first name' }}
            />

            <FormInput
              control={control}
              name="last_name"
              label="Second Name"
              placeholder="Enter your second name"
              maxLength={40}
              rules={{ required: 'Enter your second name' }}
            />

            <View style={styles.emailFieldContainer}>
              <ThemedText
                style={[styles.emailLabel, { color: colors.text.secondary }]}
              >
                Email
              </ThemedText>
              <Pressable
                onPress={() => router.push('/profile/change-email' as any)}
                style={({ pressed }) => [
                  styles.emailTrigger,
                  {
                    backgroundColor: colors.background.secondary,
                    borderColor: colors.border.default,
                    borderRadius: shapes.radius.md,
                  },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <ThemedText
                  style={[styles.emailText, { color: colors.text.primary }]}
                  numberOfLines={1}
                >
                  {ambassadorData?.email || 'Set email'}
                </ThemedText>
                <Ionicons name="chevron-forward" size={18} color={colors.text.secondary} />
              </Pressable>
            </View>

            {showCountryFields && (
              <>
                <Select
                  label="Country"
                  placeholder="Select a country"
                  searchPlaceholder="Search for your country"
                  items={countries}
                  value={countryValue}
                  onSelect={handleCountrySelect}
                />

                {!isSchoolStudent && (
                  <FormInput
                    control={control}
                    name="region"
                    label="Home Town (state or region)"
                    placeholder="Enter your region"
                    maxLength={40}
                    rules={{ required: 'Enter your region' }}
                  />
                )}
              </>
            )}
          </View>

          {/* Save Button */}
          <Button
            title={isSaving ? 'Saved' : 'Save changes'}
            onPress={handleSubmit(onSubmit)}
            loading={isSaving}
            disabled={isSaving}
            size="lg"
            leftIcon={
              isSaving ? (
                <Ionicons name="checkmark" size={18} color="#fff" />
              ) : undefined
            }
            style={{ marginTop: spacing.md }}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <MediaPickerSheet
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onCamera={() => setPendingPickerSource('camera')}
        onLibrary={() => setPendingPickerSource('library')}
      />
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    marginBottom: 12,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 36,
    fontWeight: '600',
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  changePhotoText: {
    fontSize: 14,
    fontWeight: '500',
  },
  formContainer: {
    gap: 4,
  },
  emailFieldContainer: {
    marginBottom: 16,
  },
  emailLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  emailTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  emailText: {
    flex: 1,
    fontSize: 16,
    marginRight: 8,
  },
});
