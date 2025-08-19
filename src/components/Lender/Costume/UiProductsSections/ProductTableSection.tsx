"use client"

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { CostumeItemTypeV2 } from "@/types/costumes/costumeTypeV2";
import { formatOfferType } from '@/lib/utils';
import {
    ArrowUpDown,
    ChevronDown,
    ChevronUp,
    Eye,
    MoreHorizontal,
    Pencil,
    Trash2
} from "lucide-react";
import { memo, useMemo, useState, useCallback } from "react";
import Image from "next/image";

interface CostumeTableProps {
    costumes: CostumeItemTypeV2[];
    sortConfig: {
        key: keyof CostumeItemTypeV2 | 'main_rent_offer' | null;
        direction: 'asc' | 'desc' | null;
    };
    onSort: (key: keyof CostumeItemTypeV2 | 'main_rent_offer') => void;
    onViewCostume: (costume: CostumeItemTypeV2) => void;
    onEditCostume: (costumeName: string) => void;
    onDeleteCostume: (costume: CostumeItemTypeV2) => void;
}

// Update getMainPriceDisplay to use rent.main_rent_offer and sale
const getMainPriceDisplay = (costume: CostumeItemTypeV2) => {
    if (costume.listing_type === 'sale' && costume.sale) {
        return `₱${costume.sale.price} (Sale)`;
    }
    if (costume.rent && costume.rent.main_rent_offer) {
        return `₱${costume.rent.main_rent_offer.price} (${formatOfferType(costume.rent.main_rent_offer.type)})`;
    }
    return '-';
};

