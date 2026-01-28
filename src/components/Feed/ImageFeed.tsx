import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import Lightbox from 'react-native-lightbox-v2';

import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/theme';
import FeedCard from './FeedCard';
import type { BaseFeedProps } from './types';

const ImageFeed: React.FC<BaseFeedProps> = ({ data }) => {
  const { colors, shapes, palette } = useTheme();

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

  if (!previewUrl) {
    return null;
  }

  const imageSource = fullUrl || previewUrl;

  return (
    <FeedCard data={data} label="Photo" labelColor={palette.info[500]}>
      <View style={styles.imageContainer}>
        <Lightbox
          springConfig={{ tension: 300, friction: 30 }}
          swipeToDismiss={true}
        >
          <View style={styles.pressable}>
            <Image
              source={{ uri: previewUrl }}
              style={[styles.image, { borderRadius: shapes.radius.md }]}
              contentFit="cover"
              transition={200}
            />
            {/* Tap hint overlay */}
            <View style={[styles.tapHint, { borderRadius: shapes.radius.md }]}>
              <ThemedText style={styles.tapHintText}>Tap to view</ThemedText>
            </View>
          </View>
          <View style={styles.lightboxContent}>
            <Image
              source={{ uri: imageSource }}
              style={styles.fullImage}
              contentFit="contain"
            />
          </View>
        </Lightbox>
      </View>

      {caption && (
        <ThemedText style={[styles.caption, { color: colors.text.primary }]}>
          {caption}
        </ThemedText>
      )}
    </FeedCard>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    marginBottom: 8,
  },
  pressable: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 200,
  },
  tapHint: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tapHintText: {
    color: '#FFFFFF',
    fontSize: 11,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
  },
  lightboxContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
});

export default React.memo(ImageFeed);
