import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Filter, Search, Star } from "lucide-react";

interface ProductFiltersProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    categoryFilter: string | null;
    onCategoryFilterChange: (category: string | null) => void;
    ratingFilter: number | null;
    onRatingFilterChange: (rating: number | null) => void;
    categories: string[];
}

const ProductFiltersSection = ({
    searchQuery,
    onSearchChange,
    categoryFilter,
    onCategoryFilterChange,
    ratingFilter,
    onRatingFilterChange,
    categories
}: ProductFiltersProps) => {
    return (
        <div className="flex flex-col sm:flex-row w-full sm:w-auto items-start sm:items-center gap-3">
            <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4" />
                <Input
                    placeholder="Search products..."
                    className="pl-8 w-full"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-1 w-full sm:w-auto mt-2 sm:mt-0">
                        <Filter className="h-4 w-4" />
                        <span>Filters</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <div className="p-2">
                        <p className="font-medium mb-2">Category</p>
                        <div className="flex flex-col gap-1">
                            <Button
                                variant={categoryFilter === null ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => onCategoryFilterChange(null)}
                                className="justify-start"
                            >
                                All
                            </Button>
                            {categories.map((category) => (
                                <Button
                                    key={category}
                                    variant={categoryFilter === category ? "secondary" : "ghost"}
                                    size="sm"
                                    onClick={() => onCategoryFilterChange(category)}
                                    className="justify-start"
                                >
                                    {category}
                                </Button>
                            ))}
                        </div>

                        <p className="font-medium mt-4 mb-2">Rating</p>
                        <div className="flex flex-col gap-1">
                            <Button
                                variant={ratingFilter === null ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => onRatingFilterChange(null)}
                                className="justify-start"
                            >
                                All
                            </Button>
                            {[5, 4, 3].map((rating) => (
                                <Button
                                    key={rating}
                                    variant={ratingFilter === rating ? "secondary" : "ghost"}
                                    size="sm"
                                    onClick={() => onRatingFilterChange(rating)}
                                    className="justify-start"
                                >
                                    {rating}+ <Star className="ml-1 h-3 w-3 fill-current" />
                                </Button>
                            ))}
                        </div>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};

export default ProductFiltersSection;