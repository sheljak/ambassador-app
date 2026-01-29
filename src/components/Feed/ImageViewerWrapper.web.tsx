import React from 'react';
import { Modal, View, StyleSheet, Pressable, Image } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

interface ImageSource {
  uri: string;
}

interface ImageViewerProps {
  images: ImageSource[];
  imageIndex: number;
  visible: boolean;
  onRequestClose: () => void;
}

// Simple web-compatible image viewer
const ImageViewerWeb: React.FC<ImageViewerProps> = ({
  images,
  imageIndex,
  visible,
  onRequestClose,
}) => {
  const [currentIndex, setCurrentIndex] = React.useState(imageIndex);

  React.useEffect(() => {
    setCurrentIndex(imageIndex);
  }, [imageIndex]);

  if (!visible) return null;

  const currentImage = images[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onRequestClose}>
      <View style={styles.container}>
        <Pressable style={styles.backdrop} onPress={onRequestClose} />

        {/* Close button */}
        <Pressable style={styles.closeButton} onPress={onRequestClose}>
          <ThemedText style={styles.closeText}>✕</ThemedText>
        </Pressable>

        {/* Image */}
        <View style={styles.imageContainer}>
          {hasPrev && (
            <Pressable
              style={[styles.navButton, styles.prevButton]}
              onPress={() => setCurrentIndex((i) => i - 1)}
            >
              <ThemedText style={styles.navText}>‹</ThemedText>
            </Pressable>
          )}

          {currentImage && (
            <Image
              source={{ uri: currentImage.uri }}
              style={styles.image}
              resizeMode="contain"
            />
          )}

          {hasNext && (
            <Pressable
              style={[styles.navButton, styles.nextButton]}
              onPress={() => setCurrentIndex((i) => i + 1)}
            >
              <ThemedText style={styles.navText}>›</ThemedText>
            </Pressable>
          )}
        </View>

        {/* Counter */}
        {images.length > 1 && (
          <View style={styles.counter}>
            <ThemedText style={styles.counterText}>
              {currentIndex + 1} / {images.length}
            </ThemedText>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  closeText: {
    color: '#fff',
    fontSize: 24,
  },
  imageContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  image: {
    width: '80%',
    height: '80%',
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    padding: 20,
    zIndex: 10,
  },
  prevButton: {
    left: 10,
  },
  nextButton: {
    right: 10,
  },
  navText: {
    color: '#fff',
    fontSize: 48,
  },
  counter: {
    position: 'absolute',
    bottom: 40,
  },
  counterText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ImageViewerWeb;
