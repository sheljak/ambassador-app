import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/theme';
import type { BaseFeedProps } from './types';

const { width } = Dimensions.get('window');

interface UserTags {
  profile?: Array<{ key: string; name?: string }>;
  subject?: Array<{ name: string }>;
  courses_types?: Array<{ name: string }>;
  countries?: Array<{ code: string }>;
  interests?: Array<{ name: string }>;
  job_role?: Array<{ name: string }>;
}

interface ProfileUser {
  name?: string;
  first_name?: string;
  last_name?: string;
  description?: string;
  region?: string;
  avatar?: {
    original?: string;
    sizes?: Record<string, string>;
  };
  user_tags?: UserTags;
}

const ProfileFeed: React.FC<BaseFeedProps> = ({ data }) => {
  const { colors, shapes, palette } = useTheme();
  const user = data.user as ProfileUser | undefined;

  const avatarUrl = useMemo(() => {
    if (user?.avatar) {
      return user.avatar.sizes?.['240x240'] || user.avatar.original;
    }
    return null;
  }, [user?.avatar]);

  const userName = useMemo(() => {
    if (user?.first_name) {
      return `${user.first_name} ${user.last_name || ''}`.trim();
    }
    return user?.name || 'Ambassador';
  }, [user]);

  const profileType = user?.user_tags?.profile?.[0]?.key;
  const subjectName = user?.user_tags?.subject?.[0]?.name || '';
  const courseType = user?.user_tags?.courses_types?.[0]?.name || '';
  const jobRoleName = user?.user_tags?.job_role?.[0]?.name || '';
  const region = user?.region || '';
  const description = user?.description || '';
  const interests = user?.user_tags?.interests || [];

  return (
    <View style={styles.container}>
      <View style={[styles.card, { backgroundColor: colors.background.secondary, borderRadius: shapes.radius.lg }]}>
        {/* Header banner */}
        <View style={[styles.banner, { backgroundColor: palette.primary[100] }]} />

        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={[styles.avatar, { borderColor: colors.background.secondary }]}
            />
          ) : (
            <View
              style={[
                styles.avatar,
                styles.avatarPlaceholder,
                { backgroundColor: palette.primary[200], borderColor: colors.background.secondary },
              ]}
            >
              <ThemedText style={[styles.avatarInitial, { color: palette.primary[600] }]}>
                {userName.charAt(0).toUpperCase()}
              </ThemedText>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          <ThemedText style={[styles.userName, { color: palette.primary[500] }]}>
            {userName}
          </ThemedText>

          {/* Subject info for students */}
          {subjectName && (
            <View style={styles.subjectWrap}>
              <ThemedText style={[styles.subject, { color: colors.text.secondary }]}>
                {subjectName}
              </ThemedText>
              {courseType && (
                <View style={[styles.badge, { backgroundColor: palette.primary[500] }]}>
                  <ThemedText style={styles.badgeText}>{courseType}</ThemedText>
                </View>
              )}
            </View>
          )}

          {/* School student label */}
          {profileType === 'school_student' && !subjectName && (
            <ThemedText style={[styles.subject, { color: colors.text.secondary }]}>
              Student
            </ThemedText>
          )}

          {/* Employee info */}
          {profileType === 'employee' && jobRoleName && (
            <ThemedText style={[styles.subject, { color: colors.text.secondary }]}>
              {jobRoleName}
            </ThemedText>
          )}

          {/* Region */}
          {region && (
            <ThemedText style={[styles.region, { color: colors.text.secondary }]}>
              From <ThemedText style={{ color: palette.primary[500], fontWeight: '600' }}>{region}</ThemedText>
            </ThemedText>
          )}

          {/* Description */}
          {description && (
            <ThemedText style={[styles.description, { color: colors.text.primary }]}>
              {description}
            </ThemedText>
          )}

          {/* Interests */}
          {interests.length > 0 && (
            <View style={styles.interestsSection}>
              <ThemedText style={[styles.interestsLabel, { color: colors.text.disabled }]}>
                INTERESTS AND HOBBIES
              </ThemedText>
              <View style={styles.interestsContainer}>
                {interests.map((item, index) => (
                  <View
                    key={index}
                    style={[styles.interestTag, { backgroundColor: palette.neutral[100] }]}
                  >
                    <ThemedText style={[styles.interestText, { color: colors.text.secondary }]}>
                      {item.name}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width - 32,
    marginBottom: 12,
  },
  card: {
    overflow: 'hidden',
  },
  banner: {
    height: 80,
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: -50,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  avatarInitial: {
    fontSize: 36,
    fontWeight: '600',
    lineHeight: 42,
    textAlign: 'center',
  },
  content: {
    padding: 16,
    alignItems: 'center',
  },
  userName: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
  },
  subjectWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 8,
    gap: 8,
  },
  subject: {
    fontSize: 14,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  region: {
    fontSize: 14,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  interestsSection: {
    width: '100%',
    marginTop: 8,
  },
  interestsLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
  },
  interestTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  interestText: {
    fontSize: 12,
  },
});

export default React.memo(ProfileFeed);
