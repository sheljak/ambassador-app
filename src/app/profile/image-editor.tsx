import React, { useCallback } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
// import { ImageEditor } from 'expo-crop-image';

export default function ImageEditorScreen() {
  const router = useRouter();
  const { uri } = useLocalSearchParams<{ uri: string }>();

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  const handleComplete = useCallback(
    (image: any) => {
      // Navigate back with the cropped image URI
      router.navigate({
        pathname: '/profile/account-information',
        params: { croppedUri: image.uri },
      } as any);
    },
    [router]
  );

  if (!uri) {
    router.back();
    return null;
  }

  return (
   null
  );
}
