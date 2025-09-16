'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, ExternalLink, Heart, Repeat2, MessageCircle, Quote, UserPlus, Clock, User, Flag, AlertTriangle, Bot, UserX, Shield } from 'lucide-react';

interface TaskCompletion {
    taskId: string;
    completed: boolean;
    completedAt?: Date;
    userId: string;
    userName: string;
    status: 'pending' | 'verified' | 'flagged' | 'rejected';
    flaggedReason?: string;
    flaggedAt?: Date;
    verifiedAt?: Date;
}

interface Mission {
    id: string;
    title: string;
    description: string;
    tweetUrl: string;
    username: string;
    creator: string;
    createdAt: Date;
    tasks: {
        id: string;
        name: string;
        description: string;
        icon: React.ReactNode;
        completed: boolean;
        intentCompleted: boolean;
    }[];
    completions: TaskCompletion[];
}

const SAMPLE_MISSION: Mission = {
    id: 'demo-mission-1',
    title: 'Engage with Our Latest Product Launch Tweet',
    description: 'Help us spread the word about our new AI-powered platform!',
    tweetUrl: 'https://twitter.com/ensei_platform/status/1234567890',
    username: 'ensei_platform',
    creator: 'Ensei Team',
    createdAt: new Date(),
    tasks: [
        {
            id: 'like',
            name: 'Like Tweet',
            description: 'Show your support by liking the tweet',
            icon: <Heart className="w-4 h-4" />,
            completed: false,
            intentCompleted: false
        },
        {
            id: 'retweet',
            name: 'Retweet',
            description: 'Share the tweet with your followers',
            icon: <Repeat2 className="w-4 h-4" />,
            completed: false,
            intentCompleted: false
        },
        {
            id: 'comment',
            name: 'Comment',
            description: 'Leave a thoughtful comment',
            icon: <MessageCircle className="w-4 h-4" />,
            completed: false,
            intentCompleted: false
        },
        {
            id: 'quote',
            name: 'Quote Tweet',
            description: 'Share with your own thoughts',
            icon: <Quote className="w-4 h-4" />,
            completed: false,
            intentCompleted: false
        },
        {
            id: 'follow',
            name: 'Follow',
            description: 'Follow our account for updates',
            icon: <UserPlus className="w-4 h-4" />,
            completed: false,
            intentCompleted: false
        }
    ],
    completions: []
};

const FLAGGING_REASONS = [
    { id: 'incomplete', label: 'User didn\'t complete the task', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'bot', label: 'User appears to be a bot', icon: <Bot className="w-4 h-4" /> },
    { id: 'low_value', label: 'Low value account', icon: <UserX className="w-4 h-4" /> },
    { id: 'spam', label: 'Spam or inappropriate content', icon: <Shield className="w-4 h-4" /> },
    { id: 'duplicate', label: 'Duplicate submission', icon: <Flag className="w-4 h-4" /> },
    { id: 'fake', label: 'Fake or manipulated proof', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'other', label: 'Other reason', icon: <Flag className="w-4 h-4" /> }
];

