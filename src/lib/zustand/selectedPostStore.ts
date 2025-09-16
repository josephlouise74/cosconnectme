import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface SelectedPostStore {
    selectedPost: any | null;
    isLoading: boolean;
    error: string | null;
    setSelectedPost: (post: any | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clearSelectedPost: () => void;
}

const useSelectedPostStore = create<SelectedPostStore>()(
    devtools((set) => ({
        selectedPost: null,
        isLoading: false,
        error: null,
        setSelectedPost: (post) => set({ selectedPost: post }, false, 'setSelectedPost'),
        setLoading: (loading) => set({ isLoading: loading }, false, 'setLoading'),
        setError: (error) => set({ error }, false, 'setError'),
        clearSelectedPost: () => set({ selectedPost: null, isLoading: false, error: null }, false, 'clearSelectedPost'),
    }))
);

export default useSelectedPostStore; 