import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/theme';
import FeedCard from './FeedCard';
import type { BaseFeedProps } from './types';

const AnswerFeed: React.FC<BaseFeedProps> = ({ data, onPress }) => {
  const { colors, shapes, palette } = useTheme();

  // Extract question and answer from extraData
  const { questionText, answerText } = useMemo(() => {
    const question = data.extraData?.question;
    const answer = data.extraData?.answer;

    return {
      questionText: question
        ? question.length > 100
          ? question.substring(0, 97) + '...'
          : question
        : 'No question text',
      answerText: answer
        ? answer.length > 150
          ? answer.substring(0, 147) + '...'
          : answer
        : 'No answer text',
    };
  }, [data.extraData]);

  return (
    <FeedCard data={data} onPress={onPress} label="Answer" labelColor={palette.success[500]}>
      {/* Question */}
      <View
        style={[
          styles.questionContainer,
          {
            backgroundColor: palette.neutral[100],
            borderRadius: shapes.radius.md,
          },
        ]}
      >
        <ThemedText style={[styles.label, { color: colors.text.disabled }]}>
          Question:
        </ThemedText>
        <ThemedText style={[styles.questionText, { color: colors.text.secondary }]}>
          "{questionText}"
        </ThemedText>
      </View>

      {/* Answer */}
      <View
        style={[
          styles.answerContainer,
          {
            backgroundColor: palette.success[50],
            borderRadius: shapes.radius.md,
            borderLeftColor: palette.success[500],
          },
        ]}
      >
        <ThemedText style={[styles.label, { color: palette.success[600] }]}>
          Answer:
        </ThemedText>
        <ThemedText style={[styles.answerText, { color: colors.text.primary }]}>
          {answerText}
        </ThemedText>
      </View>
    </FeedCard>
  );
};

const styles = StyleSheet.create({
  questionContainer: {
    padding: 12,
    marginBottom: 8,
  },
  answerContainer: {
    padding: 12,
    borderLeftWidth: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  questionText: {
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  answerText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default React.memo(AnswerFeed);
