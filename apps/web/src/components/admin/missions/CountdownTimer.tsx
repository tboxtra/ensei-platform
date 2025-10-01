'use client';

import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  deadline: string;
  className?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ deadline, className = '' }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!deadline) {
      setTimeLeft('No deadline');
      return;
    }

    const updateCountdown = () => {
      try {
        const deadlineDate = new Date(deadline);
        if (isNaN(deadlineDate.getTime())) {
          setTimeLeft('Invalid deadline');
          return;
        }

        const now = new Date();
        const diffTime = deadlineDate.getTime() - now.getTime();

        if (diffTime <= 0) {
          setTimeLeft('Expired');
          return;
        }

        const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffTime % (1000 * 60)) / 1000);

        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h ${minutes}m`);
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        } else if (minutes > 0) {
          setTimeLeft(`${minutes}m ${seconds}s`);
        } else {
          setTimeLeft(`${seconds}s`);
        }
      } catch (error) {
        setTimeLeft('Invalid deadline');
      }
    };

    // Update immediately
    updateCountdown();

    // Update every second
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  const getTextColor = () => {
    if (timeLeft === 'Expired' || timeLeft === 'Invalid deadline' || timeLeft === 'No deadline') {
      return 'text-red-600';
    }
    
    // Check if less than 1 hour remaining
    if (timeLeft.includes('m') && !timeLeft.includes('h') && !timeLeft.includes('d')) {
      const minutes = parseInt(timeLeft.split('m')[0]);
      if (minutes < 60) return 'text-red-600';
    }
    
    // Check if less than 1 day remaining
    if (timeLeft.includes('h') && !timeLeft.includes('d')) {
      const hours = parseInt(timeLeft.split('h')[0]);
      if (hours < 24) return 'text-orange-600';
    }
    
    return 'text-gray-600';
  };

  return (
    <span className={`font-mono text-sm ${getTextColor()} ${className}`}>
      {timeLeft}
    </span>
  );
};
