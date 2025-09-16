'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, ExternalLink, Heart, Repeat2, MessageCircle, Quote, UserPlus, Clock, User } from 'lucide-react';

interface TaskCompletion {
    taskId: string;
    completed: boolean;
    completedAt?: Date;
    userId: string;
    userName: string;
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
            completed: false
        },
        {
            id: 'retweet',
            name: 'Retweet',
            description: 'Share the tweet with your followers',
            icon: <Repeat2 className="w-4 h-4" />,
            completed: false
        },
        {
            id: 'comment',
            name: 'Comment',
            description: 'Leave a thoughtful comment',
            icon: <MessageCircle className="w-4 h-4" />,
            completed: false
        },
        {
            id: 'quote',
            name: 'Quote Tweet',
            description: 'Share with your own thoughts',
            icon: <Quote className="w-4 h-4" />,
            completed: false
        },
        {
            id: 'follow',
            name: 'Follow',
            description: 'Follow our account for updates',
            icon: <UserPlus className="w-4 h-4" />,
            completed: false
        }
    ],
    completions: []
};

export default function TaskVerificationDemo() {
    const [mission, setMission] = useState<Mission>(SAMPLE_MISSION);
    const [currentUser] = useState({ id: 'user-123', name: 'Demo User' });
    const [viewMode, setViewMode] = useState<'participant' | 'creator'>('participant');
    const [simulatedCompletions, setSimulatedCompletions] = useState<TaskCompletion[]>([]);

    const completedTasks = mission.tasks.filter(task => task.completed).length;
    const totalTasks = mission.tasks.length;
    const completionPercentage = (completedTasks / totalTasks) * 100;

    const handleTaskAction = (taskId: string, action: 'intent' | 'verify') => {
        if (action === 'intent') {
            // Simulate opening Twitter intent
            alert(`Opening Twitter to ${mission.tasks.find(t => t.id === taskId)?.name.toLowerCase()}. Complete the action and return to verify.`);
        } else if (action === 'verify') {
            // Simulate task completion
            const task = mission.tasks.find(t => t.id === taskId);
            if (task && !task.completed) {
                const completion: TaskCompletion = {
                    taskId,
                    completed: true,
                    completedAt: new Date(),
                    userId: currentUser.id,
                    userName: currentUser.name
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
            }
        }
    };

    const resetDemo = () => {
        setMission(SAMPLE_MISSION);
        setSimulatedCompletions([]);
    };

    const getTaskButtonStyle = (task: any, action: string) => {
        if (task.completed) {
            return "bg-green-500 hover:bg-green-600 text-white";
        }
        if (action === 'intent') {
            return "bg-blue-500 hover:bg-blue-600 text-white";
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
                            <CardTitle className="flex items-center gap-2">
                                {getTaskIcon({ completed: completionPercentage === 100 })}
                                {mission.title}
                            </CardTitle>
                            <CardDescription>{mission.description}</CardDescription>
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
                                <div className="flex items-center gap-2 text-sm">
                                    <ExternalLink className="w-4 h-4" />
                                    <span>@{mission.username}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <User className="w-4 h-4" />
                                    <span>Created by {mission.creator}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
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
                                                return (
                                                    <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                                        <div className="flex items-center gap-3">
                                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                                            <div>
                                                                <div className="font-medium">{task?.name}</div>
                                                                <div className="text-sm text-gray-500">
                                                                    by {completion.userName} • {completion.completedAt?.toLocaleTimeString()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                                                            Verified
                                                        </Badge>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                )}
                            </div>

                            {/* Instructions */}
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-semibold mb-2">How It Works:</h4>
                                <ol className="text-sm space-y-1 text-gray-600">
                                    <li>1. Click "Like on Twitter" to open Twitter intent</li>
                                    <li>2. Complete the action on Twitter</li>
                                    <li>3. Return and click "Verify Like"</li>
                                    <li>4. Task turns green and gets logged</li>
                                    <li>5. Creator sees completion in analytics</li>
                                </ol>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Implementation Notes */}
                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>Implementation Plan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-semibold mb-3">Data Structure Changes</h4>
                                <ul className="text-sm space-y-1 text-gray-600">
                                    <li>• Add task completion tracking to mission data</li>
                                    <li>• Implement submission logging system</li>
                                    <li>• Create verification status management</li>
                                    <li>• Add completion timestamps and user tracking</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-3">UI/UX Enhancements</h4>
                                <ul className="text-sm space-y-1 text-gray-600">
                                    <li>• Green button states for completed tasks</li>
                                    <li>• Progress indicators for mission completion</li>
                                    <li>• Submission history display</li>
                                    <li>• Creator dashboard for mission analytics</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
