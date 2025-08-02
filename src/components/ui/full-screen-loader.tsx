import { Loader } from "lucide-react";
import { cn } from "@/lib/utils";

interface FullScreenLoaderProps {
    isVisible: boolean;
    message?: string;
    className?: string;
    size?: "sm" | "md" | "lg";
    variant?: "default" | "dark" | "light";
}

export const FullScreenLoader = ({
    isVisible,
    message = "Loading...",
    className,
    size = "md",
    variant = "default"
}: FullScreenLoaderProps) => {
    if (!isVisible) return null;

    const sizeClasses = {
        sm: "w-6 h-6",
        md: "w-8 h-8",
        lg: "w-12 h-12"
    };

    const variantClasses = {
        default: "bg-black/50 ",
        dark: "bg-gray-900/80 ",
        light: "bg-white/80 text-gray-900"
    };

    return (
        <div
            className={cn(
                "fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm",
                variantClasses[variant],
                className
            )}
            aria-label="Loading"
            role="status"
        >
            <div className="flex flex-col items-center space-y-4 p-8 rounded-lg bg-background/90 shadow-lg border">
                <Loader
                    className={cn(
                        "animate-spin text-primary",
                        sizeClasses[size]
                    )}
                />
                {message && (
                    <p className="text-sm font-medium text-center max-w-xs text-shadow-black">
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
};

// Alternative compact version for inline usage
export const InlineLoader = ({
    isVisible,
    message = "Loading...",
    className,
    size = "sm"
}: Omit<FullScreenLoaderProps, 'variant'>) => {
    if (!isVisible) return null;

    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-5 h-5",
        lg: "w-6 h-6"
    };

    return (
        <div className={cn("flex items-center justify-center space-x-2", className)}>
            <Loader className={cn("animate-spin", sizeClasses[size])} />
            {message && <span className="text-sm">{message}</span>}
        </div>
    );
};