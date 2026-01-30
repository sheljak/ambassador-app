import type { User } from '@/store/types_that_will_used';

/**
 * Returns a display label for a user's role.
 */
export const getProfileLabel = (user: Partial<User> & { role_key?: string; nationality?: any; registered_via_group?: string }): string => {
  if (!user) return '';

  const roleKey = user.role_key ?? (user.roles?.[0] ?? '');

  if (roleKey === 'univercity-student') {
    return 'Ambassador';
  }
  if (roleKey === 'univercity-admin' || roleKey === 'group-admin') {
    return 'Administrator';
  }
  if (roleKey === 'prospect') {
    const countryName = user.nationality?.country?.name;
    if (countryName && user.registered_via_group) {
      return `${countryName}, ${user.registered_via_group}`;
    }
    if (countryName) {
      return `Participant from ${countryName}`;
    }
    return 'Participant';
  }
  return 'Participant';
};

interface MessageLike {
  user?: { _id?: number | string | null } | any;
  createdAt?: Date | number | string;
  [key: string]: any;
}

/**
 * Check if two GiftedChat messages are from the same user.
 */
export const isSameUser = (
  current?: MessageLike,
  other?: MessageLike,
): boolean => {
  return !!(other?.user && current?.user && other.user._id === current.user._id);
};

/**
 * Check if two GiftedChat messages are from the same day.
 */
export const isSameDay = (
  current?: MessageLike,
  other?: MessageLike,
): boolean => {
  if (!current?.createdAt || !other?.createdAt) return false;
  const d1 = new Date(current.createdAt as string | number);
  const d2 = new Date(other.createdAt as string | number);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};
