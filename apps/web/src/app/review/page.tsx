'use client';

import ReviewQueue from '../../components/reviews/ReviewQueue';
import { ModernLayout } from '../../components/layout/ModernLayout';

export default function ReviewPage() {
  return (
    <ModernLayout currentPage="/review">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Review & Earn</h1>
        <p className="text-gray-400 text-lg">
          Review mission submissions and earn honors for your feedback
        </p>
      </div>
      <ReviewQueue />
    </ModernLayout>
  );
}