export default function TaskVerificationDemo() {
    const [mission, setMission] = useState<Mission>(SAMPLE_MISSION);
    const [currentUser] = useState({ id: 'user-123', name: 'Demo User' });
    const [viewMode, setViewMode] = useState<'participant' | 'creator'>('participant');
    const [simulatedCompletions, setSimulatedCompletions] = useState<TaskCompletion[]>([]);
    const [showFlagModal, setShowFlagModal] = useState<{ completion: TaskCompletion | null, show: boolean }>({ completion: null, show: false });

    const completedTasks = mission.tasks.filter(task => task.completed).length;
    const totalTasks = mission.tasks.length;
    const completionPercentage = (completedTasks / totalTasks) * 100;

    const handleTaskAction = (taskId: string, action: 'intent' | 'verify') => {
        if (action === 'intent') {
            const task = mission.tasks.find(t => t.id === taskId);
            if (task && !task.intentCompleted) {
                setMission(prev => ({
                    ...prev,
                    tasks: prev.tasks.map(t =>
                        t.id === taskId ? { ...t, intentCompleted: true } : t
                    )
                }));

                alert(`Opening Twitter to ${task.name.toLowerCase()}. Complete the action and return to verify.`);
            }
        } else if (action === 'verify') {
            const task = mission.tasks.find(t => t.id === taskId);
            if (task && !task.completed && task.intentCompleted) {
                const completion: TaskCompletion = {
                    taskId,
                    completed: true,
                    completedAt: new Date(),
                    userId: currentUser.id,
                    userName: currentUser.name,
                    status: 'verified'
                };

                setMission(prev => ({
                    ...prev,
                    tasks: prev.tasks.map(t =>
                        t.id === taskId ? { ...t, completed: true } : t
                    ),
                    completions: [...prev.completions, completion]
                }));

                setSimulatedCompletions(prev => [...prev, completion]);

                alert(`✅ ${task.name} completed successfully!`);
            } else if (task && !task.intentCompleted) {
                alert(`Please complete the Twitter action first by clicking "${task.name} on Twitter"`);
            }
        }
    };

    const resetDemo = () => {
        setMission(SAMPLE_MISSION);
        setSimulatedCompletions([]);
        setShowFlagModal({ completion: null, show: false });
    };

    const handleFlagSubmission = (completion: TaskCompletion, reason: string) => {
        const flaggedCompletion = {
            ...completion,
            status: 'flagged' as const,
            flaggedReason: reason,
            flaggedAt: new Date()
        };

        setMission(prev => ({
            ...prev,
            completions: prev.completions.map(c =>
                c.taskId === completion.taskId && c.userId === completion.userId
                    ? flaggedCompletion
                    : c
            )
        }));

        setSimulatedCompletions(prev =>
            prev.map(c =>
                c.taskId === completion.taskId && c.userId === completion.userId
                    ? flaggedCompletion
                    : c
            )
        );

        setShowFlagModal({ completion: null, show: false });
        alert(`Submission flagged: ${reason}`);
    };

    const handleVerifySubmission = (completion: TaskCompletion) => {
        const verifiedCompletion = {
            ...completion,
            status: 'verified' as const,
            verifiedAt: new Date()
        };

        setMission(prev => ({
            ...prev,
            completions: prev.completions.map(c =>
                c.taskId === completion.taskId && c.userId === completion.userId
                    ? verifiedCompletion
                    : c
            )
        }));

        setSimulatedCompletions(prev =>
            prev.map(c =>
                c.taskId === completion.taskId && c.userId === completion.userId
                    ? verifiedCompletion
                    : c
            )
        );

        alert(`Submission verified successfully!`);
    };

    const getTaskButtonStyle = (task: any, action: string) => {
        if (task.completed) {
            return "bg-green-500 hover:bg-green-600 text-white";
        }
        if (action === 'intent') {
            if (task.intentCompleted) {
                return "bg-yellow-500 hover:bg-yellow-600 text-white";
            }
            return "bg-blue-500 hover:bg-blue-600 text-white";
        }
        if (action === 'verify') {
            if (task.intentCompleted && !task.completed) {
                return "bg-green-500 hover:bg-green-600 text-white";
            }
            return "bg-gray-300 text-gray-500 cursor-not-allowed";
        }
        return "bg-gray-500 hover:bg-gray-600 text-white";
    };

    const getTaskIcon = (task: any) => {
        if (task.completed) {
            return <CheckCircle className="w-4 h-4 text-green-500" />;
        }
        return task.icon;
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Task Verification & Completion Demo
                    </h1>
                    <p className="text-xl text-gray-600 mb-6">
                        Experience the complete task verification flow from participant to creator view
                    </p>

                    {/* View Mode Toggle */}
                    <div className="flex justify-center gap-4 mb-6">
                        <Button
                            variant={viewMode === 'participant' ? 'default' : 'outline'}
                            onClick={() => setViewMode('participant')}
                        >
                            <User className="w-4 h-4 mr-2" />
                            Participant View
                        </Button>
                        <Button
                            variant={viewMode === 'creator' ? 'default' : 'outline'}
                            onClick={() => setViewMode('creator')}
                        >
                            <User className="w-4 h-4 mr-2" />
                            Creator View
                        </Button>
                        <Button variant="outline" onClick={resetDemo}>
                            Reset Demo
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Mission Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-gray-900">
                                {getTaskIcon({ completed: completionPercentage === 100 })}
                                {mission.title}
                            </CardTitle>
                            <CardDescription className="text-gray-700">{mission.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Progress Bar */}
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium">Mission Progress</span>
                                    <span className="text-sm text-gray-500">
                                        {completedTasks}/{totalTasks} tasks completed
                                    </span>
                                </div>
                                <Progress value={completionPercentage} className="h-2" />
                                <div className="text-center mt-2">
                                    <Badge variant={completionPercentage === 100 ? 'default' : 'secondary'}>
                                        {completionPercentage === 100 ? 'Mission Complete!' : `${Math.round(completionPercentage)}% Complete`}
                                    </Badge>
                                </div>
                            </div>

                            {/* Mission Details */}
                            <div className="space-y-2 mb-6">
                                <div className="flex items-center gap-2 text-sm text-gray-800">
                                    <ExternalLink className="w-4 h-4" />
                                    <span>@{mission.username}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-800">
                                    <User className="w-4 h-4" />
                                    <span>Created by {mission.creator}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-800">
                                    <Clock className="w-4 h-4" />
                                    <span>Created {mission.createdAt.toLocaleDateString()}</span>
                                </div>
                            </div>

                            {/* Tasks */}
                            <div className="space-y-3">
                                <h3 className="font-semibold">Tasks</h3>
                                {mission.tasks.map((task) => (
                                    <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            {getTaskIcon(task)}
                                            <div>
                                                <div className="font-medium">{task.name}</div>
                                                <div className="text-sm text-gray-500">{task.description}</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {!task.completed ? (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        className={getTaskButtonStyle(task, 'intent')}
                                                        onClick={() => handleTaskAction(task.id, 'intent')}
                                                    >
                                                        <ExternalLink className="w-3 h-3 mr-1" />
                                                        {task.name} on Twitter
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleTaskAction(task.id, 'verify')}
                                                    >
                                                        Verify {task.name}
                                                    </Button>
                                                </>
                                            ) : (
                                                <Badge className="bg-green-500 text-white">
                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                    Completed
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Creator View / Submission Log */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Mission Analytics</CardTitle>
                            <CardDescription>
                                {viewMode === 'creator'
                                    ? 'View all task completions and participant activity'
                                    : 'See your submission history'
                                }
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Statistics */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">{mission.completions.length}</div>
                                    <div className="text-sm text-blue-600">Total Completions</div>
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">{completionPercentage.toFixed(0)}%</div>
                                    <div className="text-sm text-green-600">Completion Rate</div>
                                </div>
                            </div>

                            {/* Submission Log */}
                            <div className="space-y-3">
                                <h3 className="font-semibold">Recent Completions</h3>
                                {mission.completions.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        <p>No completions yet</p>
                                        <p className="text-sm">Complete tasks to see them here</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {mission.completions
                                            .sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0))
                                            .map((completion, index) => {
                                                const task = mission.tasks.find(t => t.id === completion.taskId);
                                                const getStatusColor = (status: string) => {
                                                    switch (status) {
                                                        case 'verified': return 'bg-green-50 border-green-200';
                                                        case 'flagged': return 'bg-red-50 border-red-200';
                                                        case 'pending': return 'bg-yellow-50 border-yellow-200';
                                                        default: return 'bg-gray-50 border-gray-200';
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

                                                return (
                                                    <div key={index} className={`flex items-center justify-between p-3 border rounded-lg ${getStatusColor(completion.status)}`}>
                                                        <div className="flex items-center gap-3">
                                                            {getStatusIcon(completion.status)}
                                                            <div>
                                                                <div className="font-medium">{task?.name}</div>
                                                                <div className="text-sm text-gray-500">
                                                                    by {completion.userName} • {completion.completedAt?.toLocaleTimeString()}
                                                                </div>
                                                                {completion.flaggedReason && (
                                                                    <div className="text-sm text-red-600 mt-1">
                                                                        <strong>Flagged:</strong> {completion.flaggedReason}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {getStatusBadge(completion.status)}
                              {viewMode === 'creator' && completion.status === 'verified' && (
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 border-red-300 hover:bg-red-50"
                                    onClick={() => setShowFlagModal({ completion, show: true })}
                                  >
                                    <Flag className="w-3 h-3 mr-1" />
                                    Flag
                                  </Button>
                                </div>
                              )}
                              {viewMode === 'creator' && completion.status === 'flagged' && (
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-green-600 border-green-300 hover:bg-green-50"
                                    onClick={() => handleVerifySubmission(completion)}
                                  >
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Verify
                                  </Button>
                                </div>
                              )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                )}
                            </div>

              {/* Instructions */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2 text-gray-900">How It Works:</h4>
                <ol className="text-sm space-y-1 text-gray-700">
                  <li>1. Click "Like on Twitter" to open Twitter intent</li>
                  <li>2. Complete the action on Twitter</li>
                  <li>3. Return and click "Verify Like"</li>
                  <li>4. Task is automatically verified and turns green</li>
                  <li>5. Creator can flag to remove verification or verify to restore</li>
                </ol>
              </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Implementation Notes */}
                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle className="text-gray-900">Implementation Plan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-semibold mb-3 text-gray-900">Data Structure Changes</h4>
                                <ul className="text-sm space-y-1 text-gray-700">
                                    <li>• Add task completion tracking to mission data</li>
                                    <li>• Implement submission logging system</li>
                                    <li>• Create verification status management</li>
                                    <li>• Add completion timestamps and user tracking</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-3 text-gray-900">UI/UX Enhancements</h4>
                                <ul className="text-sm space-y-1 text-gray-700">
                                    <li>• Green button states for completed tasks</li>
                                    <li>• Progress indicators for mission completion</li>
                                    <li>• Submission history display</li>
                                    <li>• Creator dashboard for mission analytics</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Flagging Modal */}
                {showFlagModal.show && showFlagModal.completion && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-lg font-semibold mb-4 text-gray-900">Flag Submission</h3>
                            <p className="text-sm text-gray-700 mb-4">
                                Flagging: <strong className="text-gray-900">{mission.tasks.find(t => t.id === showFlagModal.completion?.taskId)?.name}</strong> by {showFlagModal.completion.userName}
                            </p>

                            <div className="space-y-2 mb-6">
                                {FLAGGING_REASONS.map((reason) => (
                                    <button
                                        key={reason.id}
                                        onClick={() => handleFlagSubmission(showFlagModal.completion!, reason.label)}
                                        className="w-full flex items-center gap-3 p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors text-gray-900"
                                    >
                                        {reason.icon}
                                        <span className="text-sm text-gray-700">{reason.label}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-2">
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
        </div>
    );
}