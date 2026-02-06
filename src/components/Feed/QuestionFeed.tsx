import React, { useMemo } from 'react';
import { View, Pressable } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { useTheme, createStyles } from '@/theme';
import FeedCard from './FeedCard';
import type { BaseFeedProps } from './types';

interface QuestionFeedProps extends BaseFeedProps {
  onAddAnswer?: () => void;
}

const QuestionFeed: React.FC<QuestionFeedProps> = ({ data, onAddAnswer }) => {
  const { colors, shapes, palette } = useTheme();
  const styles = useStyles();

  // Check if addAnswer button should be shown
  const showAddAnswer = (data as any).addAnswer === true;

  // Extract question from extraData
  const questionText = useMemo(() => {
    const question = data.extraData?.question;
    if (question) {
      return question.length > 150 ? question.substring(0, 147) + '...' : question;
    }
    return 'No question text available';
  }, [data.extraData]);

  return (
    <FeedCard data={data} label="Question" labelColor={palette.warning[500]}>
      <View
        style={[
          styles.questionContainer,
          {
            backgroundColor: palette.warning[50],
            borderRadius: shapes.radius.md,
            borderLeftColor: palette.warning[500],
          },
        ]}
      >
        <ThemedText style={[styles.questionMark, { color: palette.warning[600] }]}>
          ?
        </ThemedText>
        <ThemedText style={[styles.questionText, { color: colors.text.primary }]}>
          {`"${questionText}"`}
        </ThemedText>
      </View>

      {/* Add Answer Button */}
      {showAddAnswer && (
        <Pressable
          onPress={onAddAnswer}
          style={({ pressed }) => [
            styles.addAnswerButton,
            {
              backgroundColor: pressed ? palette.primary[100] : 'transparent',
              borderColor: palette.primary[500],
              borderRadius: shapes.radius.sm,
            },
          ]}
        >
          <ThemedText style={[styles.addAnswerText, { color: palette.primary[500] }]}>
            + Add your answer
          </ThemedText>
        </Pressable>
      )}
    </FeedCard>
  );
};

const useStyles = createStyles(({ spacing, typography }) => ({
  questionContainer: {
    padding: spacing.sm * 1.5,
    borderLeftWidth: spacing.xs,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  questionMark: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
  },
  questionText: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
    flex: 1,
    fontStyle: 'italic',
  },
  addAnswerButton: {
    marginTop: spacing.xs * 2.5,
    paddingVertical: spacing.xs * 1.5,
    paddingHorizontal: spacing.sm * 1.5,
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  addAnswerText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
}));

export default React.memo(QuestionFeed);
