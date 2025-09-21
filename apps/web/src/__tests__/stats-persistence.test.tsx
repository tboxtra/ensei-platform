import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUserStore } from '../store/userStore';
import { UserAuthProvider } from '../contexts/UserAuthContext';

// Mock the API calls
jest.mock('../hooks/useApi', () => ({
  useApi: () => ({
    getMissions: jest.fn().mockResolvedValue([
      { id: '1', created_by: 'user123', participants: [{ user_id: 'user123', honors_earned: 100 }] },
      { id: '2', created_by: 'user123', participants: [{ user_id: 'user123', honors_earned: 50 }] },
    ]),
    getWalletBalance: jest.fn().mockResolvedValue({ honors: 150, usd: 10 }),
    updateProfile: jest.fn().mockResolvedValue({ firstName: 'John', lastName: 'Doe' }),
  }),
}));

// Mock Firebase
jest.mock('../lib/firebase', () => ({
  getFirebaseAuth: () => ({
    currentUser: { uid: 'user123', email: 'test@example.com' },
  }),
}));

// Test component that simulates the dashboard
function TestDashboard() {
  const { user, stats } = useUserStore();
  
  return (
    <div>
      <div data-testid="user-id">{user?.id}</div>
      <div data-testid="missions-created">{stats?.missionsCreated || 0}</div>
      <div data-testid="honors-earned">{stats?.honorsEarned || 0}</div>
    </div>
  );
}

// Test component that simulates the profile page
function TestProfile() {
  const { setUser } = useUserStore();
  
  const updateProfile = () => {
    // Simulate profile update that should NOT affect stats
    setUser({ firstName: 'Jane', lastName: 'Smith' });
  };
  
  return (
    <div>
      <button data-testid="update-profile" onClick={updateProfile}>
        Update Profile
      </button>
    </div>
  );
}

// Test component that simulates navigation
function TestApp() {
  const [currentPage, setCurrentPage] = React.useState('dashboard');
  
  return (
    <div>
      <button data-testid="go-to-profile" onClick={() => setCurrentPage('profile')}>
        Go to Profile
      </button>
      <button data-testid="go-to-dashboard" onClick={() => setCurrentPage('dashboard')}>
        Go to Dashboard
      </button>
      
      {currentPage === 'dashboard' && <TestDashboard />}
      {currentPage === 'profile' && <TestProfile />}
    </div>
  );
}

describe('Stats Persistence', () => {
  let queryClient: QueryClient;
  
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    
    // Reset store state
    useUserStore.getState().resetAll();
  });
  
  test('stats persist after visiting profile page', async () => {
    // Set up initial user and stats
    useUserStore.getState().setUser({ id: 'user123', email: 'test@example.com' });
    useUserStore.getState().setStats({
      missionsCreated: 2,
      honorsEarned: 150,
      missionsCompleted: 1,
      usdSpent: 0,
      usdBalance: 10,
      totalHonors: 150,
      pendingReviews: 0,
      reviewsDone: 0,
    });
    
    render(
      <QueryClientProvider client={queryClient}>
        <UserAuthProvider>
          <TestApp />
        </UserAuthProvider>
      </QueryClientProvider>
    );
    
    // Verify initial stats
    expect(screen.getByTestId('missions-created')).toHaveTextContent('2');
    expect(screen.getByTestId('honors-earned')).toHaveTextContent('150');
    
    // Navigate to profile
    fireEvent.click(screen.getByTestId('go-to-profile'));
    
    // Update profile (this should NOT affect stats)
    fireEvent.click(screen.getByTestId('update-profile'));
    
    // Navigate back to dashboard
    fireEvent.click(screen.getByTestId('go-to-dashboard'));
    
    // Verify stats are still correct (not reset to 0)
    await waitFor(() => {
      expect(screen.getByTestId('missions-created')).toHaveTextContent('2');
      expect(screen.getByTestId('honors-earned')).toHaveTextContent('150');
    });
  });
  
  test('profile updates do not affect stats', async () => {
    // Set up initial user and stats
    useUserStore.getState().setUser({ id: 'user123', email: 'test@example.com' });
    useUserStore.getState().setStats({
      missionsCreated: 5,
      honorsEarned: 300,
      missionsCompleted: 2,
      usdSpent: 0,
      usdBalance: 20,
      totalHonors: 300,
      pendingReviews: 0,
      reviewsDone: 0,
    });
    
    render(
      <QueryClientProvider client={queryClient}>
        <UserAuthProvider>
          <TestApp />
        </UserAuthProvider>
      </QueryClientProvider>
    );
    
    // Navigate to profile
    fireEvent.click(screen.getByTestId('go-to-profile'));
    
    // Update profile
    fireEvent.click(screen.getByTestId('update-profile'));
    
    // Navigate back to dashboard
    fireEvent.click(screen.getByTestId('go-to-dashboard'));
    
    // Verify stats remain unchanged
    await waitFor(() => {
      expect(screen.getByTestId('missions-created')).toHaveTextContent('5');
      expect(screen.getByTestId('honors-earned')).toHaveTextContent('300');
    });
  });
});
