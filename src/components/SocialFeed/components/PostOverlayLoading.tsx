import React from 'react';
import { Loader2, Trash2, Edit3 } from 'lucide-react';

interface PostLoadingOverlayProps {
    isVisible: boolean;
    type: 'deleting' | 'updating';
    className?: string;
}

const PostLoadingOverlay: React.FC<PostLoadingOverlayProps> = ({
    isVisible,
    type,
    className = ""
}) => {
    if (!isVisible) return null;

    const config = {
        deleting: {
            icon: Trash2,
            text: 'Deleting post...',
            iconColor: 'text-red-500',
            bgColor: 'bg-red-50/90'
        },
        updating: {
            icon: Edit3,
            text: 'Updating post...',
            iconColor: 'text-blue-500',
            bgColor: 'bg-blue-50/90'
        }
    };

    const { icon: Icon, text, iconColor, bgColor } = config[type];

    return (
        <div className={`absolute inset-0 ${bgColor} backdrop-blur-sm z-50 flex items-center justify-center rounded-lg ${className}`}>
            <div className="flex flex-col items-center gap-3 p-6">
                <div className="relative">
                    <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                    <Icon className={`h-4 w-4 ${iconColor} absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`} />
                </div>
                <span className="text-sm font-medium text-gray-700">{text}</span>
            </div>
        </div>
    );
};

export default PostLoadingOverlay;