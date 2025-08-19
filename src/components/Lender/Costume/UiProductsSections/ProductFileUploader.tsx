"use client";

import { Input } from '@/components/ui/input';
import { cn } from "@/lib/utils";

import { UploadCloud } from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';


const FileUploader: React.FC<any> = React.memo(({
    onFilesUpload,
    maxFiles = 10,
    maxSize = 10 * 1024 * 1024, // 10MB
    accept = "*",
    multiple = false,
    label = "Upload files",
    className
}) => {
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const validateFiles = useCallback((files: File[]): boolean => {
        if (files.length > maxFiles) {
            setError(`You can only upload a maximum of ${maxFiles} files.`);
            return false;
        }

        for (const file of files) {
            if (file.size > maxSize) {
                setError(`File "${file.name}" exceeds the maximum size of ${Math.round(maxSize / (1024 * 1024))}MB.`);
                return false;
            }
        }

        setError(null);
        return true;
    }, [maxFiles, maxSize]);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const droppedFiles = Array.from(e.dataTransfer.files);
            if (validateFiles(droppedFiles)) {
                onFilesUpload(multiple ? droppedFiles : [droppedFiles[0] as any]);
            }
        }
    }, [multiple, onFilesUpload, validateFiles]);

    const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFiles = Array.from(e.target.files);
            if (validateFiles(selectedFiles)) {
                onFilesUpload(multiple ? selectedFiles : [selectedFiles[0] as any]);
            }
        }
    }, [multiple, onFilesUpload, validateFiles]);

    const handleClick = useCallback(() => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    }, []);

    return (
        <div className="w-full">
            <Input
                ref={fileInputRef}
                type="file"
                multiple={multiple}
                accept={accept}
                onChange={handleFileInputChange}
                className="hidden"
            />
            <div
                onClick={handleClick}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={cn(
                    "w-full border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-300",
                    isDragging
                        ? "border-rose-500 bg-rose-50"
                        : "border-gray-300 hover:border-rose-300 hover:bg-rose-50/30",
                    className
                )}
            >
                <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="p-3 bg-rose-100 rounded-full">
                        <UploadCloud className="h-6 w-6 text-rose-500" />
                    </div>
                    <div className="flex text-sm text-gray-600">
                        <span className="font-medium text-rose-500 hover:underline">{label}</span>
                        <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                        {accept !== "*" ? accept.replace(/,/g, ', ') : "Any file format"}
                        {maxSize && ` up to ${Math.round(maxSize / (1024 * 1024))}MB`}
                        {multiple ? ` (${maxFiles} files max)` : ""}
                    </p>
                </div>
            </div>
            {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        </div>
    );
});

FileUploader.displayName = "FileUploader";

export default FileUploader;