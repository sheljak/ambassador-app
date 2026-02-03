import { StyleSheet, Dimensions, Platform } from 'react-native';
import { palette } from '@/theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('screen');

export const COLORS = {
  primary: palette.primary[500],      // #0a7ea4 (teal)
  primaryLight: palette.primary[400],  // #33C1D6
  background: palette.neutral[0],     // #FFFFFF
  surface: palette.neutral[50],       // #F9FAFB
  text: palette.neutral[900],         // #111827
  textSecondary: palette.neutral[600],// #4B5563
  textMuted: palette.neutral[500],    // #6B7280
  border: palette.neutral[200],       // #E5E7EB
  error: palette.error[500],          // #EF4444
  white: '#ffffff',
  black: '#000000',
  menuBg: 'rgb(38, 46, 69)',
  menuSeparator: 'rgb(112, 112, 112)',
  systemMessage: palette.neutral[400], // #9CA3AF
  sentBubbleBg: palette.primary[50],   // #E6F7FA (light teal)
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

export const RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
} as const;

export const TYPOGRAPHY = {
  messageFontSize: 15,
  messageLineHeight: 20,
  nameFontSize: 10,
  timeFontSize: 10,
  systemFontSize: 14,
} as const;

export const chatStyles = StyleSheet.create({
  // Container
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  containerClosed: {
    paddingBottom: 40,
  },

  // Send button
  sendContainer: {
    height: 43,
    backgroundColor: 'transparent',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
    shadowRadius: 0,
    shadowOpacity: 0,
  },
  sendButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    marginLeft: 10,
    marginRight: 10,
  },

  // System message
  systemMessageContainer: {
    marginBottom: 15,
  },
  systemMessageText: {
    fontSize: TYPOGRAPHY.systemFontSize,
    textAlign: 'center' as const,
    color: COLORS.systemMessage,
  },
  systemMessageWrapper: {
    maxWidth: 280,
  },

  // Avatar
  avatarContainerLeft: {
    paddingTop: 0,
    marginRight: 8,
    marginLeft: 8,
    shadowColor: 'rgba(0, 0, 0, 0.04)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 1,
  },
  avatarContainerRight: {
    paddingTop: 0,
    marginLeft: 8,
    shadowColor: 'rgba(0, 0, 0, 0.04)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 1,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },

  // Bubble
  bubbleContainer: {
    borderRadius: RADIUS.lg,
    position: 'relative' as const,
    zIndex: 0,
  },
  bubbleRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  messageActionButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  messageActionButtonLeft: {
    marginLeft: 6,
    marginRight: 2,
  },
  messageActionButtonRight: {
    marginRight: 6,
    marginLeft: 2,
  },
  messageActionDots: {
    fontSize: 14,
    fontWeight: '700' as const,
    letterSpacing: -1,
  },
  bubbleContainerLeft: {
    backgroundColor: COLORS.surface,
  },
  bubbleContainerRight: {
    backgroundColor: COLORS.sentBubbleBg,
  },
  bubbleTopContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    paddingTop: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  bubbleNameContainer: {
    marginLeft: SPACING.lg,
  },
  bubbleNameRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  bubbleNameText: {
    fontSize: TYPOGRAPHY.nameFontSize,
    fontWeight: '500' as const,
    lineHeight: 20,
    letterSpacing: -0.3,
    color: COLORS.primary,
  },
  bubbleNameTextRight: {
    color: COLORS.primaryLight,
  },
  bubbleBlockedText: {
    fontSize: TYPOGRAPHY.nameFontSize,
    marginLeft: 5,
    color: COLORS.error,
  },
  bubbleProfileInfo: {
    fontSize: TYPOGRAPHY.nameFontSize,
    fontWeight: '500' as const,
    letterSpacing: -0.3,
    color: COLORS.textMuted,
  },
  bubbleTimeContainer: {
    marginLeft: SPACING.lg,
    marginRight: SPACING.sm,
  },
  bubbleTimeText: {
    fontSize: TYPOGRAPHY.timeFontSize,
    lineHeight: 20,
    fontWeight: '400' as const,
    letterSpacing: -0.3,
    color: COLORS.text,
  },
  bubbleWrapperLeft: {
    backgroundColor: 'transparent',
    marginRight: 0,
  },
  bubbleWrapperRight: {
    backgroundColor: 'transparent',
    width: '100%' as any,
    marginLeft: 0,
  },
  bubbleBottomHidden: {
    height: 0,
    overflow: 'hidden' as const,
    width: 0,
  },

  // Message text
  messageTextContainer: {
    maxWidth: SCREEN_WIDTH - 130,
    marginBottom: SPACING.sm,
  },
  messageText: {
    fontSize: TYPOGRAPHY.messageFontSize,
    fontWeight: 'normal' as const,
    lineHeight: TYPOGRAPHY.messageLineHeight,
    letterSpacing: -0.3,
    color: COLORS.text,
    marginLeft: SPACING.lg,
    marginRight: SPACING.lg,
    textAlign: 'left' as const,
  },
  messageTextRight: {
    color: COLORS.text,
  },
  messageTextItalic: {
    fontStyle: 'italic' as const,
  },
  highlightedText: {
    color: COLORS.primary,
    opacity: 1,
  },

  // Media inside bubble
  mediaContainer: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
    borderRadius: RADIUS.md,
    overflow: 'hidden' as const,
    backgroundColor: COLORS.border,
  },
  mediaImage: {
    width: 220,
    height: 180,
  },
  mediaVideo: {
    width: 240,
    height: 180,
  },

  // Reply message in bubble
  replyMessageContainer: {
    backgroundColor: COLORS.surface,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
  },
  replyMessageName: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: COLORS.primary,
    marginBottom: 2,
  },
  replyMessageText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  // Reply footer (composing)
  replyFooterContainer: {
    flexDirection: 'row' as const,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: SPACING.md,
    alignItems: 'center' as const,
  },
  replyFooterSeparator: {
    width: 3,
    height: '100%' as any,
    minHeight: 40,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    marginRight: SPACING.md,
  },
  replyFooterContent: {
    flex: 1,
    maxHeight: 60,
  },
  replyFooterName: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: COLORS.primary,
    marginBottom: 2,
  },
  replyFooterText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  dismissButton: {
    padding: SPACING.sm,
  },

  // Closed/archived banner
  closedBanner: {
    paddingVertical: 15,
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
  },
  closedBannerText: {
    fontSize: 15,
    fontWeight: 'normal' as const,
    lineHeight: 20,
    letterSpacing: -0.3,
    textAlign: 'center' as const,
    color: '#4a4a4a',
    marginHorizontal: 10,
  },
  reportedLink: {
    color: COLORS.primary,
    padding: 0,
  },


  // Menu
  menuContainer: {
    position: 'absolute' as const,
    right: 0,
    top: 0,
    zIndex: 999,
    backgroundColor: COLORS.menuBg,
    borderBottomLeftRadius: RADIUS.md,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        shadowOpacity: 0.2,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  menuItem: {
    minWidth: 60,
    backgroundColor: 'transparent',
    paddingHorizontal: 25,
    paddingVertical: 12,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.menuSeparator,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: 'normal' as const,
    color: COLORS.white,
  },

  // Header
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerBtn: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    marginLeft: 4,
  },
  headerTitleText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: COLORS.text,
  },

  // Pinned dot
  pinnedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginRight: 4,
  },
});
