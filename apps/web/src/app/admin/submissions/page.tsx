'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Flag, 
  Clock, 
  AlertTriangle, 
  Bot, 
  UserX, 
  Shield, 
  User, 
  Calendar,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { 
  getAdminDashboardData, 
  getMissionSubmissionLogs, 
  flagSubmission, 
  verifySubmission,
  type AdminDashboardData,
  type SubmissionLog 
} from '@/lib/submission-logging';

export default function AdminSubmissionsPage() {
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [selectedMission, setSelectedMission] = useState<string>('');
  const [missionLogs, setMissionLogs] = useState<SubmissionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionLog | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (selectedMission) {
      loadMissionLogs(selectedMission);
    }
  }, [selectedMission]);

  const loadDashboardData = async () => {
    try {
      const data = await getAdminDashboardData();
      setDashboardData(data);
      if (data.missionPerformance.length > 0) {
        setSelectedMission(data.missionPerformance[0].missionId);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMissionLogs = async (missionId: string) => {
    try {
      const logs = await getMissionSubmissionLogs(missionId);
      setMissionLogs(logs);
    } catch (error) {
      console.error('Error loading mission logs:', error);
    }
  };

  const handleVerifySubmission = async (submission: SubmissionLog) => {
    try {
      await verifySubmission(submission.id, 'admin-1', 'Verified by admin');
      loadMissionLogs(selectedMission);
      setShowReviewModal(false);
      alert('Submission verified successfully!');
    } catch (error) {
      console.error('Error verifying submission:', error);
      alert('Error verifying submission');
    }
  };

  const handleFlagSubmission = async (submission: SubmissionLog, reason: string) => {
    try {
      await flagSubmission(submission.id, reason, 'admin-1', 'Flagged by admin');
      loadMissionLogs(selectedMission);
      setShowReviewModal(false);
      alert(`Submission flagged: ${reason}`);
    } catch (error) {
      console.error('Error flagging submission:', error);
      alert('Error flagging submission');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'flagged': return <Flag className="w-4 h-4 text-red-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified': return <Badge className="bg-green-100 text-green-700 border-green-300">Verified</Badge>;
      case 'flagged': return <Badge className="bg-red-100 text-red-700 border-red-300">Flagged</Badge>;
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">Pending</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-700 border-gray-300">Unknown</Badge>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-50 border-green-200';
      case 'flagged': return 'bg-red-50 border-red-200';
      case 'pending': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error loading dashboard data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Review and manage mission submissions</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData.totalSubmissions}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Flagged Submissions</p>
                  <p className="text-2xl font-bold text-red-600">{dashboardData.flaggedSubmissions}</p>
                </div>
                <Flag className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                  <p className="text-2xl font-bold text-yellow-600">{dashboardData.pendingReviews}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData.totalUsers}</p>
                </div>
                <User className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Flagging Reasons */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Top Flagging Reasons
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.topFlaggingReasons.map((reason, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">{reason.reason}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{reason.count}</div>
                      <div className="text-xs text-gray-500">{reason.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mission Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Mission Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.missionPerformance.map((mission) => (
                  <div key={mission.missionId} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{mission.missionTitle}</h4>
                      <Button
                        size="sm"
                        variant={selectedMission === mission.missionId ? "default" : "outline"}
                        onClick={() => setSelectedMission(mission.missionId)}
                      >
                        View
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div>Submissions: {mission.submissions}</div>
                      <div>Flag Rate: {mission.flaggingRate}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* User Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                User Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.userActivity.map((user) => (
                  <div key={user.userId} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{user.userName}</h4>
                      <Badge variant="outline" className="text-xs">
                        {user.flaggingRate}% flagged
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div>Total: {user.totalSubmissions}</div>
                      <div>Verified: {user.verifiedSubmissions}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mission Submissions */}
        {selectedMission && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Mission Submissions</CardTitle>
              <CardDescription>
                Review and manage submissions for the selected mission
              </CardDescription>
            </CardHeader>
            <CardContent>
              {missionLogs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No submissions found for this mission</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {missionLogs.map((log) => (
                    <div key={log.id} className={`flex items-center justify-between p-4 border rounded-lg ${getStatusColor(log.status)}`}>
                      <div className="flex items-center gap-4">
                        {getStatusIcon(log.status)}
                        <div>
                          <div className="font-medium">{log.userName}</div>
                          <div className="text-sm text-gray-600">
                            Task: {log.taskId} • {log.timestamp.toLocaleString()}
                          </div>
                          {log.flaggedReason && (
                            <div className="text-sm text-red-600 mt-1">
                              <strong>Flagged:</strong> {log.flaggedReason}
                            </div>
                          )}
                          {log.metadata.twitterHandle && (
                            <div className="text-sm text-blue-600">
                              Twitter: {log.metadata.twitterHandle}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(log.status)}
                        {log.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-300 hover:bg-green-50"
                              onClick={() => {
                                setSelectedSubmission(log);
                                setShowReviewModal(true);
                              }}
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Review
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Review Modal */}
        {showReviewModal && selectedSubmission && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Review Submission</h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  <strong>User:</strong> {selectedSubmission.userName}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Task:</strong> {selectedSubmission.taskId}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Submitted:</strong> {selectedSubmission.timestamp.toLocaleString()}
                </p>
                {selectedSubmission.metadata.twitterHandle && (
                  <p className="text-sm text-gray-600">
                    <strong>Twitter:</strong> {selectedSubmission.metadata.twitterHandle}
                  </p>
                )}
              </div>
              
              <div className="space-y-2 mb-6">
                <Button
                  className="w-full text-green-600 border-green-300 hover:bg-green-50"
                  variant="outline"
                  onClick={() => handleVerifySubmission(selectedSubmission)}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verify Submission
                </Button>
                <Button
                  className="w-full text-red-600 border-red-300 hover:bg-red-50"
                  variant="outline"
                  onClick={() => handleFlagSubmission(selectedSubmission, 'User didn\'t complete the task')}
                >
                  <Flag className="w-4 h-4 mr-2" />
                  Flag as Incomplete
                </Button>
                <Button
                  className="w-full text-red-600 border-red-300 hover:bg-red-50"
                  variant="outline"
                  onClick={() => handleFlagSubmission(selectedSubmission, 'User appears to be a bot')}
                >
                  <Bot className="w-4 h-4 mr-2" />
                  Flag as Bot
                </Button>
                <Button
                  className="w-full text-red-600 border-red-300 hover:bg-red-50"
                  variant="outline"
                  onClick={() => handleFlagSubmission(selectedSubmission, 'Low value account')}
                >
                  <UserX className="w-4 h-4 mr-2" />
                  Flag as Low Value
                </Button>
              </div>
              
              <Button
                variant="outline"
                onClick={() => setShowReviewModal(false)}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
