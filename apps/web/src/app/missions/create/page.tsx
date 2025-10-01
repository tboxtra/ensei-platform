'use client';

import { useState } from 'react';
import { useApi } from '../../../hooks/useApi';
import { ModernLayout } from '../../../components/layout/ModernLayout';
import { MissionWizard } from '../../../features/mission-wizard/wizard';

export default function CreateMissionPage() {
    const { createMission, loading, error } = useApi();
    const [success, setSuccess] = useState(false);
    const [createdMissionId, setCreatedMissionId] = useState<string | null>(null);

    const handleWizardSubmit = async (missionData: any) => {
        try {
            const result = await createMission(missionData);
            console.log('Mission created successfully:', result);

            // Clear wizard state on successful creation
            localStorage.removeItem('mission-wizard-state');
            localStorage.removeItem('mission-wizard-step');

            // Set success state
            setSuccess(true);
            setCreatedMissionId(result.id);

            // Redirect to Discover & Earn page after 2 seconds
            setTimeout(() => {
                window.location.href = '/missions';
            }, 2000);

        } catch (err) {
            console.error('Mission creation failed:', err);
        }
    };

    if (success) {
        return (
            <ModernLayout currentPage="/missions/create">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="text-center">
                        <div className="text-6xl mb-6">🎉</div>
                        <h1 className="text-3xl font-bold text-green-400 mb-4">Mission Created Successfully!</h1>
                        <p className="text-gray-300 mb-6">
                            Your mission has been created and is now live. You'll be redirected to Discover & Earn in a few seconds.
                        </p>
                        {createdMissionId && (
                            <p className="text-sm text-gray-400 mb-6">
                                Mission ID: {createdMissionId}
                            </p>
                        )}
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={() => window.location.href = '/missions'}
                                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                            >
                                View All Missions
                            </button>
                            <button
                                onClick={() => window.location.href = '/missions/my'}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                            >
                                My Missions
                            </button>
                        </div>
                    </div>
                </div>
            </ModernLayout>
        );
    }

    return (
        <ModernLayout currentPage="/missions/create">
            <div className="max-w-4xl mx-auto px-4 py-4">
                {/* V1 Notice - Small and subtle */}
                <div className="text-center mb-4">
                    <span className="text-xs text-gray-500 bg-gray-800/50 px-2 py-1 rounded-full">
                        V1: Twitter engage missions only
                    </span>
                </div>

                <MissionWizard
                    onSubmit={handleWizardSubmit}
                    isLoading={loading}
                    error={error}
                />
            </div>
        </ModernLayout>
    );
}
