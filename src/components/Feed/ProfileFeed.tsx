import React, { useMemo } from 'react';
import { View, Dimensions } from 'react-native';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/ThemedText';
import { useTheme, createStyles } from '@/theme';
import type { BaseFeedProps } from './types';

const { width } = Dimensions.get('window');

interface UserTags {
  profile?: { key: string; name?: string }[];
  subject?: { name: string }[];
  courses_types?: { name: string }[];
  countries?: { code: string }[];
  interests?: { name: string }[];
  job_role?: { name: string }[];
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
  const styles = useStyles();
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

const useStyles = createStyles(({ spacing, typography, shapes }) => ({
  container: {
    width: width - spacing.xs * 8,
    marginBottom: spacing.sm * 1.5,
  },
  card: {
    overflow: 'hidden',
  },
  banner: {
    height: spacing.xs * 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: -spacing.xs * 12.5,
  },
  avatar: {
    width: spacing.xs * 25,
    height: spacing.xs * 25,
    borderRadius: shapes.radius.full,
    borderWidth: spacing.xs,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  avatarInitial: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.fontSize['3xl'] * typography.lineHeight.tight,
    textAlign: 'center',
  },
  content: {
    padding: spacing.md,
    alignItems: 'center',
  },
  userName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  subjectWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  subject: {
    fontSize: typography.fontSize.sm,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: shapes.radius.sm,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  region: {
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.sm * 1.5,
  },
  description: {
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
    marginBottom: spacing.md,
  },
  interestsSection: {
    width: '100%',
    marginTop: spacing.sm,
  },
  interestsLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.xs * 1.5,
  },
  interestTag: {
    paddingHorizontal: spacing.xs * 2.5,
    paddingVertical: spacing.xs,
    borderRadius: shapes.radius.lg,
  },
  interestText: {
    fontSize: typography.fontSize.xs,
  },
}));

export default React.memo(ProfileFeed);
