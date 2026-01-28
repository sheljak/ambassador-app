import React, { useMemo, useState, useCallback, useRef } from 'react';
import { View, StyleSheet, Pressable, Modal } from 'react-native';
import { Image } from 'expo-image';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';

import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/theme';
import FeedCard from './FeedCard';
import type { BaseFeedProps } from './types';

const VideoFeed: React.FC<BaseFeedProps> = ({ data }) => {
  const { colors, shapes, palette } = useTheme();
  const videoRef = useRef<Video>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Extract video thumbnail and URL from extraData.post.videos
  const { thumbnailUrl, videoUrl } = useMemo(() => {
    const postVideos = (data.extraData?.post as any)?.videos;
    if (postVideos?.length > 0) {
      return {
        thumbnailUrl: postVideos[0].thumbnails?.midpoint || null,
        videoUrl: postVideos[0].original || null,
      };
    }

    // Try content
    if (typeof data.content === 'object' && data.content?.media_url) {
      return {
        thumbnailUrl: data.content.thumbnail_url || null,
        videoUrl: data.content.media_url || null,
      };
    }

    return { thumbnailUrl: null, videoUrl: null };
  }, [data.extraData, data.content]);

  // Extract caption
  const caption = useMemo(() => {
    const postCaption = (data.extraData?.post as any)?.caption;
    if (postCaption) return postCaption;

    if (typeof data.content === 'object' && data.content?.caption) {
      return data.content.caption;
    }

    return null;
  }, [data.extraData, data.content]);

  const handlePlayPress = useCallback(() => {
    setIsFullscreen(true);
    setIsPlaying(true);
  }, []);

  const handleCloseFullscreen = useCallback(() => {
    setIsFullscreen(false);
    setIsPlaying(false);
  }, []);

  const handlePlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (status.isLoaded && status.didJustFinish) {
      setIsFullscreen(false);
      setIsPlaying(false);
    }
  }, []);

  if (!videoUrl && !thumbnailUrl) {
    return null;
  }

  return (
    <FeedCard data={data} label="Video" labelColor={palette.error[500]}>
      <View style={styles.videoContainer}>
        <Pressable
          onPress={handlePlayPress}
          style={({ pressed }) => [
            styles.thumbnailContainer,
            { opacity: pressed ? 0.8 : 1 },
          ]}
        >
          {thumbnailUrl ? (
            <Image
              source={{ uri: thumbnailUrl }}
              style={[styles.thumbnail, { borderRadius: shapes.radius.md }]}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View
              style={[
                styles.thumbnail,
                styles.placeholderThumbnail,
                { borderRadius: shapes.radius.md, backgroundColor: palette.neutral[300] },
              ]}
            >
              <ThemedText style={{ color: palette.neutral[500] }}>Video</ThemedText>
            </View>
          )}

          {/* Play button overlay */}
          <View style={styles.playButtonContainer}>
            <View style={[styles.playButton, { backgroundColor: palette.primary[500] }]}>
              <ThemedText style={styles.playIcon}>▶</ThemedText>
            </View>
          </View>

          {/* Tap hint */}
          <View style={[styles.tapHint, { borderRadius: shapes.radius.md }]}>
            <ThemedText style={styles.tapHintText}>Tap to play</ThemedText>
          </View>
        </Pressable>
      </View>

      {caption && (
        <ThemedText style={[styles.caption, { color: colors.text.primary }]}>
          {caption}
        </ThemedText>
      )}

      {/* Fullscreen Video Modal */}
      <Modal
        visible={isFullscreen}
        animationType="fade"
        supportedOrientations={['portrait', 'landscape']}
        onRequestClose={handleCloseFullscreen}
      >
        <View style={styles.fullscreenContainer}>
          {/* Close button */}
          <Pressable
            style={styles.closeButton}
            onPress={handleCloseFullscreen}
          >
            <ThemedText style={styles.closeButtonText}>✕</ThemedText>
          </Pressable>

          {/* Video player */}
          {videoUrl && (
            <Video
              ref={videoRef}
              source={{ uri: videoUrl }}
              style={styles.fullscreenVideo}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay={isPlaying}
              useNativeControls
              isLooping={false}
              onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
            />
          )}
        </View>
      </Modal>
    </FeedCard>
  );
};

const styles = StyleSheet.create({
  videoContainer: {
    marginBottom: 8,
  },
  thumbnailContainer: {
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: 200,
  },
  placeholderThumbnail: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  playIcon: {
    color: '#FFFFFF',
    fontSize: 22,
    marginLeft: 4,
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
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  fullscreenVideo: {
    width: '100%',
    height: '100%',
  },
});

export default React.memo(VideoFeed);
