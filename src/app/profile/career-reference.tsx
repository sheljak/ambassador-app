import React, { useCallback } from 'react';
import {
  View,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui';
import { Loader } from '@/components/Loader';
import { useTheme, createStyles } from '@/theme';
import {
  useGetAccountQuery,
  useGetCareerReferenceTextQuery,
  useSendCareerReferencePdfMutation,
} from '@/store/features/auth/api';
import { ToastService } from '@/services';

export default function CareerReferenceScreen() {
  const { colors, palette, spacing, shapes } = useTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { data: accountResponse } = useGetAccountQuery();
  const account = (accountResponse?.data as any)?.account ?? accountResponse?.data;

  const { data: careerRes, isLoading } = useGetCareerReferenceTextQuery();
  const career = careerRes?.data as any;

  const [sendPdf, { isLoading: isSendingPdf }] = useSendCareerReferencePdfMutation();

  // University avatar
  const university = account?.university;
  const universityAvatarUri = university?.avatar?.sizes?.['160x160']
    ?? university?.avatar?.original
    ?? null;

  // Career reference data
  const universityName = career?.universityName ?? university?.name ?? 'your institution';
  const userRegisterDate = career?.userRegisterDate ?? '';
  const nowDate = career?.nowDate ?? '';
  const countConversations = Number(career?.countConversations ?? 0);
  const countMediaPosts = Number(career?.countMediaPosts ?? 0);
  const faqMessagesCount = Number(career?.faqMessagesCount ?? 0);

  // Rating
  let rate = 'good';
  if (career?.rate === -1) rate = 'bad';
  else if (career?.rate === 0) rate = 'good';
  else if (career?.rate === 1) rate = 'best';

  const handleSendPdf = useCallback(async () => {
    try {
      await sendPdf().unwrap();
      Alert.alert('Email sent', 'We have emailed you a PDF of your career reference.');
    } catch {
      ToastService.error('Failed to send PDF');
    }
  }, [sendPdf]);

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={[styles.header, { borderBottomColor: colors.border.default }]}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={palette.primary[500]} />
          </Pressable>
          <ThemedText style={styles.headerTitle}>Career Reference</ThemedText>
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
        <ThemedText style={styles.headerTitle}>Career Reference</ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Reference text */}
        <View style={[styles.referenceCard, { backgroundColor: colors.background.secondary, borderRadius: shapes.radius.lg }]}>
          <ThemedText style={styles.paragraph}>
            I have been an ambassador for {universityName} through The Ambassador Platform since {userRegisterDate}.
          </ThemedText>

          <ThemedText style={styles.paragraph}>
            As an ambassador I have given prospects an authentic insight into what the experience of being part of {universityName} is really like.
          </ThemedText>

          {nowDate ? (
            <ThemedText style={styles.paragraph}>
              As of {nowDate}, I have:
            </ThemedText>
          ) : null}

          {countConversations > 0 && (
            <ThemedText style={styles.paragraph}>
              {'• Had '}
              <ThemedText style={styles.bold}>{countConversations} conversations</ThemedText>
              {' with prospects to answer their questions and advise them on various topics about the '}
              {universityName}
              {' and my experiences. On average, I was rated as '}
              {rate}
              {' by the prospects I spoke to;'}
            </ThemedText>
          )}

          {countMediaPosts > 0 && (
            <ThemedText style={styles.paragraph}>
              {'• Produced '}
              <ThemedText style={styles.bold}>{countMediaPosts} social media posts</ThemedText>
              {' which have been used by '}
              {universityName}
              {' in their public communications;'}
            </ThemedText>
          )}

          {faqMessagesCount > 0 && (
            <ThemedText style={styles.paragraph}>
              {'• Written '}
              <ThemedText style={styles.bold}>{faqMessagesCount} in-depth answers</ThemedText>
              {' to frequently asked questions that have been approved by '}
              {universityName}
              {' and are shown to prospects.'}
            </ThemedText>
          )}

          <ThemedText style={styles.paragraph}>
            This work has helped me to develop the following skills
          </ThemedText>

          {countConversations > 0 && (
            <>
              <ThemedText style={styles.paragraph}>
                {'• '}
                <ThemedText style={styles.bold}>Interpersonal and communication skills</ThemedText>
                {' through the conversations I\'ve had with prospects as a representative of '}
                {universityName}
                {';'}
              </ThemedText>
              <ThemedText style={styles.paragraph}>
                {'• '}
                <ThemedText style={styles.bold}>Customer service skills</ThemedText>
                {' through the process of understanding the question I\'m being asked and working to find the best answers I can for the prospective student. This may include doing research or working with the wider team of staff and ambassadors;'}
              </ThemedText>
            </>
          )}

          {countMediaPosts > 0 && (
            <ThemedText style={styles.paragraph}>
              {'• '}
              <ThemedText style={styles.bold}>Marketing, creative and social media skills</ThemedText>
              {' through collaboratively working with the marketing department to create social posts for the '}
              {universityName}
              {';'}
            </ThemedText>
          )}

          <ThemedText style={styles.paragraph}>
            {'• '}
            <ThemedText style={styles.bold}>Written communication skills</ThemedText>
            {' as all the work I did as an ambassador through The Ambassador Platform involved written communications, some of which were public-facing;'}
          </ThemedText>

          <ThemedText style={styles.paragraph}>
            {'• '}
            <ThemedText style={styles.bold}>Organisation, planning and time management skills</ThemedText>
            {' to be able to fit this additional work around my studies whilst being able to meet all deadlines;'}
          </ThemedText>

          <ThemedText style={styles.paragraph}>
            {'• '}
            <ThemedText style={styles.bold}>Teamwork and professional skills</ThemedText>
            {' were required to work collaboratively both with staff at '}
            {universityName}
            {' and other ambassadors.'}
          </ThemedText>
        </View>

        {/* University footer */}
        <View style={styles.universityRow}>
          {universityAvatarUri ? (
            <Image
              source={{ uri: universityAvatarUri }}
              style={[styles.universityAvatar, { borderColor: colors.border.default }]}
            />
          ) : (
            <View
              style={[
                styles.universityAvatar,
                styles.universityAvatarPlaceholder,
                { backgroundColor: palette.primary[100], borderColor: colors.border.default },
              ]}
            >
              <Ionicons name="school" size={24} color={palette.primary[500]} />
            </View>
          )}
          <View style={styles.universityInfo}>
            <ThemedText style={styles.universityName}>
              {university?.name ?? 'Institution'}
            </ThemedText>
            <ThemedText style={[styles.verifiedText, { color: colors.text.secondary }]}>
              Verified by The Ambassador Platform
            </ThemedText>
          </View>
        </View>

        {/* Email PDF button */}
        <Button
          title={isSendingPdf ? 'Sending...' : 'Email as PDF'}
          onPress={handleSendPdf}
          loading={isSendingPdf}
          disabled={isSendingPdf}
          size="lg"
          leftIcon={
            !isSendingPdf ? (
              <Ionicons name="mail-outline" size={18} color="#fff" />
            ) : undefined
          }
          style={{ marginTop: spacing.lg }}
        />
      </ScrollView>
    </ThemedView>
  );
}

const useStyles = createStyles(({ spacing, typography, shapes }) => ({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm * 1.5,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
    marginRight: spacing.xs * 10,
  },
  headerSpacer: {
    width: 0,
  },
  scrollContent: {
    paddingHorizontal: spacing.xs * 5,
    paddingTop: spacing.xs * 5,
  },
  referenceCard: {
    padding: spacing.xs * 5,
  },
  paragraph: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
    marginBottom: spacing.sm * 1.5,
  },
  bold: {
    fontWeight: typography.fontWeight.semibold,
  },
  universityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs * 5,
    paddingHorizontal: spacing.xs,
  },
  universityAvatar: {
    width: spacing.xs * 12.5,
    height: spacing.xs * 12.5,
    borderRadius: shapes.radius.full,
    borderWidth: 1,
    marginRight: spacing.sm * 1.5,
  },
  universityAvatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  universityInfo: {
    flex: 1,
  },
  universityName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.xs / 2,
  },
  verifiedText: {
    fontSize: typography.fontSize.sm,
  },
}));
