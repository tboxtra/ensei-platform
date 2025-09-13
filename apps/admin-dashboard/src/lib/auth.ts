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

// Firebase authentication for admin dashboard
export const firebaseAuth = {
  login: async (credentials: LoginCredentials): Promise<AdminUser> => {
    try {
      // Use Firebase Auth to sign in
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const { auth } = await import('firebase/auth');
      const { initializeApp } = await import('firebase/app');

      // Initialize Firebase if not already done
      const firebaseConfig = {
        apiKey: "AIzaSyCA-bn41GjFSjM7LEVTIiow6N18cbV8oJY",
        authDomain: "ensei-6c8e0.firebaseapp.com",
        projectId: "ensei-6c8e0",
        storageBucket: "ensei-6c8e0.firebasestorage.app",
        messagingSenderId: "542777590186",
        appId: "1:542777590186:web:59a664f5053a6057d5abd3",
        measurementId: "G-XHHBG5RLVQ"
      };

      const app = initializeApp(firebaseConfig);
      const authInstance = auth(app);

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
      localStorage.setItem('firebaseToken', token);
      localStorage.setItem('admin_user', JSON.stringify(adminUser));

      return adminUser;
    } catch (error) {
      throw new Error('Login failed: ' + (error as Error).message);
    }
  },

  logout: () => {
    localStorage.removeItem('firebaseToken');
    localStorage.removeItem('admin_user');
  },

  getCurrentUser: (): AdminUser | null => {
    const userStr = localStorage.getItem('admin_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken: (): string | null => {
    return localStorage.getItem('firebaseToken');
  },

  setAuth: (user: AdminUser, token: string) => {
    localStorage.setItem('admin_user', JSON.stringify(user));
    localStorage.setItem('firebaseToken', token);
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
