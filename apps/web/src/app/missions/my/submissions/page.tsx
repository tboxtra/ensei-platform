'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Flag, AlertCircle, Clock, User, Calendar } from 'lucide-react';
import { getFlaggingReasons } from '@/lib/task-verification';
import { type TaskCompletionRecord } from '@/lib/task-status-system';
import { useMissionTaskCompletions, useFlagTaskCompletion, useVerifyTaskCompletion } from '@/hooks/useTaskStatusSystem';

interface Mission {
    id: string;
    title: string;
    description: string;
    tweetUrl: string;
    username: string;
    creator: string;
    createdAt: Date;
    status: string;
}

export default function MissionSubmissionsPage() {
    const [missions, setMissions] = useState<Mission[]>([]);
    const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
    const [showFlagModal, setShowFlagModal] = useState<{ completion: TaskCompletionRecord | null, show: boolean }>({ completion: null, show: false });

    // Use React Query hooks for real-time updates
    const flagTaskCompletionMutation = useFlagTaskCompletion();
    const verifyTaskCompletionMutation = useVerifyTaskCompletion();

    // Get submissions for selected mission using React Query
    const { data: submissions = [], isLoading: loadingSubmissions } = useMissionTaskCompletions(
        selectedMission?.id || ''
    );


    // Mock missions data
    useEffect(() => {
        setMissions([
            {
                id: 'mission-1',
                title: 'Like Our Latest Tweet',
                description: 'Help us grow by liking our latest tweet about Web3 innovation',
                tweetUrl: 'https://twitter.com/ensei_platform/status/1234567890',
                username: 'ensei_platform',
                creator: 'Current User',
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
                status: 'active'
            },
            {
                id: 'mission-2',
                title: 'Retweet & Comment',
                description: 'Retweet our announcement and leave a thoughtful comment',
                tweetUrl: 'https://twitter.com/ensei_platform/status/1234567891',
                username: 'ensei_platform',
                creator: 'Current User',
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
                status: 'active'
            }
        ]);
    }, []);

    const handleFlagSubmission = async (completion: TaskCompletionRecord, reason: string) => {
        try {
            await flagTaskCompletionMutation.mutateAsync({
                completionId: completion.id,
                reason,
                reviewerId: 'creator-1',
                reviewerName: 'Mission Creator'
            });
            // React Query will automatically refetch and update the UI
            setShowFlagModal({ completion: null, show: false });
            console.log(`Submission flagged: ${reason}`);
        } catch (error) {
            console.error('Error flagging submission:', error);
            alert('Error flagging submission');
        }
    };

    const handleVerifySubmission = async (completion: TaskCompletionRecord) => {
        try {
            await verifyTaskCompletionMutation.mutateAsync({
                completionId: completion.id,
                reviewerId: 'creator-1',
                reviewerName: 'Mission Creator'
            });
            // React Query will automatically refetch and update the UI
            console.log('Submission verified successfully!');
        } catch (error) {
            console.error('Error verifying submission:', error);
            alert('Error verifying submission');
        }
    };

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

    // Check if there are any flagged submissions that need attention
    const hasFlaggedSubmissions = missions.some(mission =>
        (mission as any).completions?.some((completion: TaskCompletionRecord) => completion.status === 'flagged')
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Mission Submissions</h1>
                    <p className="text-gray-600">Review and manage submissions for your missions</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Mission List */}
                    <div className="lg:col-span-1">
                        <Card className="p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Missions</h2>
                            <div className="space-y-3">
                                {missions.map((mission) => (
                                    <div
                                        key={mission.id}
                                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${selectedMission?.id === mission.id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        onClick={() => {
                                            setSelectedMission(mission);
                                        }}
                                    >
                                        <h3 className="font-medium text-gray-900 mb-1">{mission.title}</h3>
                                        <p className="text-sm text-gray-600 mb-2">{mission.description}</p>
                                        <div className="flex items-center justify-between">
                                            <Badge className="bg-green-100 text-green-800">{mission.status}</Badge>
                                            <span className="text-xs text-gray-500">
                                                {mission.createdAt.toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* Submissions */}
                    <div className="lg:col-span-2">
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {selectedMission ? `Submissions for "${selectedMission.title}"` : 'Select a Mission'}
                                </h2>
                                {selectedMission && (
                                    <Button
                                        onClick={() => window.location.reload()}
                                        className="bg-blue-500 hover:bg-blue-600 text-white"
                                    >
                                        Refresh
                                    </Button>
                                )}
                            </div>

                            {selectedMission ? (
                                <div className="space-y-4">
                                    {loadingSubmissions ? (
                                        <div className="text-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                                            <p className="text-gray-600">Loading submissions...</p>
                                        </div>
                                    ) : submissions.length === 0 ? (
                                        <div className="text-center py-8">
                                            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-600">No submissions yet for this mission</p>
                                        </div>
                                    ) : (
                                        submissions.map((submission) => (
                                            <div key={submission.id} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        {getStatusIcon(submission.status)}
                                                        <div>
                                                            <h3 className="font-medium text-gray-900">{submission.userName}</h3>
                                                            <p className="text-sm text-gray-600">Task: {submission.taskId}</p>
                                                        </div>
                                                    </div>
                                                    {getStatusBadge(submission.status)}
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                                                    <div>
                                                        <span className="text-gray-500">Completed:</span>
                                                        <span className="ml-2 text-gray-900">
                                                            {submission.completedAt.toLocaleString()}
                                                        </span>
                                                    </div>
                                                    {submission.verifiedAt && (
                                                        <div>
                                                            <span className="text-gray-500">Verified:</span>
                                                            <span className="ml-2 text-gray-900">
                                                                {submission.verifiedAt.toLocaleString()}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {submission.flaggedAt && (
                                                        <div>
                                                            <span className="text-gray-500">Flagged:</span>
                                                            <span className="ml-2 text-gray-900">
                                                                {submission.flaggedAt.toLocaleString()}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {submission.flaggedReason && (
                                                    <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                        <p className="text-sm text-red-800">
                                                            <strong>Flagged Reason:</strong> {submission.flaggedReason}
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="flex gap-2">
                                                    {submission.status === 'verified' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-red-600 border-red-300 hover:bg-red-50"
                                                            onClick={() => setShowFlagModal({ completion: submission, show: true })}
                                                        >
                                                            <Flag className="w-3 h-3 mr-1" />
                                                            Flag
                                                        </Button>
                                                    )}
                                                    {submission.status === 'flagged' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-green-600 border-green-300 hover:bg-green-50 animate-pulse"
                                                            onClick={() => handleVerifySubmission(submission)}
                                                            title="Resubmission available - Click to verify"
                                                        >
                                                            <CheckCircle className="w-3 h-3 mr-1" />
                                                            Verify
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">Select a mission to view submissions</p>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </div>

            {/* Flag Modal */}
            {showFlagModal.show && showFlagModal.completion && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Flag Submission</h3>
                        <p className="text-gray-600 mb-4">
                            Why are you flagging this submission from {showFlagModal.completion.userName}?
                        </p>

                        <div className="space-y-2 mb-6">
                            {getFlaggingReasons().map((reason) => (
                                <button
                                    key={reason.id}
                                    onClick={() => handleFlagSubmission(showFlagModal.completion!, reason.label)}
                                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    {reason.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setShowFlagModal({ completion: null, show: false })}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
