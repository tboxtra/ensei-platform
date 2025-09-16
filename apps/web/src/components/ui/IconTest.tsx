/**
 * Icon Test Component - Test the SmartIcon system
 * This component tests all icon types and fallback chains
 */

'use client';

import React from 'react';
import { SmartIcon, PlatformIcon, TaskIcon, NavigationIcon, StatusIcon } from './SmartIcon';

export const IconTest: React.FC = () => {
  const testIcons = [
    // Navigation icons
    { name: 'dashboard', label: 'Dashboard' },
    { name: 'discover', label: 'Discover' },
    { name: 'missions', label: 'Missions' },
    { name: 'review', label: 'Review' },
    { name: 'wallet', label: 'Wallet' },
    { name: 'profile', label: 'Profile' },
    { name: 'settings', label: 'Settings' },
    { name: 'logout', label: 'Logout' },
    
    // Platform icons
    { name: 'twitter', label: 'Twitter' },
    { name: 'instagram', label: 'Instagram' },
    { name: 'tiktok', label: 'TikTok' },
    { name: 'facebook', label: 'Facebook' },
    { name: 'whatsapp', label: 'WhatsApp' },
    { name: 'snapchat', label: 'Snapchat' },
    { name: 'telegram', label: 'Telegram' },
    { name: 'youtube', label: 'YouTube' },
    { name: 'linkedin', label: 'LinkedIn' },
    { name: 'discord', label: 'Discord' },
    
    // Task icons
    { name: 'like', label: 'Like' },
    { name: 'retweet', label: 'Retweet' },
    { name: 'comment', label: 'Comment' },
    { name: 'quote', label: 'Quote' },
    { name: 'follow', label: 'Follow' },
    { name: 'meme', label: 'Meme' },
    { name: 'thread', label: 'Thread' },
    { name: 'article', label: 'Article' },
    { name: 'videoreview', label: 'Video Review' },
    { name: 'pfp', label: 'Profile Picture' },
    
    // Status icons
    { name: 'approved', label: 'Approved' },
    { name: 'pending', label: 'Pending' },
    { name: 'rejected', label: 'Rejected' },
    { name: 'success', label: 'Success' },
    { name: 'error', label: 'Error' },
    { name: 'warning', label: 'Warning' },
    
    // Action icons
    { name: 'engage', label: 'Engage' },
    { name: 'content', label: 'Content' },
    { name: 'ambassador', label: 'Ambassador' },
    { name: 'custom', label: 'Custom' },
    
    // Brand icons
    { name: 'ensei-logo', label: 'Ensei Logo' },
  ];

  return (
    <div className="p-8 bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-8 text-center">🎨 SmartIcon System Test</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {testIcons.map(({ name, label }) => (
          <div key={name} className="flex flex-col items-center p-4 bg-gray-800 rounded-lg">
            <SmartIcon name={name as any} size={32} className="mb-2" />
            <span className="text-sm text-center text-gray-300">{label}</span>
            <span className="text-xs text-gray-500 mt-1">{name}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6 text-center">🔧 Convenience Components Test</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Platform Icons</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <PlatformIcon platform="twitter" size={20} />
                <span>Twitter</span>
              </div>
              <div className="flex items-center space-x-2">
                <PlatformIcon platform="instagram" size={20} />
                <span>Instagram</span>
              </div>
              <div className="flex items-center space-x-2">
                <PlatformIcon platform="tiktok" size={20} />
                <span>TikTok</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Task Icons</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <TaskIcon taskType="like" size={20} />
                <span>Like</span>
              </div>
              <div className="flex items-center space-x-2">
                <TaskIcon taskType="retweet" size={20} />
                <span>Retweet</span>
              </div>
              <div className="flex items-center space-x-2">
                <TaskIcon taskType="comment" size={20} />
                <span>Comment</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Navigation Icons</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <NavigationIcon page="dashboard" size={20} />
                <span>Dashboard</span>
              </div>
              <div className="flex items-center space-x-2">
                <NavigationIcon page="missions" size={20} />
                <span>Missions</span>
              </div>
              <div className="flex items-center space-x-2">
                <NavigationIcon page="wallet" size={20} />
                <span>Wallet</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Status Icons</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <StatusIcon status="approved" size={20} />
                <span>Approved</span>
              </div>
              <div className="flex items-center space-x-2">
                <StatusIcon status="pending" size={20} />
                <span>Pending</span>
              </div>
              <div className="flex items-center space-x-2">
                <StatusIcon status="rejected" size={20} />
                <span>Rejected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-12 text-center">
        <h2 className="text-2xl font-bold mb-4">✅ Phase 1 Complete!</h2>
        <p className="text-gray-400">
          The SmartIcon system is working with fallback chain: Custom SVG → Library Icon → Emoji
        </p>
        <p className="text-gray-500 text-sm mt-2">
          All icons are completely independent of local storage and work statically
        </p>
      </div>
    </div>
  );
};
