'use client';

import React, { useState } from 'react';
import { MissionTwitterIntents, TwitterIntents } from '@/lib/twitter-intents';

export default function TwitterIntentsDemo() {
    const [tweetUrl, setTweetUrl] = useState('https://twitter.com/example_user/status/1234567890123456789');
    const [username, setUsername] = useState('example_user');
    const [generatedUrls, setGeneratedUrls] = useState<{ [key: string]: string }>({});

  const sampleMission = {
    id: 'demo-mission',
    title: 'Demo Twitter Mission',
    platform: 'twitter',
    mission_type: 'engage',
    tweetLink: tweetUrl,
    user_handle: username
  };

  // Test username extraction
  const extractedUsername = tweetUrl ? TwitterIntents.extractUsername(tweetUrl) : '';

    const generateUrls = () => {
        const urls: { [key: string]: string } = {};

        // Generate intent URLs for all actions
        const actions = ['like', 'retweet', 'comment', 'quote', 'follow'];

        actions.forEach(action => {
            const url = MissionTwitterIntents.generateIntentUrl(action, sampleMission);
            if (url) {
                urls[action] = url;
            }
        });

        setGeneratedUrls(urls);
    };

    const openIntent = (action: string, url: string) => {
        TwitterIntents.openIntent(url, action);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-center">
                    🐦 Twitter Intent URLs Demo
                </h1>

                <div className="bg-gray-800 rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Mission Configuration</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Tweet URL</label>
                            <input
                                type="url"
                                value={tweetUrl}
                                onChange={(e) => setTweetUrl(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="https://twitter.com/username/status/1234567890"
                            />
                        </div>

            <div>
              <label className="block text-sm font-medium mb-2">Username (Optional - will be auto-extracted from URL)</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="username (auto-extracted if not provided)"
              />
              {extractedUsername && (
                <div className="mt-2 text-sm text-green-400">
                  ✨ Auto-extracted username: <strong>@{extractedUsername}</strong>
                </div>
              )}
            </div>

                        <button
                            onClick={generateUrls}
                            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-medium transition-colors"
                        >
                            Generate Intent URLs
                        </button>
                    </div>
                </div>

                {Object.keys(generatedUrls).length > 0 && (
                    <div className="bg-gray-800 rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">Generated Intent URLs</h2>

                        <div className="space-y-4">
                            {Object.entries(generatedUrls).map(([action, url]) => (
                                <div key={action} className="bg-gray-700 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-medium capitalize">{action} Action</h3>
                                        <button
                                            onClick={() => openIntent(action, url)}
                                            className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            Test {action}
                                        </button>
                                    </div>

                                    <div className="bg-gray-600 rounded p-2 text-sm font-mono break-all">
                                        {url}
                                    </div>

                                    <div className="mt-2 text-xs text-gray-400">
                                        {action === 'like' && 'Opens Twitter with the like action ready'}
                                        {action === 'retweet' && 'Opens Twitter with the retweet action ready'}
                                        {action === 'comment' && 'Opens Twitter with the reply interface ready'}
                                        {action === 'quote' && 'Opens Twitter with the quote tweet interface ready'}
                                        {action === 'follow' && 'Opens Twitter with the follow action ready'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

        <div className="bg-gray-800 rounded-lg p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">How It Works</h2>
          
          <div className="space-y-4 text-gray-300">
            <div>
              <h3 className="font-medium text-white mb-2">1. Smart Username Extraction</h3>
              <p>Our system automatically extracts usernames from Twitter URLs, so you don't need to provide them separately.</p>
              <div className="mt-2 p-3 bg-gray-700 rounded text-sm">
                <strong>Example:</strong> From <code>https://twitter.com/elonmusk/status/1234567890</code><br/>
                ✨ Auto-extracts username: <strong>@elonmusk</strong>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-white mb-2">2. Intent URL Generation</h3>
              <p>Our system generates Twitter intent URLs that open Twitter with specific actions ready to perform.</p>
            </div>
            
            <div>
              <h3 className="font-medium text-white mb-2">3. User Experience</h3>
              <p>Users click the action button → Twitter opens in a new window → User completes the action → User returns to verify.</p>
            </div>
            
            <div>
              <h3 className="font-medium text-white mb-2">4. Verification</h3>
              <p>Users submit proof (screenshot or link) to verify they completed the action.</p>
            </div>
            
            <div>
              <h3 className="font-medium text-white mb-2">5. Future API Integration</h3>
              <p>When ready, these intent URLs can be easily replaced with direct API calls for automatic verification.</p>
            </div>
          </div>
        </div>

                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6 mt-8">
                    <h2 className="text-xl font-semibold mb-4 text-blue-400">Supported Actions</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3">
                            <span className="text-2xl">👍</span>
                            <div>
                                <div className="font-medium">Like</div>
                                <div className="text-sm text-gray-400">Like a specific tweet</div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <span className="text-2xl">🔄</span>
                            <div>
                                <div className="font-medium">Retweet</div>
                                <div className="text-sm text-gray-400">Retweet a specific tweet</div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <span className="text-2xl">💬</span>
                            <div>
                                <div className="font-medium">Comment</div>
                                <div className="text-sm text-gray-400">Reply to a specific tweet</div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <span className="text-2xl">💭</span>
                            <div>
                                <div className="font-medium">Quote</div>
                                <div className="text-sm text-gray-400">Quote tweet with your thoughts</div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <span className="text-2xl">👤</span>
                            <div>
                                <div className="font-medium">Follow</div>
                                <div className="text-sm text-gray-400">Follow a specific user</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
