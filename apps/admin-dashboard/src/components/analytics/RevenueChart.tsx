'use client';

import React from 'react';

interface RevenueData {
  daily: Array<{ date: string; revenue: number }>;
  monthly: Array<{ month: string; revenue: number }>;
}

interface RevenueChartProps {
  data: RevenueData;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const [chartType, setChartType] = React.useState<'daily' | 'monthly'>('daily');
  
  const chartData = chartType === 'daily' ? data.daily : data.monthly;
  const maxValue = Math.max(...chartData.map(d => d.revenue));
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (chartType === 'daily') {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return dateString;
  };

  const getItemDate = (item: { date?: string; month?: string }) => {
    return chartType === 'daily' ? item.date! : item.month!;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Revenue Trends</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setChartType('daily')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              chartType === 'daily'
                ? 'bg-indigo-100 text-indigo-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setChartType('monthly')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              chartType === 'monthly'
                ? 'bg-indigo-100 text-indigo-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      <div className="h-64 flex items-end space-x-1">
        {chartData.map((item, index) => {
          const height = (item.revenue / maxValue) * 100;
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-gray-200 rounded-t" style={{ height: '200px' }}>
                <div
                  className="w-full bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t transition-all duration-300 hover:from-indigo-600 hover:to-indigo-500"
                  style={{ height: `${height}%` }}
                  title={`${formatDate(getItemDate(item))}: ${formatCurrency(item.revenue)}`}
                ></div>
              </div>
              <div className="mt-2 text-xs text-gray-500 text-center">
                {formatDate(getItemDate(item))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <div>
          Total: {formatCurrency(chartData.reduce((sum, item) => sum + item.revenue, 0))}
        </div>
        <div>
          Average: {formatCurrency(chartData.reduce((sum, item) => sum + item.revenue, 0) / chartData.length)}
        </div>
      </div>
    </div>
  );
};
