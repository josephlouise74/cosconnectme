"use client";

import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/lib/hooks/useDebounce';

import { useVirtualizer } from '@tanstack/react-virtual';
import { Loader2, X } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';

interface TagSelectorProps {
    availableTags: string[];
    selectedTags: string[];
    onTagSelect: (tag: string) => void;
    onTagRemove: (tag: string) => void;
    isLoading?: boolean;
}

const TagSelector: React.FC<TagSelectorProps> = React.memo(({
    availableTags,
    selectedTags,
    onTagSelect,
    onTagRemove,
    isLoading
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const parentRef = React.useRef<HTMLDivElement>(null);

    // Memoize filtered tags for better performance
    const filteredTags = useMemo(() => {
        if (!debouncedSearchTerm) return [];
        return availableTags
            .filter(tag => !selectedTags.includes(tag))
            .filter(tag => tag.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
            .slice(0, 50); // Limit to 50 results for better performance
    }, [availableTags, selectedTags, debouncedSearchTerm]);

    // Virtualize the list for better performance with large datasets
    const rowVirtualizer = useVirtualizer({
        count: filteredTags.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 35, // Estimated height of each row
        overscan: 5, // Number of items to render outside of the visible area
    });

    const handleTagSelect = useCallback((tag: string) => {
        onTagSelect(tag);
        setSearchTerm("");
    }, [onTagSelect]);

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-2 mb-2">
                {selectedTags.map(tag => (
                    <Badge
                        key={tag}
                        variant="secondary"
                        className="flex items-center gap-1 px-2 py-1"
                    >
                        {tag}
                        <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => onTagRemove(tag)}
                        />
                    </Badge>
                ))}
            </div>

            <div className="relative">
                <Input
                    placeholder="Search and add tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-8"
                />
                {isLoading && (
                    <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                )}

                {filteredTags.length > 0 && (
                    <div
                        ref={parentRef}
                        className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-auto"
                    >
                        <div
                            style={{
                                height: `${rowVirtualizer.getTotalSize()}px`,
                                width: '100%',
                                position: 'relative',
                            }}
                        >
                            {rowVirtualizer.getVirtualItems().map((virtualRow, index) => {
                                const tag = filteredTags[virtualRow.index];
                                return (
                                    <div
                                        key={index}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: `${virtualRow.size}px`,
                                            transform: `translateY(${virtualRow.start}px)`,
                                        }}
                                    >
                                        <div
                                            className="px-4 py-2 hover:bg-rose-50 text-black cursor-pointer text-sm"
                                            onClick={() => handleTagSelect(tag as string)}
                                        >
                                            {tag}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

TagSelector.displayName = "TagSelector";

export default TagSelector;