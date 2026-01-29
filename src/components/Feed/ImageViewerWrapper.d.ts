import React from 'react';

interface ImageSource {
  uri: string;
}

interface ImageViewerProps {
  images: ImageSource[];
  imageIndex: number;
  visible: boolean;
  onRequestClose: () => void;
  swipeToCloseEnabled?: boolean;
  doubleTapToZoomEnabled?: boolean;
}

declare const ImageViewer: React.FC<ImageViewerProps>;
export default ImageViewer;
