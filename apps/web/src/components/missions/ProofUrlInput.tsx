'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ProofUrlInputProps {
    value: string[];
    onChange: (urls: string[]) => void;
    proofRequirement?: {
        mode: 'social-post' | 'api';
        networks?: string[];
        verifierKey?: string;
    };
    placeholder?: string;
    className?: string;
}

interface UrlValidationResult {
    isValid: boolean;
    platform: string;
    error?: string;
    warning?: string;
}

export default function ProofUrlInput({
    value,
    onChange,
    proofRequirement = { mode: 'social-post' },
    placeholder = "Enter proof URLs (one per line)",
    className = ""
}: ProofUrlInputProps) {
    const [urls, setUrls] = useState<string[]>(value);
    const [validationResults, setValidationResults] = useState<UrlValidationResult[]>([]);
    const [showValidation, setShowValidation] = useState(false);

    useEffect(() => {
        setUrls(value);
    }, [value]);

    // Platform detection patterns
    const PLATFORM_PATTERNS = {
        twitter: [
            /https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/([^\/]+)\/status\/(\d+)/i,
            /https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/i\/web\/status\/(\d+)/i
        ],
        instagram: [
            /https?:\/\/(?:www\.)?instagram\.com\/p\/([a-zA-Z0-9_-]+)/i,
            /https?:\/\/(?:www\.)?instagram\.com\/reel\/([a-zA-Z0-9_-]+)/i
        ],
        tiktok: [
            /https?:\/\/(?:www\.)?tiktok\.com\/@[^\/]+\/video\/(\d+)/i,
            /https?:\/\/(?:www\.)?vm\.tiktok\.com\/([a-zA-Z0-9]+)/i
        ],
        facebook: [
            /https?:\/\/(?:www\.)?facebook\.com\/[^\/]+\/posts\/(\d+)/i,
            /https?:\/\/(?:www\.)?facebook\.com\/photo\.php\?fbid=(\d+)/i
        ],
        telegram: [
            /https?:\/\/t\.me\/([^\/]+\/\d+)/i,
            /https?:\/\/(?:www\.)?telegram\.me\/([^\/]+\/\d+)/i
        ]
    };

    const validateUrl = (url: string): UrlValidationResult => {
        if (!url.trim()) {
            return { isValid: false, platform: 'unknown', error: 'URL cannot be empty' };
        }

        try {
            new URL(url);
        } catch {
            return { isValid: false, platform: 'unknown', error: 'Invalid URL format' };
        }

        // Detect platform
        for (const [platform, patterns] of Object.entries(PLATFORM_PATTERNS)) {
            for (const pattern of patterns) {
                if (pattern.test(url)) {
                    // Check if platform is allowed
                    if (proofRequirement.mode === 'social-post' &&
                        proofRequirement.networks &&
                        proofRequirement.networks.length > 0 &&
                        !proofRequirement.networks.includes(platform)) {
                        return {
                            isValid: false,
                            platform,
                            error: `${platform} is not allowed for this mission`
                        };
                    }

                    return { isValid: true, platform };
                }
            }
        }

        if (proofRequirement.mode === 'social-post') {
            return {
                isValid: false,
                platform: 'unknown',
                error: 'URL does not match any known social media platform'
            };
        }

        // For API verification, any valid URL is acceptable
        return { isValid: true, platform: 'api' };
    };

    const handleUrlChange = (index: number, newUrl: string) => {
        const newUrls = [...urls];
        newUrls[index] = newUrl;
        setUrls(newUrls);
        onChange(newUrls.filter(url => url.trim()));
    };

    const addUrl = () => {
        const newUrls = [...urls, ''];
        setUrls(newUrls);
    };

    const removeUrl = (index: number) => {
        const newUrls = urls.filter((_, i) => i !== index);
        setUrls(newUrls);
        onChange(newUrls.filter(url => url.trim()));
    };

    const validateAllUrls = () => {
        const results = urls.map(url => validateUrl(url));
        setValidationResults(results);
        setShowValidation(true);
    };

    const getValidationIcon = (result: UrlValidationResult) => {
        if (result.isValid) {
            return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
        } else if (result.warning) {
            return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
        } else {
            return <XCircleIcon className="h-5 w-5 text-red-500" />;
        }
    };

    const getValidationColor = (result: UrlValidationResult) => {
        if (result.isValid) {
            return 'border-green-200 bg-green-50';
        } else if (result.warning) {
            return 'border-yellow-200 bg-yellow-50';
        } else {
            return 'border-red-200 bg-red-50';
        }
    };

    const getPlatformIcon = (platform: string) => {
        const platformColors = {
            twitter: 'bg-blue-100 text-blue-600',
            instagram: 'bg-pink-100 text-pink-600',
            tiktok: 'bg-black text-white',
            facebook: 'bg-blue-600 text-white',
            telegram: 'bg-blue-500 text-white',
            api: 'bg-purple-100 text-purple-600',
            unknown: 'bg-gray-100 text-gray-600'
        };

        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${platformColors[platform as keyof typeof platformColors] || platformColors.unknown}`}>
                {platform}
            </span>
        );
    };

    return (
        <div className={className}>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proof URLs *
                    {proofRequirement.mode === 'social-post' && (
                        <span className="text-gray-500 font-normal ml-2">
                            (Social media post URLs required)
                        </span>
                    )}
                    {proofRequirement.mode === 'api' && (
                        <span className="text-gray-500 font-normal ml-2">
                            (API verification: {proofRequirement.verifierKey})
                        </span>
                    )}
                </label>

                {proofRequirement.networks && proofRequirement.networks.length > 0 && (
                    <div className="mb-3">
                        <span className="text-xs text-gray-600">Allowed platforms: </span>
                        {proofRequirement.networks.map(platform => (
                            <span key={platform} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                                {platform}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div className="space-y-3">
                {urls.map((url, index) => (
                    <div key={index} className="flex items-center space-x-3">
                        <div className="flex-1">
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => handleUrlChange(index, e.target.value)}
                                placeholder={index === 0 ? "https://twitter.com/user/status/123456789" : "Additional proof URL"}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${showValidation && validationResults[index]
                                        ? getValidationColor(validationResults[index])
                                        : 'border-gray-300'
                                    }`}
                            />

                            {showValidation && validationResults[index] && (
                                <div className="mt-1 flex items-center space-x-2">
                                    {getValidationIcon(validationResults[index])}
                                    <span className="text-sm">
                                        {getPlatformIcon(validationResults[index].platform)}
                                    </span>
                                    {validationResults[index].error && (
                                        <span className="text-sm text-red-600">{validationResults[index].error}</span>
                                    )}
                                    {validationResults[index].warning && (
                                        <span className="text-sm text-yellow-600">{validationResults[index].warning}</span>
                                    )}
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => removeUrl(index)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                            disabled={urls.length === 1}
                        >
                            <XCircleIcon className="h-5 w-5" />
                        </button>
                    </div>
                ))}
            </div>

            <div className="mt-4 flex items-center space-x-3">
                <button
                    type="button"
                    onClick={addUrl}
                    className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    + Add Another URL
                </button>

                <button
                    type="button"
                    onClick={validateAllUrls}
                    className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                    Validate URLs
                </button>
            </div>

            {/* Help Text */}
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                    <strong>Supported platforms:</strong> Twitter, Instagram, TikTok, Facebook, Telegram
                </p>
                <p className="text-sm text-gray-600 mt-1">
                    <strong>Format:</strong> Direct links to posts, videos, or content
                </p>
                {proofRequirement.mode === 'social-post' && (
                    <p className="text-sm text-gray-600 mt-1">
                        <strong>Note:</strong> URLs must be from allowed social media platforms
                    </p>
                )}
            </div>

            {/* Validation Summary */}
            {showValidation && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Validation Summary</h4>
                    <div className="space-y-2">
                        {validationResults.map((result, index) => (
                            <div key={index} className="flex items-center space-x-2 text-sm">
                                {getValidationIcon(result)}
                                <span className="text-gray-600">
                                    URL {index + 1}: {result.isValid ? 'Valid' : 'Invalid'}
                                </span>
                                {result.platform !== 'unknown' && (
                                    <span className="text-gray-500">({result.platform})</span>
                                )}
                                {result.error && (
                                    <span className="text-red-600">- {result.error}</span>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                            <strong>Valid URLs:</strong> {validationResults.filter(r => r.isValid).length} / {validationResults.length}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}


