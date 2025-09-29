'use client';

import { useApi } from '../../../hooks/useApi';
import { ModernLayout } from '../../../components/layout/ModernLayout';
import { MissionWizard } from '../../../features/mission-wizard/wizard';

export default function CreateMissionPage() {
    const { createMission, loading, error } = useApi();

    const handleWizardSubmit = async (missionData: any) => {
        try {
            await createMission(missionData);
            // Clear wizard state on successful creation
            localStorage.removeItem('mission-wizard-state');
            localStorage.removeItem('mission-wizard-step');
        } catch (err) {
            console.error('Mission creation failed:', err);
        }
    };

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
