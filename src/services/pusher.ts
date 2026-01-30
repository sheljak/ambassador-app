import Pusher from 'pusher-js/react-native';
import { getPusherKey } from '@/store/settings';

let pusherInstance: Pusher | null = null;

export const getPusher = (): Pusher => {
  if (!pusherInstance) {
    pusherInstance = new Pusher(getPusherKey(), {
      cluster: 'eu',
      forceTLS: true,
    });
  }
  return pusherInstance;
};

export const CHANNEL_NAMES = {
  TAP_PAGE: 'tap-page',
  USER: 'user',
  MESSAGES: 'messages',
} as const;

export default getPusher;
