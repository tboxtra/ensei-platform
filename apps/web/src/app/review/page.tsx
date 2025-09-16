'use client';

import ReviewQueue from '../../components/reviews/ReviewQueue';
import { ModernLayout } from '../../components/layout/ModernLayout';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';

export default function ReviewPage() {
  return (
    <ProtectedRoute>
      <ModernLayout currentPage="/review">
        <div className="container mx-auto px-2 py-2">
          <div className="text-left mb-2">
            <h1 className="text-lg font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent mb-1">Review & Earn</h1>
            <p className="text-gray-400 text-xs">Review mission submissions and earn honors for your feedback</p>
          </div>
        </div>
        <ReviewQueue />
      </ModernLayout>
    </ProtectedRoute>
  );
}
