'use client';

import React, { useState, useEffect, useRef } from 'react';

interface RealTimeUpdate {
  id: string;
  type: 'mission_created' | 'submission_received' | 'review_completed' | 'user_registered' | 'payment_processed' | 'system_alert';
  title: string;
  message: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  data?: any;
}

interface RealTimeUpdatesProps {
  onUpdate?: (update: RealTimeUpdate) => void;
  autoConnect?: boolean;
}

export const RealTimeUpdates: React.FC<RealTimeUpdatesProps> = ({
  onUpdate,
  autoConnect = true
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [updates, setUpdates] = useState<RealTimeUpdate[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Real WebSocket connection
  const connectWebSocket = () => {
    try {
      // TODO: Implement real WebSocket connection when server is available
      // const ws = new WebSocket('wss://your-websocket-server.com/ws');
      // 
      // ws.onopen = () => {
      //   setIsConnected(true);
      // };
      // 
      // ws.onmessage = (event) => {
      //   const update: RealTimeUpdate = JSON.parse(event.data);
      //   handleUpdate(update);
      // };
      // 
      // ws.onclose = () => {
      //   setIsConnected(false);
      //   scheduleReconnect();
      // };
      // 
      // ws.onerror = (error) => {
      //   console.error('WebSocket error:', error);
      //   setIsConnected(false);
      // };

      // For now, show disconnected state
      setIsConnected(false);
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      setIsConnected(false);
    }
  };

  const scheduleReconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    reconnectTimeoutRef.current = setTimeout(() => {
      connectWebSocket();
    }, 5000);
  };

  const handleUpdate = (update: RealTimeUpdate) => {
    setUpdates(prev => [update, ...prev].slice(0, 50)); // Keep last 50 updates
    setUnreadCount(prev => prev + 1);

    if (onUpdate) {
      onUpdate(update);
    }
  };

  const clearUnread = () => {
    setUnreadCount(0);
  };

  const getUpdateIcon = (type: string) => {
    const icons: Record<string, string> = {
      mission_created: '🎯',
      submission_received: '📝',
      review_completed: '✅',
      user_registered: '👤',
      payment_processed: '💳',
      system_alert: '⚠️'
    };
    return icons[type] || '📢';
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      info: 'bg-blue-100 text-blue-800',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800'
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) { // Less than 1 minute
      return 'Just now';
    } else if (diff < 3600000) { // Less than 1 hour
      return `${Math.floor(diff / 60000)}m ago`;
    } else if (diff < 86400000) { // Less than 1 day
      return `${Math.floor(diff / 3600000)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  useEffect(() => {
    if (autoConnect) {
      const cleanup = connectWebSocket();
      return cleanup;
    }
  }, [autoConnect]);

  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-full"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 1 0-15 0v5h5l-5 5-5-5h5v-5a7.5 7.5 0 1 0 15 0v5z" />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        {/* Connection Status Indicator */}
        <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'
          }`} />
      </button>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Real-time Updates</h3>
              <div className="flex items-center space-x-2">
                <span className={`text-xs px-2 py-1 rounded-full ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={clearUnread}
                    className="text-xs text-indigo-600 hover:text-indigo-800"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {updates.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <div className="text-4xl mb-2">🔔</div>
                <p>No updates yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {updates.map((update) => (
                  <div key={update.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <span className="text-lg">{getUpdateIcon(update.type)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {update.title}
                          </p>
                          <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(update.severity)}`}>
                            {update.severity}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {update.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTimestamp(update.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => setShowNotifications(false)}
              className="w-full text-sm text-indigo-600 hover:text-indigo-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
