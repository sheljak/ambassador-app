import type { UserTags } from '@/store/types_that_will_used';

/**
 * Formats a date string to relative time (e.g., "2h ago", "3d ago")
 */
export const formatRelativeTime = (dateString?: string): string => {
  if (!dateString) return '';

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 60) return 'now';
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHour < 24) return `${diffHour}h`;
  if (diffDay < 30) return `${diffDay}d`;
  if (diffMonth < 12) return `${diffMonth}mo`;
  return `${diffYear}y`;
};

interface UserWithTags {
  user_tags?: UserTags;
  additionalData?: {
    company_name?: string | null;
  };
  children?: unknown[];
}

/**
 * Prepares subject info string based on user profile type
 * Returns course type + subject for students, job info for staff/alumni, etc.
 */
export const prepareSubjectInfo = (item: UserWithTags): string => {
  if (!item.user_tags?.profile?.[0]) {
    return '';
  }

  const profileKey = item.user_tags.profile[0].key;

  switch (profileKey) {
    case 'staff': {
      if (item.user_tags.staff?.[0] && item.user_tags.subject?.[0]) {
        return `${item.user_tags.subject[0].name}, ${item.user_tags.staff[0].name}`;
      }
      if (item.user_tags.staff?.[0] && item.user_tags.job_title?.[0]) {
        return `${item.user_tags.job_title[0].name}, ${item.user_tags.staff[0].name}`;
      }
      if (item.user_tags.staff?.[0]) {
        return item.user_tags.staff[0].name;
      }
      return '';
    }

    case 'student': {
      if (item.user_tags.courses_types?.[0] && item.user_tags.subject?.[0]) {
        return `${item.user_tags.courses_types[0].name}, ${item.user_tags.subject[0].name}`;
      }
      if (item.user_tags.subject?.[0]) {
        return item.user_tags.subject[0].name;
      }
      return '';
    }

    case 'alumni': {
      if (item.user_tags.job_role?.[0] && item.user_tags.industry?.[0]) {
        return `${item.user_tags.job_role[0].name}, ${item.user_tags.industry[0].name}`;
      }
      return '';
    }

    case 'parent': {
      if (item.children && Array.isArray(item.children)) {
        const count = item.children.length;
        return `Parent of ${count} ${count === 1 ? 'child' : 'children'}`;
      }
      return 'Parent';
    }

    case 'school_student': {
      return 'Student';
    }

    case 'employee': {
      if (item.user_tags.job_role?.[0]) {
        const jobRole = item.user_tags.job_role[0].name;
        const companyName = item.additionalData?.company_name;
        return companyName ? `${jobRole} at ${companyName}` : jobRole;
      }
      return '';
    }

    default:
      return '';
  }
};
