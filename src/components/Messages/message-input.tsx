import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImagePlus, Loader2, Send } from 'lucide-react';
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
interface MessageInputProps {
    form: UseFormReturn<any>;
    onSubmit: (data: any) => void;
    isUploading: boolean;
    isLoading?: boolean;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleTyping: (e: React.ChangeEvent<HTMLInputElement>) => void;

}

const MessageInput: React.FC<MessageInputProps> = ({
    form,
    onSubmit,
    isUploading,
    isLoading,
    fileInputRef,
    handleImageUpload,
    handleTyping,

}) => {
    return (
        <div className="border-t border-border bg-background">
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-end gap-2 lg:gap-3 p-3 lg:p-4">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-muted-foreground hover:text-foreground flex-shrink-0 h-10 w-10 lg:h-11 lg:w-11"
                    disabled={isUploading}
                >
                    {isUploading ? (
                        <Loader2 className="h-4 w-4 lg:h-5 lg:w-5 animate-spin" />
                    ) : (
                        <ImagePlus className="h-4 w-4 lg:h-5 lg:w-5" />
                    )}
                </Button>

                <Input
                    title="image_upload"
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                />

                <div className="flex-1 min-w-0">
                    <Input
                        {...form.register('message')}
                        placeholder="Type a message..."
                        className="min-h-[40px] lg:min-h-[44px] resize-none border-border focus:border-rose-500 focus:ring-rose-500 text-sm lg:text-base"
                        disabled={isUploading || isLoading}
                        onChange={handleTyping}
                    />
                </div>

                <Button
                    type="submit"
                    disabled={!form.formState.isValid || isUploading || isLoading}
                    className="bg-rose-600 hover:bg-rose-700 text-white flex-shrink-0 h-10 w-10 lg:h-11 lg:w-11 p-0"
                >
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 lg:h-5 lg:w-5 animate-spin" />
                    ) : (
                        <Send className="h-4 w-4 lg:h-5 lg:w-5" />
                    )}
                </Button>
            </form>
        </div>
    );
};

export default MessageInput; 