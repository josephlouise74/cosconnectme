"use client";

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
    TableRow,
} from "@/components/ui/table";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
    ArrowUpDown,
    ChevronDown,
    ChevronUp,
    Eye,
    MoreHorizontal,
    Pencil,
    Trash2,
} from "lucide-react";
import Image from "next/image";
import { memo, useCallback, useMemo, useState } from "react";
import { Costume } from "@/lib/api/costumeApi";

interface CostumeTableProps {
    costumes: Costume[];
    sortConfig: {
        key: keyof Costume | "rental_price" | "sale_price" | null;
        direction: "asc" | "desc" | null;
    };
    onSort: (key: keyof Costume | "rental_price" | "sale_price") => void;
    onViewCostume: (costume: Costume) => void;
    onEditCostume: (costumeName: string) => void;
    onDeleteCostume: (costume: Costume) => void;
}

// Utility for price display - updated to match new schema
const getPriceDisplay = (costume: Costume) => {
    const rentalPrice = parseFloat(costume.rental_price) || 0;
    const salePrice = parseFloat(costume.sale_price) || 0;

    if (costume.listing_type === 'rent') {
        return `₱${rentalPrice.toFixed(2)}/day`;
    } else if (costume.listing_type === 'sale') {
        return `₱${salePrice.toFixed(2)}`;
    } else if (costume.listing_type === 'both') {
        return `₱${rentalPrice.toFixed(2)}/day | ₱${salePrice.toFixed(2)}`;
    }
    return '₱0.00';
};

// Utility for status badge variant
const getStatusBadgeVariant = (status: Costume["status"]) => {
    switch (status) {
        case "active":
            return "default";
        case "rented":
            return "secondary";
        case "inactive":
            return "outline";
        case "maintenance":
            return "destructive";
        default:
            return "outline";
    }
};

// Utility to get main image - updated for new schema
const getMainImage = (costume: Costume) => {
    // Try main_images.front first, then fallback to additional_images
    if (costume.main_images?.front) {
        return costume.main_images.front;
    }
    if (costume.additional_images?.length > 0) {
        return costume.additional_images[0]?.url;
    }
    return "/placeholder.png";
};

