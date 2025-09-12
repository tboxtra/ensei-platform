'use client';

import React, { useState, useEffect } from 'react';
import { StarIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface ReviewAssignment {
    id: string;
    missionId: string;
    submissionId: string;
    reviewerUserId: string;
    status: 'pending' | 'completed' | 'expired';
    createdAt: string;
    mission: {
        id: string;
        title: string;
        platform: string;
        type: string;
    };
    submission: {
        id: string;
        userId: string;
        proofs: string[];
        submittedAt: string;
    };
}

interface ReviewVote {
    assignmentId: string;
    rating: 1 | 2 | 3 | 4 | 5;
    commentLink: string;
}

export default function ReviewQueue() {
    const [assignments, setAssignments] = useState<ReviewAssignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAssignment, setSelectedAssignment] = useState<ReviewAssignment | null>(null);
    const [showVoteModal, setShowVoteModal] = useState(false);
    const [voteData, setVoteData] = useState<ReviewVote>({
        assignmentId: '',
        rating: 3,
        commentLink: '',
    });

    // Fetch review assignments from API
    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                setLoading(true);
                // TODO: Replace with actual API call when review system is implemented
                // const response = await fetch('/api/v1/reviews/assignments');
                // const data = await response.json();
                // setAssignments(data);

                // For now, show empty state since review system is not yet implemented
                setAssignments([]);
            } catch (error) {
                console.error('Failed to fetch review assignments:', error);
                setAssignments([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAssignments();
    }, []);

    const handleVote = async () => {
        try {
            // TODO: Implement API call when review system is ready
            console.log('Submitting vote:', voteData);

            // Update local state
            setAssignments(prev =>
                prev.map(assignment =>
                    assignment.id === voteData.assignmentId
                        ? { ...assignment, status: 'completed' as const }
                        : assignment
                )
            );

            setShowVoteModal(false);
            setSelectedAssignment(null);
            setVoteData({ assignmentId: '', rating: 3, commentLink: '' });

            // Show success message
            alert('Review submitted successfully!');
        } catch (error) {
            console.error('Error submitting vote:', error);
            alert('Error submitting review. Please try again.');
        }
    };

    const openVoteModal = (assignment: ReviewAssignment) => {
        setSelectedAssignment(assignment);
        setVoteData({ ...voteData, assignmentId: assignment.id });
        setShowVoteModal(true);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'expired':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <ClockIcon className="h-4 w-4" />;
            case 'completed':
                return <CheckCircleIcon className="h-4 w-4" />;
            case 'expired':
                return <XCircleIcon className="h-4 w-4" />;
            default:
                return <ClockIcon className="h-4 w-4" />;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Queue</h1>
                <p className="text-gray-600">
                    Review and rate mission submissions. Your feedback helps maintain quality standards.
                </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <ClockIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {assignments.filter(a => a.status === 'pending').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircleIcon className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Completed Today</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {assignments.filter(a => a.status === 'completed').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <StarIcon className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Reviews Completed</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {assignments.filter(a => a.status === 'completed').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <span className="text-2xl">💰</span>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Honors Earned</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {assignments.filter(a => a.status === 'completed').length * 150} Honors
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <ClockIcon className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Response Time</p>
                            <p className="text-2xl font-bold text-gray-900">2.4h</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Review Assignments */}
            <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Pending Reviews</h2>
                </div>

                <div className="divide-y divide-gray-200">
                    {assignments.filter(a => a.status === 'pending').map((assignment) => (
                        <div key={assignment.id} className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-3">
                                        <h3 className="text-lg font-medium text-gray-900">
                                            {assignment.mission.title}
                                        </h3>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                                            {getStatusIcon(assignment.status)}
                                            <span className="ml-1 capitalize">{assignment.status}</span>
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                                        <div>
                                            <span className="font-medium">Platform:</span> {assignment.mission.platform}
                                        </div>
                                        <div>
                                            <span className="font-medium">Type:</span> {assignment.mission.type}
                                        </div>
                                        <div>
                                            <span className="font-medium">Submitted:</span> {new Date(assignment.submission.submittedAt).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <h4 className="font-medium text-gray-900 mb-2">Proofs Submitted:</h4>
                                        <div className="space-y-2">
                                            {assignment.submission.proofs.map((proof, index) => (
                                                <div key={index} className="flex items-center space-x-2">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                    <a
                                                        href={proof}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-800 underline"
                                                    >
                                                        {proof}
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>Assignment created: {new Date(assignment.createdAt).toLocaleString()}</span>
                                        <span className="text-green-600 font-medium">Reward: 150 Honors</span>
                                    </div>
                                </div>

                                <div className="ml-6">
                                    <button
                                        onClick={() => openVoteModal(assignment)}
                                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        Review & Rate
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {assignments.filter(a => a.status === 'pending').length === 0 && (
                        <div className="p-12 text-center">
                            <div className="mx-auto h-12 w-12 text-gray-400">
                                <CheckCircleIcon className="h-12 w-12" />
                            </div>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No pending reviews</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                All review assignments have been completed. Check back later for new submissions.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Vote Modal */}
            {showVoteModal && selectedAssignment && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Rate Submission
                            </h3>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Rating (1-5 stars)
                                </label>
                                <div className="flex space-x-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setVoteData({ ...voteData, rating: star as 1 | 2 | 3 | 4 | 5 })}
                                            className={`p-1 rounded ${voteData.rating >= star
                                                ? 'text-yellow-400 hover:text-yellow-500'
                                                : 'text-gray-300 hover:text-gray-400'
                                                }`}
                                        >
                                            <StarIcon className="h-6 w-6 fill-current" />
                                        </button>
                                    ))}
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                    {voteData.rating === 1 && 'Poor quality'}
                                    {voteData.rating === 2 && 'Below average'}
                                    {voteData.rating === 3 && 'Average'}
                                    {voteData.rating === 4 && 'Good quality'}
                                    {voteData.rating === 5 && 'Excellent quality'}
                                </p>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Comment Link (URL to your review comment)
                                </label>
                                <input
                                    type="url"
                                    value={voteData.commentLink}
                                    onChange={(e) => setVoteData({ ...voteData, commentLink: e.target.value })}
                                    placeholder="https://twitter.com/your-comment"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowVoteModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleVote}
                                    disabled={!voteData.commentLink}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Submit Review
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
