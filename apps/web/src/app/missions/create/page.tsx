'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApi } from '../../../hooks/useApi';
import { ModernLayout } from '../../../components/layout/ModernLayout';
import { MissionWizard } from '../../../features/mission-wizard/wizard';

export default function CreateMissionPage() {
    const { createMission, loading, error } = useApi();
    const [success, setSuccess] = useState(false);
    const [createdMissionId, setCreatedMissionId] = useState<string | null>(null);
    const searchParams = useSearchParams();

    // Clear wizard state on page load to ensure fresh start
    // But preserve URL params for prefill functionality
    useEffect(() => {
        // Read URL params first (for prefill)
        const packId = searchParams.get('packId');
        const type = searchParams.get('type');
        
        // Clear sessionStorage wizard state (but preserve other app state)
        sessionStorage.removeItem('mission-wizard-state');
        sessionStorage.removeItem('mission-wizard-step');
        sessionStorage.removeItem('mission-wizard-tab-token');
        
        // Telemetry: Log wizard reset
        console.log('=== WIZARD RESET TELEMETRY ===');
        console.log('Event: create_wizard_reset');
        console.log('Reason: page_load');
        console.log('URL params:', { packId, type });
        console.log('Timestamp:', new Date().toISOString());
        console.log('=============================');
        
        // Also clear on page unload (when user navigates away)
        const handleBeforeUnload = () => {
            sessionStorage.removeItem('mission-wizard-state');
            sessionStorage.removeItem('mission-wizard-step');
            sessionStorage.removeItem('mission-wizard-tab-token');
        };
        
        window.addEventListener('beforeunload', handleBeforeUnload);
        
        // Cleanup
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [searchParams]);

    const handleWizardSubmit = async (missionData: any) => {
        try {
            const result = await createMission(missionData);
            console.log('Mission created successfully:', result);

            // Clear wizard state on successful creation
            sessionStorage.removeItem('mission-wizard-state');
            sessionStorage.removeItem('mission-wizard-step');
            sessionStorage.removeItem('mission-wizard-tab-token');

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
                            <button onClick={() => (window.location.href = '/missions')} className="btn-primary">View All Missions</button>
                            <button onClick={() => (window.location.href = '/missions/my')} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200">My Missions</button>
                        </div>
                    </div>
                </div>
            </ModernLayout>
        );
    }

    return (
        <ModernLayout currentPage="/missions/create">
            <MissionWizard
                onSubmit={handleWizardSubmit}
                isLoading={loading}
                error={error}
            />
        </ModernLayout>
    );
}
