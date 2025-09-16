import React, { useState, useEffect } from 'react';
import { TwitterEmbed, YouTubeEmbed, InstagramEmbed, TikTokEmbed } from 'react-social-media-embed';

interface EmbeddedContentProps {
    url: string;
    platform?: string;
    className?: string;
}

export function EmbeddedContent({ url, platform, className = '' }: EmbeddedContentProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    // Debug logging
    console.log('EmbeddedContent: URL:', url, 'Platform:', platform);

    const getPlatformFromUrl = (url: string) => {
        if (!url) return 'custom';
        const lowerUrl = url.toLowerCase();
        if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) return 'twitter';
        if (lowerUrl.includes('instagram.com')) return 'instagram';
        if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return 'youtube';
        if (lowerUrl.includes('tiktok.com')) return 'tiktok';
        if (lowerUrl.includes('linkedin.com')) return 'linkedin';
        if (lowerUrl.includes('facebook.com')) return 'facebook';
        if (lowerUrl.includes('discord.com')) return 'discord';
        return 'custom';
    };

    // Extract platform from URL if not provided
    const detectedPlatform = platform || getPlatformFromUrl(url);

    console.log('EmbeddedContent: Detected platform:', detectedPlatform);

    // Set loading to false after a short delay to allow the embed to load
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, [url]);

    const getEmbedUrl = (url: string, platform: string) => {
        try {
            switch (platform) {
                case 'twitter':
                    // Convert Twitter URL to embed format
                    if (url.includes('/status/')) {
                        return `https://twitframe.com/show?url=${encodeURIComponent(url)}`;
                    }
                    return url;
                case 'instagram':
                    const instagramMatch = url.match(/\/p\/([^\/]+)/);
                    if (instagramMatch) {
                        return `https://www.instagram.com/p/${instagramMatch[1]}/embed/`;
                    }
                    return url;
                case 'youtube':
                    let videoId = '';
                    if (url.includes('youtu.be/')) {
                        videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
                    } else if (url.includes('v=')) {
                        videoId = url.split('v=')[1]?.split('&')[0] || '';
                    }
                    if (videoId) {
                        return `https://www.youtube.com/embed/${videoId}`;
                    }
                    return url;
                default:
                    return url;
            }
        } catch (error) {
            console.error('Error generating embed URL:', error);
            return url;
        }
    };

    const renderEmbed = () => {
        // Use the react-social-media-embed library for better reliability
        try {
            if (detectedPlatform === 'twitter') {
                return (
                    <div className="w-full" style={{ maxWidth: '100%' }}>
                        <TwitterEmbed
                            url={url}
                            width="100%"
                            onLoad={() => setIsLoading(false)}
                            onError={() => {
                                setError(true);
                                setIsLoading(false);
                            }}
                        />
                    </div>
                );
            }

            if (detectedPlatform === 'youtube') {
                return (
                    <div className="w-full" style={{ maxWidth: '100%' }}>
                        <YouTubeEmbed
                            url={url}
                            width="100%"
                            onLoad={() => setIsLoading(false)}
                            onError={() => {
                                setError(true);
                                setIsLoading(false);
                            }}
                        />
                    </div>
                );
            }

            if (detectedPlatform === 'instagram') {
                return (
                    <div className="w-full" style={{ maxWidth: '100%' }}>
                        <InstagramEmbed
                            url={url}
                            width="100%"
                            onLoad={() => setIsLoading(false)}
                            onError={() => {
                                setError(true);
                                setIsLoading(false);
                            }}
                        />
                    </div>
                );
            }

            if (detectedPlatform === 'tiktok') {
                return (
                    <div className="w-full" style={{ maxWidth: '100%' }}>
                        <TikTokEmbed
                            url={url}
                            width="100%"
                            onLoad={() => setIsLoading(false)}
                            onError={() => {
                                setError(true);
                                setIsLoading(false);
                            }}
                        />
                    </div>
                );
            }

            // For other platforms or custom URLs, show a preview card
            return (
                <div className="w-full">
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-lg">
                                        {detectedPlatform === 'linkedin' ? '💼' :
                                            detectedPlatform === 'facebook' ? '📘' :
                                                detectedPlatform === 'discord' ? '💬' : '🔗'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-2">
                                    <span className="text-sm font-medium text-gray-300 capitalize">
                                        {detectedPlatform} Content
                                    </span>
                                    <span className="text-xs text-gray-500">•</span>
                                    <span className="text-xs text-gray-500">External Link</span>
                                </div>
                                <p className="text-sm text-gray-400 mb-3 truncate">
                                    {url}
                                </p>
                                <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                                >
                                    View Content
                                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            );
        } catch (error) {
            console.error('Error rendering embed:', error);
            setError(true);
            setIsLoading(false);
            return null;
        }
    };

    if (error || !url) {
        return (
            <div className="w-full">
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 text-center">
                    <div className="text-gray-400 text-sm mb-2">
                        {!url ? 'No content link provided' : 'Unable to load content'}
                    </div>
                    {url && (
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm underline"
                        >
                            Open link in new tab
                        </a>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={`w-full ${className}`}>
            {isLoading && (
                <div className="w-full h-64 bg-gray-800/50 rounded-lg flex items-center justify-center">
                    <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        <span className="text-gray-400 text-sm">Loading content...</span>
                    </div>
                </div>
            )}
            <div className={isLoading ? 'hidden' : 'block'}>
                {renderEmbed()}
            </div>
        </div>
    );
}
