import { User, UserRole } from '../types';

const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Alex Auditor', role: 'Auditor', avatarInitials: 'AA' },
  { id: 'u2', name: 'Morgan Manager', role: 'Manager', avatarInitials: 'MM' },
  { id: 'u3', name: 'Sam Admin', role: 'Administrator', avatarInitials: 'SA' }
];

// In a real app, this would check credentials against a backend
export const loginAs = async (role: UserRole): Promise<User> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = MOCK_USERS.find(u => u.role === role) || MOCK_USERS[0];
      resolve(user);
    }, 400);
  });
};

export const checkPermission = (user: User, permission: 'edit' | 'publish' | 'delete' | 'view_all'): boolean => {
  switch (permission) {
    case 'edit':
      return user.role === 'Auditor' || user.role === 'Administrator';
    case 'publish':
      return user.role === 'Manager' || user.role === 'Administrator';
    case 'delete':
      return user.role === 'Administrator';
    case 'view_all':
      return user.role === 'Manager' || user.role === 'Administrator';
    default:
      return false;
  }
};