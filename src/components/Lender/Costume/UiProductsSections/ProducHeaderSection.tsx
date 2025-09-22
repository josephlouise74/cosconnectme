
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Costume } from "@/lib/api/costumeApi";
import { FilterX, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProductHeaderProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;

    categoryFilter: string | null;
    onCategoryFilterChange: (category: string | null) => void;
    categories: string[];

    statusFilter: string | null;
    onStatusFilterChange: (status: string | null) => void;
    statuses: Costume["status"][]; // strongly typed from Costume

    onResetFilters: () => void;
}

const ProductHeader = ({
    searchQuery,
    onSearchChange,
    categoryFilter,
    onCategoryFilterChange,
    categories,
    statusFilter,
    onStatusFilterChange,
    statuses,
    onResetFilters,
}: ProductHeaderProps) => {
    const router = useRouter();

    const handleAddNew = () => {
        router.push("/lender/products/create");
    };

    const hasActiveFilters =
        !!searchQuery ||
        (categoryFilter && categoryFilter !== "all") ||
        (statusFilter && statusFilter !== "all");

    return (
        <div className="space-y-4">
            {/* Header row */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Costumes</h2>
                <Button onClick={handleAddNew} className="whitespace-nowrap">
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Add New
                </Button>
            </div>

            {/* Filters row */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {/* Search */}
                <div className="flex-1">
                    <Input
                        placeholder="Search costumes..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="sm:max-w-xs"
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                    {/* Category Filter */}
                    <Select
                        value={categoryFilter || "all"}
                        onValueChange={(value) =>
                            onCategoryFilterChange(value === "all" ? null : value)
                        }
                    >
                        <SelectTrigger className="sm:w-[150px]">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                    {category}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Status Filter */}
                    <Select
                        value={statusFilter || "all"}
                        onValueChange={(value) =>
                            onStatusFilterChange(value === "all" ? null : value)
                        }
                    >
                        <SelectTrigger className="sm:w-[150px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            {statuses.map((status) => (
                                <SelectItem key={status} value={status}>
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Reset Filters */}
                    {hasActiveFilters && (
                        <Button
                            variant="outline"
                            onClick={onResetFilters}
                            className="flex items-center"
                        >
                            <FilterX className="mr-2 h-4 w-4" />
                            Reset
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductHeader;
