import React, { useMemo, useState, useCallback } from 'react';
import { View, Pressable } from 'react-native';
import { Image } from 'expo-image';

import ImageViewer from './ImageViewerWrapper';
import { ThemedText } from '@/components/ThemedText';
import { useTheme, createStyles } from '@/theme';
import FeedCard from './FeedCard';
import type { BaseFeedProps } from './types';

const ImageFeed: React.FC<BaseFeedProps> = ({ data }) => {
  const { colors, shapes, palette } = useTheme();
  const styles = useStyles();
  const [isViewerVisible, setIsViewerVisible] = useState(false);

  // Extract image from extraData.post.images or media
  const { previewUrl, fullUrl } = useMemo(() => {
    // Try extraData.post.images first
    const postImages = (data.extraData?.post as any)?.images;
    if (postImages?.length > 0) {
      return {
        previewUrl: postImages[0].sizes?.['370x370'] || postImages[0].original,
        fullUrl: postImages[0].sizes?.['750x1400'] || postImages[0].original,
      };
    }

    // Try media array
    if (data.media?.length) {
      return {
        previewUrl: data.media[0].sizes?.['370x370'] || data.media[0].original,
        fullUrl: data.media[0].original,
      };
    }

    return { previewUrl: null, fullUrl: null };
  }, [data.extraData, data.media]);

  // Extract caption
  const caption = useMemo(() => {
    const postCaption = (data.extraData?.post as any)?.caption;
    if (postCaption) return postCaption;

    if (typeof data.content === 'object' && data.content?.caption) {
      return data.content.caption;
    }

    return null;
  }, [data.extraData, data.content]);

  const handleOpenViewer = useCallback(() => {
    setIsViewerVisible(true);
  }, []);

  const handleCloseViewer = useCallback(() => {
    setIsViewerVisible(false);
  }, []);

  if (!previewUrl) {
    return null;
  }

  const images = fullUrl ? [{ uri: fullUrl }] : [];

  return (
    <FeedCard data={data} label="Photo" labelColor={palette.info[500]}>
      <View style={styles.imageContainer}>
        <Pressable
          onPress={handleOpenViewer}
          style={({ pressed }) => [
            styles.pressable,
            { opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Image
            source={{ uri: previewUrl }}
            style={[styles.image, { borderRadius: shapes.radius.md }]}
            contentFit="cover"
            transition={200}
          />
          <View style={[styles.tapHint, { borderRadius: shapes.radius.md }]}>
            <ThemedText style={styles.tapHintText}>Tap to view</ThemedText>
          </View>
        </Pressable>
      </View>

      {caption && (
        <ThemedText style={[styles.caption, { color: colors.text.primary }]}>
          {caption}
        </ThemedText>
      )}

      <ImageViewer
        images={images}
        imageIndex={0}
        visible={isViewerVisible}
        onRequestClose={handleCloseViewer}
        swipeToCloseEnabled
        doubleTapToZoomEnabled
      />
    </FeedCard>
  );
};

const useStyles = createStyles(({ spacing, typography }) => ({
  imageContainer: {
    marginBottom: spacing.sm,
  },
  pressable: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: spacing.xs * 50,
  },
  tapHint: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  tapHintText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.xs,
  },
  caption: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
}));

export default React.memo(ImageFeed);
