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

// Real authentication using API Gateway
export const mockAuth = {
  login: async (credentials: LoginCredentials): Promise<AdminUser> => {
    try {
      const response = await fetch('http://localhost:3002/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      // Map API response to AdminUser format
      const adminUser: AdminUser = {
        id: data.user.id,
        email: data.user.email,
        role: data.user.role as 'admin' | 'moderator' | 'viewer',
        name: data.user.username || data.user.email,
        permissions: data.user.role === 'admin' ? ['*'] : ['review:read', 'review:write', 'missions:read', 'users:read'],
        lastLogin: new Date().toISOString()
      };

      // Store token and user data
      localStorage.setItem('admin_token', data.accessToken);
      localStorage.setItem('admin_user', JSON.stringify(adminUser));
      
      return adminUser;
    } catch (error) {
      throw new Error('Login failed: ' + (error as Error).message);
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
