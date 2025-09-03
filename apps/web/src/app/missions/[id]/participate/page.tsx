'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApi } from '../../../../hooks/useApi';
import { ModernLayout } from '../../../../components/layout/ModernLayout';
import { ModernCard } from '../../../../components/ui/ModernCard';
import { ModernButton } from '../../../../components/ui/ModernButton';
import ProofUrlInput from '../../../../components/missions/ProofUrlInput';

export default function ParticipatePage() {
    const params = useParams();
    const router = useRouter();
    const missionId = params?.id as string;
    const { getMission, participateInMission, loading, error } = useApi();

    const [mission, setMission] = useState<any>(null);
    const [submissionLoading, setSubmissionLoading] = useState(false);
    const [formData, setFormData] = useState({
        submission: '',
        proofLinks: [''],
        additionalNotes: '',
        agreeToTerms: false
    });

    useEffect(() => {
        if (missionId) {
            loadMission();
        }
    }, [missionId]);

    const loadMission = async () => {
        try {
            const missionData = await getMission(missionId);
            setMission(missionData);
        } catch (err) {
            console.error('Error loading mission:', err);
        }
    };

    const handleInputChange = (field: string, value: string | boolean | string[]) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const validateForm = () => {
        if (!formData.submission.trim()) {
            alert('Please describe how you completed the mission');
            return false;
        }
        if (!formData.proofLinks[0]?.trim()) {
            alert('Please provide at least one proof link');
            return false;
        }
        if (!formData.agreeToTerms) {
            alert('Please agree to the terms and conditions');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setSubmissionLoading(true);
        try {
            await participateInMission(missionId, {
                submission: formData.submission,
                proofLinks: formData.proofLinks.filter(link => link.trim()),
                additionalNotes: formData.additionalNotes
            });

            alert('Participation submitted successfully! Your submission is being reviewed.');
            router.push(`/missions/${missionId}`);
        } catch (err) {
            alert('Error submitting participation. Please try again.');
        } finally {
            setSubmissionLoading(false);
        }
    };

    const getPlatformIcon = (platform: string) => {
        const icons: { [key: string]: string } = {
            twitter: '𝕏',
            instagram: '📸',
            tiktok: '🎵',
            facebook: '📘',
            whatsapp: '💬',
            snapchat: '👻',
            telegram: '📱'
        };
        return icons[platform] || '🌐';
    };

    const getMissionTypeIcon = (type: string) => {
        const icons: { [key: string]: string } = {
            engage: '🎯',
            content: '✍️',
            ambassador: '👑'
        };
        return icons[type] || '🎯';
    };

    if (loading) {
        return (
            <ModernLayout currentPage="/missions">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                        <p className="text-gray-400">Loading mission...</p>
                    </div>
                </div>
            </ModernLayout>
        );
    }

    if (error || !mission) {
        return (
            <ModernLayout currentPage="/missions">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="text-red-500 text-6xl mb-4">⚠️</div>
                        <p className="text-red-400 mb-2">Error loading mission</p>
                        <p className="text-gray-400 text-sm">{error || 'Mission not found'}</p>
                    </div>
                </div>
            </ModernLayout>
        );
    }

    return (
        <ModernLayout currentPage="/missions">
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <div className="mb-6">
                    <ModernButton
                        onClick={() => router.back()}
                        variant="secondary"
                        size="sm"
                    >
                        ← Back to Mission
                    </ModernButton>
                </div>

                {/* Mission Summary */}
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 mb-8">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="text-3xl">
                            {getPlatformIcon(mission.platform)}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">
                                {mission.title || `${mission.platform} ${mission.type} mission`}
                            </h2>
                            <div className="flex items-center space-x-3 text-gray-400 text-sm">
                                <span className="flex items-center">
                                    <span className="mr-2">{getMissionTypeIcon(mission.type)}</span>
                                    {mission.type}
                                </span>
                                <span>•</span>
                                <span className="capitalize">{mission.platform}</span>
                                <span>•</span>
                                <span className="text-green-400 font-semibold">
                                    {(mission.total_cost_honors || 0).toLocaleString()} Honors
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Participation Form */}
                <ModernCard title="Submit Your Participation" icon="📤" className="mb-8">
                    <div className="space-y-6">
                        {/* Mission Instructions */}
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                            <h3 className="font-semibold text-blue-400 mb-2">📋 Mission Requirements</h3>
                            <div className="space-y-2 text-sm text-gray-300">
                                {mission.tasks?.map((task: string, index: number) => (
                                    <div key={index} className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                        <span className="capitalize">{task.replace(/_/g, ' ')}</span>
                                    </div>
                                ))}
                            </div>
                            {mission.instructions && (
                                <div className="mt-3 pt-3 border-t border-blue-500/30">
                                    <p className="text-sm text-gray-300">{mission.instructions}</p>
                                </div>
                            )}
                        </div>

                        {/* Submission Form */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-white">
                                    How did you complete this mission? *
                                </label>
                                <textarea
                                    value={formData.submission}
                                    onChange={(e) => handleInputChange('submission', e.target.value)}
                                    rows={6}
                                    className="w-full p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                                    placeholder="Describe in detail how you completed the required tasks. Be specific about what you did, when you did it, and how it meets the mission requirements..."
                                />
                                <p className="text-xs text-gray-400 mt-2">
                                    Provide a clear, detailed description of how you completed the mission tasks.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-white">
                                    Proof Links *
                                </label>
                                <ProofUrlInput
                                    value={formData.proofLinks}
                                    onChange={(urls) => handleInputChange('proofLinks', urls)}
                                    proofRequirement={{
                                        mode: 'social-post',
                                        networks: mission?.platform === 'custom' ? undefined : [mission?.platform]
                                    }}
                                    className="text-white"
                                />
                                <p className="text-xs text-gray-400 mt-2">
                                    Provide direct links to your completed work (e.g., tweet, post, profile, etc.)
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-white">
                                    Additional Notes (Optional)
                                </label>
                                <textarea
                                    value={formData.additionalNotes}
                                    onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                                    rows={3}
                                    className="w-full p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                                    placeholder="Any additional context, screenshots, or information that might help verify your completion..."
                                />
                                <p className="text-xs text-gray-400 mt-2">
                                    Optional: Add any extra context or screenshots that support your submission.
                                </p>
                            </div>

                            {/* Terms and Conditions */}
                            <div className="bg-gray-800/30 rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                    <input
                                        type="checkbox"
                                        id="agreeToTerms"
                                        checked={formData.agreeToTerms}
                                        onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                                        className="mt-1 w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
                                    />
                                    <label htmlFor="agreeToTerms" className="text-sm text-gray-300">
                                        I confirm that I have completed this mission according to the requirements and agree to the{' '}
                                        <a href="/terms" className="text-green-400 hover:text-green-300 underline">
                                            terms and conditions
                                        </a>
                                        . I understand that false submissions may result in account suspension.
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <ModernButton
                                onClick={handleSubmit}
                                variant="success"
                                size="lg"
                                loading={submissionLoading}
                                className="w-full"
                                disabled={!formData.agreeToTerms}
                            >
                                {submissionLoading ? 'Submitting...' : 'Submit Participation'}
                            </ModernButton>
                        </div>
                    </div>
                </ModernCard>

                {/* Guidelines */}
                <ModernCard title="Submission Guidelines" icon="📖">
                    <div className="space-y-4 text-sm text-gray-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-semibold text-green-400 mb-2">✅ Do's</h4>
                                <ul className="space-y-1">
                                    <li>• Complete all required tasks thoroughly</li>
                                    <li>• Provide clear, accessible proof links</li>
                                    <li>• Be honest about your completion</li>
                                    <li>• Follow platform guidelines</li>
                                    <li>• Submit within the mission timeframe</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-red-400 mb-2">❌ Don'ts</h4>
                                <ul className="space-y-1">
                                    <li>• Submit incomplete or fake work</li>
                                    <li>• Use private or inaccessible links</li>
                                    <li>• Violate platform terms of service</li>
                                    <li>• Submit after the deadline</li>
                                    <li>• Provide misleading information</li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                            <h4 className="font-semibold text-yellow-400 mb-2">⚠️ Important Notes</h4>
                            <ul className="space-y-1 text-sm">
                                <li>• Submissions are reviewed within 24-48 hours</li>
                                <li>• Rewards are distributed after verification</li>
                                <li>• You may be asked for additional proof if needed</li>
                                <li>• Keep your proof links accessible until verification is complete</li>
                            </ul>
                        </div>
                    </div>
                </ModernCard>
            </div>
        </ModernLayout>
    );
}
