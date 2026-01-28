import React from 'react';
import { Platform } from 'react-native';

let ImageViewer: React.ComponentType<any>;

if (Platform.OS === 'web') {
  ImageViewer = require('react-native-image-viewer-web').default;
} else {
  ImageViewer = require('react-native-image-viewing').default;
}

export default ImageViewer;
