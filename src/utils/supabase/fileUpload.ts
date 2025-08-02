import { createClient } from '@supabase/supabase-js';


// Environment variables should be used for sensitive information
// For example purposes, we're keeping these as is
const supabaseUrl = 'https://rlfkmbjptciiluhsbvxx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsZmttYmpwdGNpaWx1aHNidnh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwODU5NzUsImV4cCI6MjA2NTY2MTk3NX0.hRHPR2tuRhoadAmNsZXbs3nEJyUHljYzAcIKvNZW-2w';


// Configuration constants
const CONFIG = {
    STORAGE_BUCKET: 'images',
    DEFAULT_FOLDER: 'images',
    MAX_IMAGE_SIZE_MB: 10,
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'], // Added PDF support
    CACHE_CONTROL: '3600',
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
};

// Initialize Supabase client with custom options
export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
    },
    global: {
        headers: {
            'Cache-Control': 'no-cache',
        },
    },
});

// Add retry mechanism for uploads
const retryOperation = async (operation: () => Promise<any>, attempts = CONFIG.RETRY_ATTEMPTS): Promise<any> => {
    try {
        return await operation();
    } catch (error) {
        if (attempts <= 1) throw error;

        await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
        return retryOperation(operation, attempts - 1);
    }
};


// Types
export interface ImageUploadResponse {
    url: string | null;
    error: string | null;
    filePath: string | null;
}

export interface MultipleImageUploadResponse {
    successful: ImageUploadResponse[];
    failed: ImageUploadResponse[];
    allSuccessful: boolean;
}

export interface ImageUploadOptions {
    file: File;
    customFileName?: string;
    maxSizeMB?: number;
    folder?: string;
}

/**
 * Validates an image file based on type and size constraints.
 * @param file - The file to validate
 * @param maxSizeMB - Maximum file size in MB
 * @returns Error message or null if valid
 */
const validateImage = (file: File, maxSizeMB: number): string | null => {
    if (!file.type || !CONFIG.ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return 'Please upload a valid image file (JPG or PNG)';
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
        return `File size must be under ${maxSizeMB}MB`;
    }

    return null;
};

/**
 * Returns the file extension based on the MIME type.
 * @param mimeType - The file's MIME type
 * @returns The file extension including the dot
 */
const getFileExtension = (mimeType: string): string => {
    const extensions: Record<string, string> = {
        'image/jpeg': '.jpg',
        'image/jpg': '.jpg',
        'image/png': '.png'
    };

    return extensions[mimeType] || '';
};

/**
 * Generates a unique filename for upload
 * @param file - The file to be uploaded
 * @param customFileName - Optional custom filename
 * @returns A sanitized unique filename with extension
 */
const generateUniqueFileName = (file: File, customFileName?: string): string => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 10);
    const sanitizedFileName = (customFileName || file.name).replace(/[^a-zA-Z0-9.]/g, '_');
    const fileExtension = getFileExtension(file.type);

    return `${timestamp}-${randomString}-${sanitizedFileName}${fileExtension}`;
};

/**
 * Uploads a single image file to Supabase Storage.
 * @param options - Upload options including file and preferences
 * @returns Promise with upload response
 */
