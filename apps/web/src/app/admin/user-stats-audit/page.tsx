'use client';

import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../../contexts/UserAuthContext';

interface UserStatsAudit {
  uid: string;
  displayName: string;
  email: string;
  storedStats: {
    missionsCreated: number;
    missionsCompleted: number;
    tasksDone: number;
    totalEarned: number;
  };
  computedStats: {
    missionsCreated: number;
    missionsCompleted: number;
    tasksDone: number;
    totalEarned: number;
  };
  differences: {
    missionsCreated: number;
    missionsCompleted: number;
    tasksDone: number;
    totalEarned: number;
  };
  hasDrift: boolean;
}

export default function UserStatsAuditPage() {
  const { user } = useAuth();
  const [auditData, setAuditData] = useState<UserStatsAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  // Check if user is admin
  const isAdmin = user?.role === 'admin' || user?.email?.includes('admin');

  useEffect(() => {
    if (!isAdmin) {
      setError('Access denied. Admin privileges required.');
      setLoading(false);
      return;
    }

    loadAuditData();
  }, [isAdmin]);

  const loadAuditData = async () => {
    try {
      setLoading(true);
      const db = getFirestore();
      
      // Get all users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const auditResults: UserStatsAudit[] = [];

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        const uid = userDoc.id;

        // Get stored stats
        const statsDoc = await getDoc(doc(db, `users/${uid}/stats`));
        const storedStats = statsDoc.exists() ? statsDoc.data() : {
          missionsCreated: 0,
          missionsCompleted: 0,
          tasksDone: 0,
          totalEarned: 0
        };

        // Compute stats from source data
        const computedStats = await computeUserStats(uid);

        // Calculate differences
        const differences = {
          missionsCreated: storedStats.missionsCreated - computedStats.missionsCreated,
          missionsCompleted: storedStats.missionsCompleted - computedStats.missionsCompleted,
          tasksDone: storedStats.tasksDone - computedStats.tasksDone,
          totalEarned: storedStats.totalEarned - computedStats.totalEarned
        };

        const hasDrift = Object.values(differences).some(diff => Math.abs(diff) > 0);

        auditResults.push({
          uid,
          displayName: userData.displayName || userData.name || 'Unknown',
          email: userData.email || 'No email',
          storedStats,
          computedStats,
          differences,
          hasDrift
        });
      }

      // Sort by drift (users with differences first)
      auditResults.sort((a, b) => {
        if (a.hasDrift && !b.hasDrift) return -1;
        if (!a.hasDrift && b.hasDrift) return 1;
        return 0;
      });

      setAuditData(auditResults);
    } catch (err) {
      console.error('Error loading audit data:', err);
      setError('Failed to load audit data');
    } finally {
      setLoading(false);
    }
  };

  const computeUserStats = async (uid: string) => {
    const db = getFirestore();
    
    // Missions Created
    const missionsSnapshot = await getDocs(collection(db, 'missions'));
    const missionsCreated = missionsSnapshot.docs.filter(doc => 
      doc.data().created_by === uid && !doc.data().deletedAt
    ).length;

    // Tasks Done (from verifications)
    const verificationsSnapshot = await getDocs(collection(db, 'verifications'));
    const tasksDone = verificationsSnapshot.docs.filter(doc => 
      doc.data().uid === uid && doc.data().status === 'VERIFIED'
    ).length;

    // Missions Completed (from mission progress)
    const progressSnapshot = await getDocs(collection(db, `users/${uid}/missionProgress`));
    const missionsCompleted = progressSnapshot.docs.filter(doc => 
      doc.data().completed === true
    ).length;

    // Total Earned (simplified - would need to check degen winners)
    const totalEarned = 0; // This would require more complex logic

    return {
      missionsCreated,
      missionsCompleted,
      tasksDone,
      totalEarned
    };
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">User Stats Audit</h1>
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400">Access denied. Admin privileges required.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">User Stats Audit</h1>
          <div className="bg-gray-800/30 rounded-lg p-8 text-center">
            <p className="text-gray-400">Loading audit data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">User Stats Audit</h1>
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">User Stats Audit</h1>
          <button
            onClick={loadAuditData}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
          >
            Refresh Data
          </button>
        </div>

        <div className="bg-gray-800/30 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">User</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Missions Created</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Missions Completed</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Tasks Done</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Total Earned</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {auditData.map((user) => (
                  <tr 
                    key={user.uid}
                    className={`hover:bg-gray-700/30 cursor-pointer ${user.hasDrift ? 'bg-red-900/10' : ''}`}
                    onClick={() => setSelectedUser(selectedUser === user.uid ? null : user.uid)}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-white">{user.displayName}</div>
                        <div className="text-sm text-gray-400">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <div className="text-white">{user.storedStats.missionsCreated}</div>
                        {user.differences.missionsCreated !== 0 && (
                          <div className={`text-xs ${user.differences.missionsCreated > 0 ? 'text-red-400' : 'text-green-400'}`}>
                            {user.differences.missionsCreated > 0 ? '+' : ''}{user.differences.missionsCreated}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <div className="text-white">{user.storedStats.missionsCompleted}</div>
                        {user.differences.missionsCompleted !== 0 && (
                          <div className={`text-xs ${user.differences.missionsCompleted > 0 ? 'text-red-400' : 'text-green-400'}`}>
                            {user.differences.missionsCompleted > 0 ? '+' : ''}{user.differences.missionsCompleted}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <div className="text-white">{user.storedStats.tasksDone}</div>
                        {user.differences.tasksDone !== 0 && (
                          <div className={`text-xs ${user.differences.tasksDone > 0 ? 'text-red-400' : 'text-green-400'}`}>
                            {user.differences.tasksDone > 0 ? '+' : ''}{user.differences.tasksDone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <div className="text-white">{user.storedStats.totalEarned}</div>
                        {user.differences.totalEarned !== 0 && (
                          <div className={`text-xs ${user.differences.totalEarned > 0 ? 'text-red-400' : 'text-green-400'}`}>
                            {user.differences.totalEarned > 0 ? '+' : ''}{user.differences.totalEarned}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {user.hasDrift ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-900/20 text-red-400">
                          Drift Detected
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900/20 text-green-400">
                          Accurate
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedUser && (
          <div className="mt-6 bg-gray-800/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Detailed Comparison</h3>
            {(() => {
              const user = auditData.find(u => u.uid === selectedUser);
              if (!user) return null;
              
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-300 mb-2">Stored Stats</h4>
                    <div className="space-y-2 text-sm">
                      <div>Missions Created: {user.storedStats.missionsCreated}</div>
                      <div>Missions Completed: {user.storedStats.missionsCompleted}</div>
                      <div>Tasks Done: {user.storedStats.tasksDone}</div>
                      <div>Total Earned: {user.storedStats.totalEarned}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-300 mb-2">Computed Stats</h4>
                    <div className="space-y-2 text-sm">
                      <div>Missions Created: {user.computedStats.missionsCreated}</div>
                      <div>Missions Completed: {user.computedStats.missionsCompleted}</div>
                      <div>Tasks Done: {user.computedStats.tasksDone}</div>
                      <div>Total Earned: {user.computedStats.totalEarned}</div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
