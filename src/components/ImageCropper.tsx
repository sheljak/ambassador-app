import React from 'react';
// import { ImageEditor } from 'expo-crop-image';
import { useTheme } from '@/theme';

interface CroppedResult {
  uri: string;
  width: number;  
  height: number;
}

interface ImageCropperProps {
  visible: boolean;
  imageUri: string;
  aspectRatio?: number;
  onComplete: (result: CroppedResult) => void;
  onCancel: () => void;
}

export function ImageCropper({
  visible,
  imageUri,
  aspectRatio = 1,
  onComplete,
  onCancel,
}: ImageCropperProps) {
  const { colors, palette } = useTheme();

  if (!imageUri) return null;

  return (
null
  );
}
