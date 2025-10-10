'use client';

import React from 'react';
import { WizardState } from '../types/wizard.types';

interface PaymentStepProps {
    state: WizardState;
    updateState: (updates: Partial<WizardState>) => void;
    onSubmit: () => void;
    isLoading?: boolean;
}

export const PaymentStep: React.FC<PaymentStepProps> = ({
    state,
    updateState,
    onSubmit,
    isLoading = false,
}) => {
    const handlePaymentSelect = (paymentType: 'single-use' | 'pack') => {
        updateState({ paymentType });
    };

    const handlePackSelect = (packId: string) => {
        updateState({ packId });
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-xl font-semibold mb-1">Payment Options</h2>
                <p className="text-gray-400 text-sm">Choose how you want to pay for this mission</p>
            </div>

            {/* Payment Type Selection */}
            <div>
                <label className="block text-xs font-medium mb-3">Payment Method</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={() => handlePaymentSelect('single-use')}
                        className={`p-6 rounded-xl text-left transition ${
                            state.paymentType === 'single-use'
                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50'
                        }`}
                    >
                        <div className="text-3xl mb-2">💳</div>
                        <div className="font-bold text-lg mb-1">Single Use</div>
                        <div className="text-sm opacity-90 mb-3">Pay once for this mission only</div>
                        <div className="text-sm">
                            • No recurring charges<br/>
                            • Pay per mission<br/>
                            • Full control
                        </div>
                    </button>

                    <button
                        onClick={() => handlePaymentSelect('pack')}
                        className={`p-6 rounded-xl text-left transition ${
                            state.paymentType === 'pack'
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50'
                        }`}
                    >
                        <div className="text-3xl mb-2">📦</div>
                        <div className="font-bold text-lg mb-1">Pack Purchase</div>
                        <div className="text-sm opacity-90 mb-3">Buy a pack for multiple missions</div>
                        <div className="text-sm">
                            • Better value<br/>
                            • Multiple missions<br/>
                            • Bulk pricing
                        </div>
                    </button>
                </div>
            </div>

            {/* Pack Selection (only for fixed missions with pack payment) */}
            {state.model === 'fixed' && state.paymentType === 'pack' && (
                <div>
                    <label className="block text-xs font-medium mb-3">Available Packs</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            { id: 'starter-pack', name: 'Starter Pack', price: 50, missions: 5, description: 'Perfect for testing' },
                            { id: 'growth-pack', name: 'Growth Pack', price: 200, missions: 25, description: 'Scale your campaigns' },
                            { id: 'enterprise-pack', name: 'Enterprise Pack', price: 500, missions: 100, description: 'Maximum reach' }
                        ].map((pack) => {
                            const isSelected = state.packId === pack.id;
                            return (
                                <button
                                    key={pack.id}
                                    onClick={() => handlePackSelect(pack.id)}
                                    className={`p-4 rounded-xl text-left transition ${
                                        isSelected
                                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                                            : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50'
                                    }`}
                                >
                                    <div className="font-semibold text-lg mb-1">{pack.name}</div>
                                    <div className="text-sm opacity-90 mb-2">{pack.description}</div>
                                    <div className="text-lg font-bold text-green-400">${pack.price}</div>
                                    <div className="text-xs opacity-75">{pack.missions} missions</div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Single Use Pricing Display */}
            {state.paymentType === 'single-use' && (
                <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/30">
                    <h3 className="font-semibold mb-2">Single Use Pricing</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span>Mission Type:</span>
                            <span className="font-semibold">{state.model === 'fixed' ? 'Fixed Mission' : 'Degen Mission'}</span>
                        </div>
                        {state.model === 'fixed' && (
                            <>
                                <div className="flex justify-between">
                                    <span>Participant Cap:</span>
                                    <span className="font-semibold">{state.cap} users</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Tasks Selected:</span>
                                    <span className="font-semibold">{state.tasks?.length || 0} tasks</span>
                                </div>
                            </>
                        )}
                        <div className="border-t border-gray-700/30 pt-2 mt-2">
                            <div className="flex justify-between text-lg font-bold">
                                <span>Total Cost:</span>
                                <span className="text-green-400">
                                    {state.model === 'fixed' 
                                        ? `$${((state.cap || 0) * (state.tasks?.length || 0) * 0.1).toFixed(2)}`
                                        : 'Variable (based on engagement)'
                                    }
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
                <button
                    onClick={onSubmit}
                    disabled={isLoading || !state.paymentType || (state.model === 'fixed' && state.paymentType === 'pack' && !state.packId)}
                    className={`px-8 py-3 rounded-lg font-semibold transition ${
                        isLoading || !state.paymentType || (state.model === 'fixed' && state.paymentType === 'pack' && !state.packId)
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg'
                    }`}
                >
                    {isLoading ? 'Creating Mission...' : 'Create Mission'}
                </button>
            </div>
        </div>
    );
};