// Separate component for desktop table row
const DesktopTableRow = memo(({
    costume,
    index,
    onViewCostume,
    onEditCostume,
    onDeleteCostume 
}: {
    costume: CostumeItemTypeV2;
    index: number;
    onViewCostume: (costume: CostumeItemTypeV2) => void;
    onEditCostume: (costumeName: string) => void;
    onDeleteCostume: (costume: CostumeItemTypeV2) => void;
}) => {
    return (
        <TableRow id={index.toString()} className="text-sm">
            <TableCell className="py-2">
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="relative h-10 w-10 md:h-12 md:w-12 rounded-md overflow-hidden flex-shrink-0">
                        <AspectRatio ratio={1} className="w-full h-full">
                            <Image
                                src={costume.main_images.front}
                                alt={costume.name}
                                fill
                                className="object-cover rounded-md"
                                sizes="40px"
                            />
                        </AspectRatio>
                    </div>
                    <div className="max-w-[120px] md:max-w-[200px]">
                        <p className="font-medium truncate" title={costume.name}>
                            {costume.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate" title={costume.brand}>
                            {costume.brand}
                        </p>
                    </div>
                </div>
            </TableCell>
            <TableCell className="py-2">
                <Badge
                    variant="outline"
                    className="truncate max-w-[80px] md:max-w-[100px]"
                    title={costume.category}
                >
                    {costume.category}
                </Badge>
            </TableCell>
            <TableCell className="py-2">
                <Badge
                    variant="secondary"
                    className="capitalize truncate max-w-[80px]"
                >
                    {costume.listing_type}
                </Badge>
            </TableCell>
            <TableCell className="font-medium text-rose-600 py-2 max-w-[100px] truncate" title={getMainPriceDisplay(costume)}>
                {getMainPriceDisplay(costume)}
                {costume.sale && costume.listing_type === 'sale' && costume.sale.discount > 0 && (
                    <span className="text-xs text-gray-500 ml-1">
                        -{costume.sale.discount}%
                    </span>
                )}
            </TableCell>
            <TableCell className="py-2">
                <span className="capitalize text-xs">{costume.gender}</span>
            </TableCell>
            <TableCell className="py-2">
                <span className="text-xs">{costume.sizes}</span>
            </TableCell>
            <TableCell className="py-2">
                <Badge
                    variant={costume.status === 'active' ? 'default' : 'secondary'}
                    className="capitalize truncate max-w-[80px]"
                >
                    {costume.status || 'pending'}
                </Badge>
            </TableCell>
            <TableCell className="text-right py-2">
                <ActionsDropdown
                    costume={costume}
                    onViewCostume={onViewCostume}
                    onEditCostume={onEditCostume}
                    onDeleteCostume={onDeleteCostume}
                />
            </TableCell>
        </TableRow>
    );
});

DesktopTableRow.displayName = 'DesktopTableRow';

// Separate component for mobile card
const MobileCard = memo(({
    costume,
    index,
    isExpanded,
    onToggleExpansion,
    onViewCostume,
    onEditCostume,
    onDeleteCostume
}: {
    costume: CostumeItemTypeV2;
    index: number;
    isExpanded: boolean;
    onToggleExpansion: () => void;
    onViewCostume: (costume: CostumeItemTypeV2) => void;
    onEditCostume: (costumeName: string) => void;
    onDeleteCostume: (costume: CostumeItemTypeV2) => void;
}) => {
    return (
        <div className="rounded-lg shadow-sm border p-2 sm:p-4">
            <div className="flex justify-between items-start gap-2">
                <div className="flex gap-2">
                    <div className="relative h-12 w-12 rounded-md overflow-hidden flex-shrink-0">
                        <AspectRatio ratio={1} className="w-full h-full">
                            <Image
                                src={costume.main_images.front}
                                alt={costume.name}
                                fill
                                className="object-cover rounded-md"
                                sizes="48px"
                            />
                        </AspectRatio>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate max-w-[120px]" title={costume.name}>{costume.name}</h3>
                        <p className="text-xs text-gray-400 truncate max-w-[120px]" title={costume.brand}>
                            {costume.brand}
                        </p>
                        <Badge variant="outline" className="mt-1 truncate max-w-[80px]" title={costume.category}>
                            {costume.category}
                        </Badge>
                    </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                    <ActionsDropdown
                        costume={costume}
                        onViewCostume={onViewCostume}
                        onEditCostume={onEditCostume}
                        onDeleteCostume={onDeleteCostume}
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={onToggleExpansion}
                        aria-label={isExpanded ? "Collapse details" : "Expand details"}
                    >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            {isExpanded && (
                <div className="mt-2 space-y-2 pt-2 border-t">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">Listing Type:</span>
                        <Badge variant="secondary" className="capitalize">{costume.listing_type}</Badge>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">Price:</span>
                        <span className="font-medium text-rose-600 truncate max-w-[100px]" title={getMainPriceDisplay(costume)}>
                            {getMainPriceDisplay(costume)}
                            {costume.sale && costume.listing_type === 'sale' && costume.sale.discount > 0 && (
                                <span className="text-xs text-gray-500 ml-1">
                                    -{costume.sale.discount}%
                                </span>
                            )}
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">Status:</span>
                        <Badge
                            variant={costume.status === 'active' ? 'default' : 'secondary'}
                            className="capitalize truncate max-w-[80px]"
                        >
                            {costume.status || 'pending'}
                        </Badge>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">Gender:</span>
                        <span className="font-medium capitalize truncate max-w-[80px]" title={costume.gender}>{costume.gender}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">Sizes:</span>
                        <span className="text-xs">{costume.sizes}</span>
                    </div>
                </div>
            )}
        </div>
    );
});

MobileCard.displayName = 'MobileCard';

// Reusable actions dropdown component
const ActionsDropdown = memo(({
    costume,
    onViewCostume,
    onEditCostume,
    onDeleteCostume
}: {
    costume: CostumeItemTypeV2;
    onViewCostume: (costume: CostumeItemTypeV2) => void;
    onEditCostume: (costumeName: string) => void;
    onDeleteCostume: (costume: CostumeItemTypeV2) => void;
}) => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label="Open actions menu"
            >
                <MoreHorizontal className="h-4 w-4" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onViewCostume(costume)}>
                <Eye className="h-4 w-4 mr-2" />
                View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEditCostume(costume.name)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
            </DropdownMenuItem>
            <DropdownMenuItem
                onClick={() => onDeleteCostume(costume)}
                className="text-rose-500 focus:text-rose-500"
            >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
));

ActionsDropdown.displayName = 'ActionsDropdown';

