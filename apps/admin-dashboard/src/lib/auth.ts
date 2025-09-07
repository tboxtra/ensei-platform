export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'moderator' | 'viewer';
  name: string;
  permissions: string[];
  lastLogin?: string;
}

export interface AuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

// Mock authentication for development
export const mockAuth = {
  login: async (credentials: LoginCredentials): Promise<AdminUser> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (credentials.email === 'admin@ensei.com' && credentials.password === 'admin123') {
      return {
        id: 'admin_1',
        email: 'admin@ensei.com',
        role: 'admin',
        name: 'Admin User',
        permissions: ['*'], // All permissions
        lastLogin: new Date().toISOString()
      };
    } else if (credentials.email === 'moderator@ensei.com' && credentials.password === 'mod123') {
      return {
        id: 'mod_1',
        email: 'moderator@ensei.com',
        role: 'moderator',
        name: 'Moderator User',
        permissions: ['review:read', 'review:write', 'missions:read', 'users:read'],
        lastLogin: new Date().toISOString()
      };
    } else {
      throw new Error('Invalid credentials');
    }
  },
  
  logout: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  },
  
  getCurrentUser: (): AdminUser | null => {
    const userStr = localStorage.getItem('admin_user');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  getToken: (): string | null => {
    return localStorage.getItem('admin_token');
  },
  
  setAuth: (user: AdminUser, token: string) => {
    localStorage.setItem('admin_user', JSON.stringify(user));
    localStorage.setItem('admin_token', token);
  }
};

export const hasPermission = (user: AdminUser | null, permission: string): boolean => {
  if (!user) return false;
  if (user.permissions.includes('*')) return true;
  return user.permissions.includes(permission);
};

export const hasRole = (user: AdminUser | null, role: string): boolean => {
  if (!user) return false;
  return user.role === role;
};
