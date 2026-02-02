import React, { useCallback } from 'react';
import { StyleSheet, ScrollView, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Loader } from '@/components/Loader';
import { useTheme } from '@/theme';
import { useAuth } from '@/hooks';
import { useGetAmbassadorDataQuery } from '@/store/features/auth/api';
import { prepareSubjectInfo } from '@/helpers/common';

interface ProfileMenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  route: string;
}

const PROFILE_MENU: ProfileMenuItem[] = [
  {
    icon: 'information-circle-outline',
    title: 'Account Information',
    description: 'Change profile picture and personal data',
    route: '/profile/account-information',
  },
  {
    icon: 'person-outline',
    title: 'Ambassador Profile',
    description: 'Edit your bio, first message and course information',
    route: '/profile/ambassador-profile',
  },
  {
    icon: 'time-outline',
    title: 'Time Report',
    description: 'Check out your work hours',
    route: '/profile/time-report',
  },
  {
    icon: 'document-text-outline',
    title: 'Career Reference',
    description: 'Download for your CV or LinkedIn',
    route: '/profile/career-reference',
  },
  {
    icon: 'settings-outline',
    title: 'Manage Account',
    description: 'Change your password and view Privacy Policy',
    route: '/profile/manage-account',
  },
];

export default function ProfileScreen() {
  const { colors, palette, shapes } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const router = useRouter();
  const { user, signOut } = useAuth();

  // Fetch ambassador data — same endpoint as legacy MyProfileScreen
  // GET /v1/application/account/profile → { data: { ambassadorData: { total_points, ... }, avatar, name, user_tags, ... } }
  const { data: ambassadorResponse, isLoading } = useGetAmbassadorDataQuery();
  const profileData = (ambassadorResponse?.data as any) ?? {};
  const ambassadorData = profileData.ambassadorData ?? profileData;

  const totalPoints = ambassadorData?.total_points ?? 0;
  const chatPoints = ambassadorData?.chat_points ?? 0;
  const faqPoints = ambassadorData?.faq_points ?? 0;
  const contentPoints = ambassadorData?.content_points ?? 0;

  // Use profile response for display (like legacy), fall back to auth user
  // Name/avatar may live at profileData level or inside ambassadorData depending on API response shape
  const data = profileData?.name ? profileData : ambassadorData?.name ? ambassadorData : user;
  const subjectInfo = data ? prepareSubjectInfo(data) : '';
  const avatarUri = profileData?.avatar?.original ?? ambassadorData?.avatar?.original ?? data?.avatar?.original;
  const displayName = data?.name
    ? `${data.name} ${data.last_name || ''}`.trim()
    : user?.first_name
      ? `${user.first_name} ${user.last_name || ''}`.trim()
      : 'User';
  const initials = (data?.name?.[0] || user?.email?.[0] || 'U').toUpperCase();

  const handleNavigate = useCallback(
    (route: string) => {
      router.push(route as any);
    },
    [router]
  );

  const handleSignOut = useCallback(() => {
    signOut();
  }, [signOut]);

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: colors.border.default }]}>
        <ThemedText type="title">My Profile</ThemedText>
      </View>

      {isLoading && (
        <View
          style={[
            styles.loaderOverlay,
            { backgroundColor: colors.background.primary, paddingBottom: tabBarHeight },
          ]}
        >
          <Loader />
        </View>
      )}

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Section */}
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
          <ThemedText style={styles.displayName}>{displayName}</ThemedText>
          {subjectInfo ? (
            <ThemedText style={[styles.subjectInfo, { color: colors.text.secondary }]}>
              {subjectInfo}
            </ThemedText>
          ) : null}
        </View>

        {/* Points Section */}
        <View
          style={[
            styles.pointsContainer,
            {
              backgroundColor: colors.background.secondary,
              borderRadius: shapes.radius.lg,
              borderColor: colors.border.default,
              borderWidth: 1,
            },
          ]}
        >
          <View style={styles.pointsMain}>
            <ThemedText style={[styles.pointsValue, { color: palette.primary[500] }]}>
              {totalPoints}
            </ThemedText>
            <ThemedText style={[styles.pointsLabel, { color: colors.text.secondary }]}>
              Points
            </ThemedText>
          </View>
          <View style={[styles.pointsDivider, { backgroundColor: colors.border.default }]} />
          <View style={styles.pointsBreakdown}>
            <View style={styles.pointsItem}>
              <ThemedText style={styles.pointsItemValue}>{chatPoints}</ThemedText>
              <ThemedText style={[styles.pointsItemLabel, { color: colors.text.secondary }]}>
                Chat
              </ThemedText>
            </View>
            <View style={styles.pointsItem}>
              <ThemedText style={styles.pointsItemValue}>{faqPoints}</ThemedText>
              <ThemedText style={[styles.pointsItemLabel, { color: colors.text.secondary }]}>
                FAQ
              </ThemedText>
            </View>
            <View style={styles.pointsItem}>
              <ThemedText style={styles.pointsItemValue}>{contentPoints}</ThemedText>
              <ThemedText style={[styles.pointsItemLabel, { color: colors.text.secondary }]}>
                Content
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View
          style={[
            styles.menuContainer,
            {
              backgroundColor: colors.background.secondary,
              borderRadius: shapes.radius.lg,
              borderColor: colors.border.default,
              borderWidth: 1,
            },
          ]}
        >
          {PROFILE_MENU.map((item, index) => (
            <Pressable
              key={item.route}
              style={({ pressed }) => [
                styles.menuItem,
                pressed && { backgroundColor: colors.background.tertiary },
                index < PROFILE_MENU.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border.default,
                },
              ]}
              onPress={() => handleNavigate(item.route)}
            >
              <View style={[styles.menuIcon, { backgroundColor: palette.primary[50] }]}>
                <Ionicons name={item.icon} size={22} color={palette.primary[500]} />
              </View>
              <View style={styles.menuText}>
                <ThemedText style={styles.menuTitle}>{item.title}</ThemedText>
                <ThemedText
                  style={[styles.menuDescription, { color: colors.text.secondary }]}
                  numberOfLines={1}
                >
                  {item.description}
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
            </Pressable>
          ))}
        </View>

        {/* Sign Out */}
        <Pressable
          style={({ pressed }) => [
            styles.signOutButton,
            pressed && { opacity: 0.7 },
          ]}
          onPress={handleSignOut}
        >
          <Ionicons name="log-out-outline" size={18} color={colors.status.error} />
          <ThemedText style={[styles.signOutText, { color: colors.status.error }]}>
            Sign Out
          </ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    marginBottom: 12,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: '600',
  },
  displayName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  subjectInfo: {
    fontSize: 14,
  },
  pointsContainer: {
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    overflow: 'visible',
  },
  pointsMain: {
    alignItems: 'center',
    marginBottom: 12,
  },
  pointsValue: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
  },
  pointsLabel: {
    fontSize: 13,
    marginTop: 2,
  },
  pointsDivider: {
    height: 1,
    marginBottom: 12,
  },
  pointsBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  pointsItem: {
    alignItems: 'center',
  },
  pointsItemValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  pointsItemLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  menuContainer: {
    overflow: 'hidden',
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    marginRight: 8,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  menuDescription: {
    fontSize: 12,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
});
