'use client';

import React, { useState, useRef } from 'react';
import { useApi } from '@/hooks/useApi';

interface FileUploadProps {
    onUploadSuccess: (fileUrl: string, fileName: string) => void;
    onUploadError: (error: string) => void;
    accept?: string;
    maxSize?: number; // in MB
    className?: string;
}

export default function FileUpload({
    onUploadSuccess,
    onUploadError,
    accept = "image/*,video/*,.pdf,.doc,.docx,.txt",
    maxSize = 10,
    className = ""
}: FileUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { makeRequest } = useApi();

    const handleFile = async (file: File) => {
        // Validate file size
        if (file.size > maxSize * 1024 * 1024) {
            onUploadError(`File size must be less than ${maxSize}MB`);
            return;
        }

        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await makeRequest<{
                success: boolean;
                file_url: string;
                file_name: string;
                file_size: number;
                content_type: string;
            }>('/v1/upload', {
                method: 'POST',
                body: formData,
                headers: {
                    // Don't set Content-Type, let browser set it with boundary
                }
            });

            if (response.success) {
                onUploadSuccess(response.file_url, response.file_name);
            } else {
                onUploadError('Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            onUploadError('Upload failed. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const onButtonClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className={`w-full ${className}`}>
            <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleChange}
                className="hidden"
            />

            <div
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                    } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                {isUploading ? (
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                        <p className="text-gray-600">Uploading...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <svg
                            className="mx-auto h-12 w-12 text-gray-400 mb-4"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                        >
                            <path
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        <p className="text-gray-600 mb-2">
                            <button
                                type="button"
                                onClick={onButtonClick}
                                className="text-blue-600 hover:text-blue-500 font-medium"
                            >
                                Click to upload
                            </button>
                            {' '}or drag and drop
                        </p>
                        <p className="text-sm text-gray-500">
                            Images, videos, PDFs, documents up to {maxSize}MB
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
