import { createStyles } from '@/theme';

export const useToastStyles = createStyles(({ spacing, shapes, typography }) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    minHeight: spacing.xs * 15,
    paddingVertical: spacing.sm * 1.5,
    paddingRight: spacing.md,
    borderLeftWidth: spacing.xs,
  },
  iconContainer: {
    width: spacing.xs * 8,
    height: spacing.xs * 8,
    borderRadius: shapes.radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm * 1.5,
    marginRight: spacing.sm * 1.5,
  },
  icon: {
    color: '#fff',
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.xs / 2,
  },
  message: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
}));
