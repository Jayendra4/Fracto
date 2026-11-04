import type { User } from '@/types/userDashboard';

export function useLocalUser(): User | null {
  try {
    const raw = localStorage.getItem('hof_user');

    if (!raw || raw === 'undefined' || raw === 'null') {
      return null;
    }

    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    return parsed as User;
  } catch {
    return null;
  }
}
