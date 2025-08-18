// Product related types
export interface MainImagesType {
    front: File | null;
    back: File | null;
}

export interface AdditionalImageType {
    id: string;
    file: File;
    preview: string;
}
