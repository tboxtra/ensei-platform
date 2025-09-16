'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Flag, AlertCircle, Clock, User, Trash2 } from 'lucide-react';
import { 
  getAllTaskCompletions, 
  getMissionCompletionStats, 
  clearAllTaskCompletions,
  exportTaskCompletions
} from '@/lib/task-completion-storage';
import { type TaskCompletion } from '@/lib/task-verification';

export default function TestRealDataPage() {
  const [completions, setCompletions] = useState<TaskCompletion[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCompletions = () => {
    setLoading(true);
    try {
      const allCompletions = getAllTaskCompletions();
      setCompletions(allCompletions);
    } catch (error) {
      console.error('Error loading completions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompletions();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'flagged': return <Flag className="w-4 h-4 text-red-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified': return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
      case 'flagged': return <Badge className="bg-red-100 text-red-800">Flagged</Badge>;
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all task completion data? This action cannot be undone.')) {
      clearAllTaskCompletions();
      loadCompletions();
      alert('All task completion data has been cleared.');
    }
  };

  const handleExportData = () => {
    const data = exportTaskCompletions();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'task-completions.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Group completions by mission
  const completionsByMission = completions.reduce((acc, completion) => {
    if (!acc[completion.missionId]) {
      acc[completion.missionId] = [];
    }
    acc[completion.missionId].push(completion);
    return acc;
  }, {} as Record<string, TaskCompletion[]>);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Real Task Completion Data</h1>
          <p className="text-gray-600">
            This page shows real user submission data from the task verification system.
            Data is stored in localStorage and persists across sessions.
          </p>
        </div>

        {/* Controls */}
        <div className="mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Data Management</h2>
                <p className="text-gray-600 text-sm">
                  Total completions: <strong>{completions.length}</strong> | 
                  Missions with submissions: <strong>{Object.keys(completionsByMission).length}</strong>
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={loadCompletions}
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  {loading ? 'Loading...' : 'Refresh'}
                </Button>
                <Button
                  onClick={handleExportData}
                  disabled={completions.length === 0}
                  variant="outline"
                  className="border-green-500 text-green-600 hover:bg-green-50"
                >
                  Export Data
                </Button>
                <Button
                  onClick={handleClearData}
                  disabled={completions.length === 0}
                  variant="outline"
                  className="border-red-500 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Completions by Mission */}
        {Object.keys(completionsByMission).length === 0 ? (
          <Card className="p-8 text-center">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Task Completions Yet</h3>
            <p className="text-gray-600 mb-4">
              Complete some tasks in the platform to see real submission data here.
            </p>
            <Button
              onClick={() => window.location.href = '/missions'}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Go to Missions
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(completionsByMission).map(([missionId, missionCompletions]) => {
              const stats = getMissionCompletionStats(missionId);
              
              return (
                <Card key={missionId} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Mission: {missionId}</h3>
                      <p className="text-gray-600 text-sm">
                        {missionCompletions.length} total submissions
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className="bg-green-100 text-green-800">
                        {stats.verified} Verified
                      </Badge>
                      <Badge className="bg-red-100 text-red-800">
                        {stats.flagged} Flagged
                      </Badge>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        {stats.pending} Pending
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {missionCompletions.map((completion) => (
                      <div key={completion.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(completion.status)}
                            <div>
                              <h4 className="font-medium text-gray-900">{completion.userName}</h4>
                              <p className="text-sm text-gray-600">
                                Task: {completion.taskId} | User ID: {completion.userId}
                              </p>
                            </div>
                          </div>
                          {getStatusBadge(completion.status)}
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                          <div>
                            <span className="font-medium">Completed:</span>
                            <span className="ml-2">{completion.completedAt.toLocaleString()}</span>
                          </div>
                          {completion.verifiedAt && (
                            <div>
                              <span className="font-medium">Verified:</span>
                              <span className="ml-2">{completion.verifiedAt.toLocaleString()}</span>
                            </div>
                          )}
                          {completion.flaggedAt && (
                            <div>
                              <span className="font-medium">Flagged:</span>
                              <span className="ml-2">{completion.flaggedAt.toLocaleString()}</span>
                            </div>
                          )}
                        </div>

                        {completion.flaggedReason && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-800">
                              <strong>Flagged Reason:</strong> {completion.flaggedReason}
                            </p>
                          </div>
                        )}

                        {completion.metadata && (
                          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800">
                              <strong>Metadata:</strong> {JSON.stringify(completion.metadata, null, 2)}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