export const uploadImage = async ({
    file,
    customFileName,
    maxSizeMB = CONFIG.MAX_IMAGE_SIZE_MB,
    folder = CONFIG.DEFAULT_FOLDER
}: ImageUploadOptions): Promise<ImageUploadResponse> => {
    try {
        // Validate the file
        const validationError = validateImage(file, maxSizeMB);
        if (validationError) {
            return {
                url: null,
                error: validationError,
                filePath: null
            };
        }

        // Generate filename and path
        const finalFileName = generateUniqueFileName(file, customFileName);
        const filePath = `${folder}/${finalFileName}`;

        // Upload to Supabase Storage with retry logic
        const uploadWithRetry = async (): Promise<any> => {
            const { error: uploadError, data } = await supabase.storage
                .from(CONFIG.STORAGE_BUCKET)
                .upload(filePath, file, {
                    cacheControl: CONFIG.CACHE_CONTROL,
                    contentType: file.type,
                    upsert: false
                });

            if (uploadError) {
                throw new Error(uploadError.message);
            }

            return { error: uploadError, data };
        };

        const { error: uploadError } = await retryOperation(uploadWithRetry);

        if (uploadError) {
            throw new Error(uploadError);
        }

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
            .from(CONFIG.STORAGE_BUCKET)
            .getPublicUrl(filePath);

        if (!publicUrl) {
            throw new Error('Failed to generate public URL for uploaded image');
        }

        return {
            url: publicUrl,
            error: null,
            filePath
        };

    } catch (error) {
        console.error('Image upload failed:', error);

        // Provide more specific error messages
        let errorMessage = 'Failed to upload image';
        if (error instanceof Error) {
            if (error.message.includes('JWT')) {
                errorMessage = 'Authentication error. Please log in again.';
            } else if (error.message.includes('storage')) {
                errorMessage = 'Storage service error. Please try again.';
            } else if (error.message.includes('network')) {
                errorMessage = 'Network error. Please check your connection.';
            } else {
                errorMessage = error.message;
            }
        }

        return {
            url: null,
            error: errorMessage,
            filePath: null
        };
    }
};

/**
 * Uploads multiple image files to Supabase Storage.
 * @param files - Array of files to upload
 * @param options - Optional upload configuration
 * @returns Promise with results of all uploads
 */
export const uploadMultipleImages = async (
    files: File[],
    options: Omit<ImageUploadOptions, 'file'> = {}
): Promise<MultipleImageUploadResponse> => {
    const uploadPromises = files.map(file =>
        uploadImage({ file, ...options })
    );

    const results = await Promise.all(uploadPromises);

    const successful = results.filter(result => result.url !== null);
    const failed = results.filter(result => result.error !== null);

    return {
        successful,
        failed,
        allSuccessful: failed.length === 0
    };
};

/**
 * Get image download URL from a file path
 * @param filePath - The path of the file in storage
 * @returns Promise with the public URL or null
 */
export const getImageDownloadUrl = async (filePath: string): Promise<string | null> => {
    try {
        const { data: { publicUrl } } = supabase.storage
            .from(CONFIG.STORAGE_BUCKET)
            .getPublicUrl(filePath);

        return publicUrl;
    } catch (error) {
        console.error('Error getting download URL:', error);
        return null;
    }
};

/**
 * Delete an image from storage
 * @param filePath - The path of the file to delete
 * @returns Promise resolving to success status
 */
export const deleteImage = async (filePath: string): Promise<boolean> => {
    try {
        const { error } = await supabase.storage
            .from(CONFIG.STORAGE_BUCKET)
            .remove([filePath]);

        return !error;
    } catch (error) {
        console.error('Error deleting image:', error);
        return false;
    }
};

/**
 * Batch delete multiple images from storage
 * @param filePaths - Array of file paths to delete
 * @returns Promise resolving to an array of deletion results
 */
export const deleteMultipleImages = async (filePaths: string[]): Promise<{
    successful: string[];
    failed: string[];
}> => {
    try {
        const { data, error } = await supabase.storage
            .from(CONFIG.STORAGE_BUCKET)
            .remove(filePaths);

        if (error) throw error;

        // Supabase returns the paths of files that were successfully deleted
        const successful = data?.map(item => item.name) || [];
        const failed = filePaths.filter(path => !successful.includes(path));

        return { successful, failed };
    } catch (error) {
        console.error('Error batch deleting images:', error);
        return {
            successful: [],
            failed: filePaths
        };
    }
};

// For easier usage in forms and UI components
/**
 * Helper function to handle file input change events for single image upload
 * @param file - File from input element
 * @returns Promise with upload result
 */
export const handleSingleImageUpload = async (file: File): Promise<ImageUploadResponse> => {
    return uploadImage({ file });
};

/**
 * Helper function to handle file input change events for multiple image uploads
 * @param files - FileList or File[] from input element
 * @returns Promise with upload results
 */
export const handleMultipleImageUpload = async (
    files: FileList | File[]
): Promise<MultipleImageUploadResponse> => {
    const fileArray = Array.from(files);
    return uploadMultipleImages(fileArray);
};