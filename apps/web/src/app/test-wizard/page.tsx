'use client';

import React from 'react';
import { MissionWizard } from '../../features/mission-wizard/MissionWizard';

export default function TestWizardPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
            <MissionWizard />
        </div>
    );
}