// Sort header button component
const SortButton = memo(({
    sortKey,
    children,
    sortConfig,
    onSort
}: {
    sortKey: keyof CostumeItemTypeV2 | 'main_rent_offer';
    children: React.ReactNode;
    sortConfig: { key: keyof CostumeItemTypeV2 | 'main_rent_offer' | null; direction: 'asc' | 'desc' | null; };
    onSort: (key: keyof CostumeItemTypeV2 | 'main_rent_offer') => void;
}) => (
    <button
        onClick={() => onSort(sortKey)}
        className="flex items-center hover:text-gray-900 transition-colors"
        aria-label={`Sort by ${String(sortKey)}`}
    >
        {children}
        {sortConfig.key === sortKey ? (
            sortConfig.direction === "asc" ?
                <ChevronUp className="ml-1 h-4 w-4" /> :
                <ChevronDown className="ml-1 h-4 w-4" />
        ) : (
            <ArrowUpDown className="ml-1 h-4 w-4" />
        )}
    </button>
));

SortButton.displayName = 'SortButton';

// Empty state component
const EmptyState = memo(() => (
    <div className="text-center py-8 text-gray-500">
        No costumes found matching your criteria
    </div>
));

EmptyState.displayName = 'EmptyState';

const CostumeTableSection = memo(({
    costumes,
    sortConfig,
    onSort,
    onViewCostume,
    onEditCostume,
    onDeleteCostume
}: CostumeTableProps) => {
    // Use unique keys based on costume.id and index to prevent collision
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    // Generate unique key for each costume row
    const getRowKey = useCallback((costume: CostumeItemTypeV2, index: number) =>
        `${costume.id || index}-${index}`, []);

    // Toggle expanded state for a row using unique key
    const toggleRowExpansion = useCallback((rowKey: string) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(rowKey)) {
                newSet.delete(rowKey);
            } else {
                newSet.add(rowKey);
            }
            return newSet;
        });
    }, []);

    // Memoize the desktop table header
    const tableHeader = useMemo(() => (
        <TableHeader className="sticky top-0 z-10">
            <TableRow>
                <TableHead className="w-[300px]">Costume</TableHead>
                <TableHead>
                    <SortButton sortKey="category" sortConfig={sortConfig} onSort={onSort}>
                        Category
                    </SortButton>
                </TableHead>
                <TableHead>
                    <SortButton sortKey="listing_type" sortConfig={sortConfig} onSort={onSort}>
                        Listing Type
                    </SortButton>
                </TableHead>
                <TableHead>
                    <SortButton sortKey="main_rent_offer" sortConfig={sortConfig} onSort={onSort}>
                        Price
                    </SortButton>
                </TableHead>
                <TableHead>
                    <SortButton sortKey="gender" sortConfig={sortConfig} onSort={onSort}>
                        Gender
                    </SortButton>
                </TableHead>
                <TableHead>
                    <SortButton sortKey="sizes" sortConfig={sortConfig} onSort={onSort}>
                        Sizes
                    </SortButton>
                </TableHead>
                <TableHead>
                    <SortButton sortKey="status" sortConfig={sortConfig} onSort={onSort}>
                        Status
                    </SortButton>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
            </TableRow>
        </TableHeader>
    ), [sortConfig, onSort]);

    const isEmpty = costumes.length === 0;

    return (
        <div className="w-full">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
                <Table className="min-w-[600px]">
                    {tableHeader}
                    <TableBody>
                        {isEmpty ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                    <EmptyState />
                                </TableCell>
                            </TableRow>
                        ) : (
                            costumes.map((costume, index) => (
                                <DesktopTableRow
                                    key={getRowKey(costume, index)}
                                    costume={costume}
                                    index={index}
                                    onViewCostume={onViewCostume}
                                    onEditCostume={onEditCostume}
                                    onDeleteCostume={onDeleteCostume}
                                />
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-2">
                {isEmpty ? (
                    <EmptyState />
                ) : (
                    costumes.map((costume, index) => {
                        const rowKey = getRowKey(costume, index);
                        return (
                            <MobileCard
                                key={rowKey}
                                costume={costume}
                                index={index}
                                isExpanded={expandedRows.has(rowKey)}
                                onToggleExpansion={() => toggleRowExpansion(rowKey)}
                                onViewCostume={onViewCostume}
                                onEditCostume={onEditCostume}
                                onDeleteCostume={onDeleteCostume}
                            />
                        );
                    })
                )}
            </div>
        </div>
    );
});

CostumeTableSection.displayName = 'CostumeTableSection';

export default CostumeTableSection;