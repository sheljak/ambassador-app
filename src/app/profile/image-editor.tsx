import { useLocalSearchParams, useRouter } from 'expo-router';
// import { ImageEditor } from 'expo-crop-image';

export default function ImageEditorScreen() {
  const router = useRouter();
  const { uri } = useLocalSearchParams<{ uri: string }>();

  if (!uri) {
    router.back();
    return null;
  }

  return (
   null
  );
}
