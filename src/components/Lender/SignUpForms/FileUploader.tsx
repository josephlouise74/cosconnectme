// components/FileUploader.tsx
import { Button } from "@/components/ui/button";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Loader2, Upload, X } from "lucide-react";
import { useCallback, useState } from "react";
import { Control } from "react-hook-form";
import { LenderSignUpFormData } from "../../../../lib/zodFormSchema/lenderSchema";

interface FileUploaderProps {
  control: Control<LenderSignUpFormData>;
  name: keyof LenderSignUpFormData;
  label: string;
  description?: string;
  required?: boolean;
  maxSize?: number; // in MB
  acceptedFileTypes?: string[];
  onFileChange?: (file: File) => void; // Optional callback for custom file handling
}

export const FileUploader = ({
  control,
  name,
  label,
  description,
  required = true,
  maxSize = 5, // 5MB default
  acceptedFileTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  onFileChange,
}: FileUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    setFileError(null);

    if (!acceptedFileTypes.includes(file.type)) {
      setFileError(`File type not supported. Please upload: ${acceptedFileTypes.join(', ')}`);
      return false;
    }

    if (file.size > maxSize * 1024 * 1024) {
      setFileError(`File size must be less than ${maxSize}MB`);
      return false;
    }

    return true;
  };

  const handleFile = useCallback((file: File, onChange: (file: File | string | null) => void) => {
    if (!validateFile(file)) return;

    setFileName(file.name);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }

    // Simulate upload process
    setIsUploading(true);
    setTimeout(async () => {
      setIsUploading(false);
      if (onFileChange) {
        await onFileChange(file); // Parent handles setting the value (e.g., to a URL)
      } else {
        // Create a FileList-like object
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        onChange(dataTransfer.files[0] as File);
      }
    }, 1000);
  }, [onFileChange]);

  const handleDrop = useCallback((onChange: (file: string | File | null) => void, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) handleFile(file, onChange);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const clearFile = useCallback((onChange: (file: null) => void) => {
    setFileName(null);
    setPreview(null);
    onChange(null);
  }, []);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field: { value, onChange, ...field } }) => (
        <FormItem>
          <FormLabel>{label}{required ? "" : " (Optional)"}</FormLabel>
          <FormControl>
            <div className="flex flex-col gap-2">
              <div
                className={cn(
                  "relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg transition-colors",
                  isDragging ? "border-primary bg-primary/5" : "border-gray-300",
                  "hover:border-primary hover:bg-primary/5"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(onChange, e)}
              >
                <Input
                  type="file"
                  accept={acceptedFileTypes.join(',')}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file, onChange);
                  }}
                  {...field}
                />

                {isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <span className="text-sm text-gray-500">Uploading...</span>
                  </div>
                ) : preview ? (
                  <div className="relative w-full h-full p-2">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-full object-contain rounded-lg"
                    />
                    <Button
                      type="button"
                      onClick={() => clearFile(onChange)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 p-4 text-center">
                    <Upload className="w-8 h-8 text-gray-500" />
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-gray-700">
                        Drag & drop your file here, or click to select
                      </span>
                      <span className="text-xs text-gray-500">
                        {acceptedFileTypes.join(', ')} (Max {maxSize}MB)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {fileName && !preview && (
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">{fileName}</span>
                  <Button
                    type="button"
                    onClick={() => clearFile(onChange)}
                    className="p-1 text-red-500 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {fileError && (
                <p className="text-sm text-red-500">{fileError}</p>
              )}
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};