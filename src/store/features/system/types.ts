import type { User } from '../../types_that_will_used';

/**
 * Account type - extends User with app-specific settings
 * Note: The API returns User type, we extend it locally for app state
 */
export interface Account extends User {
  settings?: AccountSettings;
}

export interface AccountSettings {
  notificationsEnabled?: boolean;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  theme?: 'light' | 'dark' | 'system';
  language?: string;
}
