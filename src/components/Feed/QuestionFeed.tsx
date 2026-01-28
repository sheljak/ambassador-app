import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/theme';
import FeedCard from './FeedCard';
import type { BaseFeedProps } from './types';

interface QuestionFeedProps extends BaseFeedProps {
  onAddAnswer?: () => void;
}

const QuestionFeed: React.FC<QuestionFeedProps> = ({ data, onAddAnswer }) => {
  const { colors, shapes, palette } = useTheme();

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
          "{questionText}"
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

const styles = StyleSheet.create({
  questionContainer: {
    padding: 12,
    borderLeftWidth: 4,
    flexDirection: 'row',
    gap: 8,
  },
  questionMark: {
    fontSize: 24,
    fontWeight: '700',
  },
  questionText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
    fontStyle: 'italic',
  },
  addAnswerButton: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  addAnswerText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default React.memo(QuestionFeed);
