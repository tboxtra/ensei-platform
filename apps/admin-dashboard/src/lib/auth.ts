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

// Admin authentication with demo accounts support
export const firebaseAuth = {
  login: async (credentials: LoginCredentials): Promise<AdminUser> => {
    try {
      // Check for demo accounts first
      if (credentials.email === 'admin@ensei.com' && credentials.password === 'admin123') {
        const adminUser: AdminUser = {
          id: 'demo_admin_1',
          email: 'admin@ensei.com',
          role: 'admin',
          name: 'Admin User',
          permissions: ['*'],
          lastLogin: new Date().toISOString()
        };

        localStorage.setItem('admin_firebaseToken', 'demo_admin_token');
        localStorage.setItem('admin_user', JSON.stringify(adminUser));
        return adminUser;
      }

      if (credentials.email === 'moderator@ensei.com' && credentials.password === 'mod123') {
        const adminUser: AdminUser = {
          id: 'demo_moderator_1',
          email: 'moderator@ensei.com',
          role: 'moderator',
          name: 'Moderator User',
          permissions: ['review:read', 'review:write', 'missions:read', 'users:read'],
          lastLogin: new Date().toISOString()
        };

        localStorage.setItem('admin_firebaseToken', 'demo_moderator_token');
        localStorage.setItem('admin_user', JSON.stringify(adminUser));
        return adminUser;
      }

      // Try Firebase Auth for real accounts
      const { signInWithEmailAndPassword, getAuth } = await import('firebase/auth');
      const { initializeApp, getApps } = await import('firebase/app');
      
      // Initialize Firebase with admin-specific app name to avoid conflicts
      const firebaseConfig = {
        apiKey: "AIzaSyCA-bn41GjFSjM7LEVTIiow6N18cbV8oJY",
        authDomain: "ensei-6c8e0.firebaseapp.com",
        projectId: "ensei-6c8e0",
        storageBucket: "ensei-6c8e0.firebasestorage.app",
        messagingSenderId: "542777590186",
        appId: "1:542777590186:web:59a664f5053a6057d5abd3",
        measurementId: "G-XHHBG5RLVQ"
      };
      
      // Use admin-specific app name to avoid conflicts with user dashboard
      const appName = 'ensei-admin-dashboard';
      let app;
      
      if (getApps().find(app => app.name === appName)) {
        app = getApps().find(app => app.name === appName)!;
      } else {
        app = initializeApp(firebaseConfig, appName);
      }
      
      const authInstance = getAuth(app);

      const userCredential = await signInWithEmailAndPassword(authInstance, credentials.email, credentials.password);
      const user = userCredential.user;

      // Get ID token
      const token = await user.getIdToken();

      // Map Firebase user to AdminUser format
      const adminUser: AdminUser = {
        id: user.uid,
        email: user.email || '',
        role: 'admin', // Default to admin for now
        name: user.displayName || user.email || '',
        permissions: ['*'], // Admin has all permissions
        lastLogin: new Date().toISOString()
      };

      // Store token and user data
      localStorage.setItem('admin_firebaseToken', token);
      localStorage.setItem('admin_user', JSON.stringify(adminUser));

      return adminUser;
    } catch (error) {
      throw new Error('Login failed: ' + (error as Error).message);
    }
  },

  logout: () => {
    localStorage.removeItem('admin_firebaseToken');
    localStorage.removeItem('admin_user');
  },

  getCurrentUser: (): AdminUser | null => {
    const userStr = localStorage.getItem('admin_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken: (): string | null => {
    return localStorage.getItem('admin_firebaseToken');
  },

  setAuth: (user: AdminUser, token: string) => {
    localStorage.setItem('admin_user', JSON.stringify(user));
    localStorage.setItem('admin_firebaseToken', token);
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
