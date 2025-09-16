'use client';

import { useState, useEffect } from 'react';
import { useMissionsSimple } from '../../hooks/useMissionsSimple';

export default function DebugMissionsLinksPage() {
    const { missions, loading, error } = useMissionsSimple();
    const [selectedMission, setSelectedMission] = useState<any>(null);

    useEffect(() => {
        console.log('Debug: All missions data:', missions);
        missions.forEach((mission, index) => {
            console.log(`Debug: Mission ${index}:`, {
                id: mission.id,
                title: mission.title,
                platform: mission.platform,
                tweetLink: mission.tweetLink,
                contentLink: mission.contentLink,
                link: mission.link,
                tweet_link: mission.tweet_link,
                content_link: mission.content_link,
                allFields: mission
            });
        });
    }, [missions]);

    if (loading) return <div className="p-8 text-center">Loading missions...</div>;
    if (error) return <div className="p-8 text-center text-red-400">Error: {error}</div>;

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Debug: Mission Links</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Mission List */}
                <div>
                    <h2 className="text-lg font-semibold mb-4">All Missions ({missions.length})</h2>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {missions.map((mission) => (
                            <div
                                key={mission.id}
                                className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedMission?.id === mission.id
                                        ? 'bg-blue-500/20 border-blue-500'
                                        : 'bg-gray-800/50 border-gray-700 hover:bg-gray-700/50'
                                    }`}
                                onClick={() => setSelectedMission(mission)}
                            >
                                <div className="font-medium text-sm">{mission.title}</div>
                                <div className="text-xs text-gray-400 mt-1">
                                    Platform: {mission.platform} | Type: {mission.type}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    Has Link: {!!(mission.tweetLink || mission.contentLink || mission.link || mission.tweet_link || mission.content_link)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mission Details */}
                <div>
                    <h2 className="text-lg font-semibold mb-4">Mission Details</h2>
                    {selectedMission ? (
                        <div className="bg-gray-800/50 rounded-lg p-4">
                            <h3 className="font-medium mb-3">{selectedMission.title}</h3>

                            <div className="space-y-2 text-sm">
                                <div>
                                    <span className="text-gray-400">Platform:</span> {selectedMission.platform}
                                </div>
                                <div>
                                    <span className="text-gray-400">Type:</span> {selectedMission.type}
                                </div>
                                <div>
                                    <span className="text-gray-400">Status:</span> {selectedMission.status}
                                </div>

                                <div className="mt-4">
                                    <span className="text-gray-400 font-medium">Link Fields:</span>
                                    <div className="mt-2 space-y-1">
                                        <div>tweetLink: <span className="text-blue-400">{selectedMission.tweetLink || 'null'}</span></div>
                                        <div>contentLink: <span className="text-blue-400">{selectedMission.contentLink || 'null'}</span></div>
                                        <div>link: <span className="text-blue-400">{selectedMission.link || 'null'}</span></div>
                                        <div>tweet_link: <span className="text-blue-400">{selectedMission.tweet_link || 'null'}</span></div>
                                        <div>content_link: <span className="text-blue-400">{selectedMission.content_link || 'null'}</span></div>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <span className="text-gray-400 font-medium">All Fields:</span>
                                    <pre className="mt-2 text-xs bg-gray-900/50 p-2 rounded overflow-auto max-h-40">
                                        {JSON.stringify(selectedMission, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-800/50 rounded-lg p-4 text-center text-gray-400">
                            Select a mission to view details
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

