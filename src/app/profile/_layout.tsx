import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="account-information" />
      <Stack.Screen name="change-email" />
      <Stack.Screen name="ambassador-profile" />
      <Stack.Screen name="time-report" />
      <Stack.Screen name="career-reference" />
      <Stack.Screen name="manage-account" />
      <Stack.Screen name="change-password" />
    </Stack>
  );
}