// Desktop row
const DesktopTableRow = memo(
    ({
        costume,
        index,
        onViewCostume,
        onEditCostume,
        onDeleteCostume,
    }: {
        costume: Costume;
        index: number;
        onViewCostume: (costume: Costume) => void;
        onEditCostume: (costumeName: string) => void;
        onDeleteCostume: (costume: Costume) => void;
    }) => {
        const mainImage = getMainImage(costume);

        return (
            <TableRow id={index.toString()} className="text-sm hover:bg-muted/50">
                <TableCell className="py-2">
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="relative h-10 w-10 md:h-12 md:w-12 rounded-md overflow-hidden flex-shrink-0 border">
                            <AspectRatio ratio={1} className="w-full h-full">
                                <Image
                                    src={mainImage as string}
                                    alt={costume.name}
                                    fill
                                    className="object-cover rounded-md"
                                    sizes="48px"
                                />
                            </AspectRatio>
                        </div>
                        <div className="max-w-[160px] md:max-w-[240px]">
                            <p className="font-medium truncate" title={costume.name}>
                                {costume.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate" title={costume.description}>
                                {costume.description}
                            </p>
                            {costume.brand && (
                                <p className="text-xs text-muted-foreground/70 truncate" title={costume.brand}>
                                    {costume.brand}
                                </p>
                            )}
                        </div>
                    </div>
                </TableCell>
                <TableCell className="py-2">
                    <Badge variant="outline" className="truncate max-w-[100px]" title={costume.category}>
                        {costume.category}
                    </Badge>
                </TableCell>
                <TableCell className="font-medium text-primary py-2 max-w-[120px]">
                    <div className="truncate" title={getPriceDisplay(costume)}>
                        {getPriceDisplay(costume)}
                    </div>
                    <Badge variant="secondary" className="text-xs mt-1 capitalize">
                        {costume.listing_type}
                    </Badge>
                </TableCell>
                <TableCell className="py-2">
                    <Badge
                        variant={getStatusBadgeVariant(costume.status)}
                        className="capitalize truncate max-w-[90px]"
                    >
                        {costume.status}
                    </Badge>
                    {!costume.is_available && (
                        <div className="text-xs text-muted-foreground mt-1">Unavailable</div>
                    )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground py-2">
                    {new Date(costume.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    })}
                </TableCell>
                <TableCell className="text-right py-2">
                    <div className="flex items-center justify-end gap-2">

                        <ActionsDropdown
                            costume={costume}
                            onViewCostume={onViewCostume}
                            onEditCostume={onEditCostume}
                            onDeleteCostume={onDeleteCostume}
                        />
                    </div>
                </TableCell>
            </TableRow>
        );
    }
);

DesktopTableRow.displayName = "DesktopTableRow";

// Mobile card
const MobileCard = memo(
    ({
        costume,
        index,
        isExpanded,
        onToggleExpansion,
        onViewCostume,
        onEditCostume,
        onDeleteCostume,
    }: {
        costume: Costume;
        index: number;
        isExpanded: boolean;
        onToggleExpansion: () => void;
        onViewCostume: (costume: Costume) => void;
        onEditCostume: (costumeName: string) => void;
        onDeleteCostume: (costume: Costume) => void;
    }) => {
        const mainImage = getMainImage(costume);

        return (
            <div className="rounded-lg shadow-sm border p-3 bg-card">
                <div className="flex justify-between items-start gap-3">
                    <div className="flex gap-3 flex-1 min-w-0">
                        <div className="relative h-12 w-12 rounded-md overflow-hidden flex-shrink-0 border">
                            <AspectRatio ratio={1} className="w-full h-full">
                                <Image
                                    src={mainImage as string}
                                    alt={costume.name}
                                    fill
                                    className="object-cover rounded-md"
                                    sizes="48px"
                                />
                            </AspectRatio>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate" title={costume.name}>
                                {costume.name}
                            </h3>
                            <p className="text-xs text-muted-foreground truncate" title={costume.description}>
                                {costume.description}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                    {costume.category}
                                </Badge>
                                <Badge
                                    variant={getStatusBadgeVariant(costume.status)}
                                    className="text-xs capitalize"
                                >
                                    {costume.status}
                                </Badge>
                            </div>
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
                        >
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>

                {isExpanded && (
                    <div className="mt-3 space-y-2 pt-3 border-t text-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Price:</span>
                            <div className="text-right">
                                <div className="font-medium text-primary">{getPriceDisplay(costume)}</div>
                                <Badge variant="secondary" className="text-xs capitalize mt-1">
                                    {costume.listing_type}
                                </Badge>
                            </div>
                        </div>
                        {costume.brand && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Brand:</span>
                                <span>{costume.brand}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Gender:</span>
                            <Badge variant="outline" className="text-xs capitalize">
                                {costume.gender}
                            </Badge>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Sizes:</span>
                            <span className="text-xs">{costume.sizes}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Available:</span>
                            <Badge variant={costume.is_available ? "default" : "secondary"} className="text-xs">
                                {costume.is_available ? "Yes" : "No"}
                            </Badge>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Created:</span>
                            <span className="text-xs">
                                {new Date(costume.created_at).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </span>
                        </div>
                        {costume.tags.length > 0 && (
                            <div className="flex justify-between items-start">
                                <span className="text-muted-foreground">Tags:</span>
                                <div className="flex flex-wrap gap-1 max-w-[200px] justify-end">
                                    {costume.tags.slice(0, 3).map((tag, tagIndex) => (
                                        <Badge key={tagIndex} variant="outline" className="text-xs">
                                            {tag}
                                        </Badge>
                                    ))}
                                    {costume.tags.length > 3 && (
                                        <Badge variant="outline" className="text-xs">
                                            +{costume.tags.length - 3}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }
);

MobileCard.displayName = "MobileCard";

// Actions dropdown
const ActionsDropdown = memo(
    ({
        costume,
        onViewCostume,
        onEditCostume,
        onDeleteCostume,
    }: {
        costume: Costume;
        onViewCostume: (costume: Costume) => void;
        onEditCostume: (costumeName: string) => void;
        onDeleteCostume: (costume: Costume) => void;
    }) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => onViewCostume(costume)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEditCostume(costume.name)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => onDeleteCostume(costume)}
                    className="text-destructive focus:text-destructive"
                >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
);

ActionsDropdown.displayName = "ActionsDropdown";

// Sort button
const SortButton = memo(
    ({
        sortKey,
        children,
        sortConfig,
        onSort,
    }: {
        sortKey: keyof Costume | "rental_price" | "sale_price";
        children: React.ReactNode;
        sortConfig: {
            key: keyof Costume | "rental_price" | "sale_price" | null;
            direction: "asc" | "desc" | null;
        };
        onSort: (key: keyof Costume | "rental_price" | "sale_price") => void;
    }) => (
        <button
            onClick={() => onSort(sortKey)}
            className="flex items-center hover:text-foreground transition-colors text-left"
        >
            {children}
            {sortConfig.key === sortKey ? (
                sortConfig.direction === "asc" ? (
                    <ChevronUp className="ml-1 h-4 w-4 text-muted-foreground" />
                ) : (
                    <ChevronDown className="ml-1 h-4 w-4 text-muted-foreground" />
                )
            ) : (
                <ArrowUpDown className="ml-1 h-4 w-4 text-muted-foreground" />
            )}
        </button>
    )
);

SortButton.displayName = "SortButton";

const EmptyState = () => (
    <div className="text-center py-12">
        <div className="text-muted-foreground mb-2">No costumes found</div>
        <p className="text-sm text-muted-foreground/70">
            Your costume listings will appear here
        </p>
    </div>
);

const CostumeTableSection = memo(
    ({ costumes, sortConfig, onSort, onViewCostume, onEditCostume, onDeleteCostume }: CostumeTableProps) => {
        const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

        const getRowKey = useCallback((costume: Costume, index: number) => `${costume.id}-${index}`, []);

        const toggleRowExpansion = useCallback((rowKey: string) => {
            setExpandedRows((prev) => {
                const newSet = new Set(prev);
                if (newSet.has(rowKey)) {
                    newSet.delete(rowKey);
                } else {
                    newSet.add(rowKey);
                }
                return newSet;
            });
        }, []);

        const tableHeader = useMemo(
            () => (
                <TableHeader className="sticky top-0 z-10 bg-background">
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[280px]">Costume</TableHead>
                        <TableHead className="w-[120px]">
                            <SortButton sortKey="category" sortConfig={sortConfig} onSort={onSort}>
                                Category
                            </SortButton>
                        </TableHead>
                        <TableHead className="w-[140px]">
                            <SortButton sortKey="rental_price" sortConfig={sortConfig} onSort={onSort}>
                                Price
                            </SortButton>
                        </TableHead>
                        <TableHead className="w-[120px]">
                            <SortButton sortKey="status" sortConfig={sortConfig} onSort={onSort}>
                                Status
                            </SortButton>
                        </TableHead>
                        <TableHead className="w-[100px]">
                            <SortButton sortKey="created_at" sortConfig={sortConfig} onSort={onSort}>
                                Created
                            </SortButton>
                        </TableHead>
                        <TableHead className="text-right w-[100px]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
            ),
            [sortConfig, onSort]
        );

        const isEmpty = costumes.length === 0;

        return (
            <div className="w-full">
                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto rounded-md border">
                    <Table className="min-w-[800px]">
                        {tableHeader}
                        <TableBody>
                            {isEmpty ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32">
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

                {/* Mobile cards */}
                <div className="md:hidden space-y-3">
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
    }
);

CostumeTableSection.displayName = "CostumeTableSection";

export default CostumeTableSection;