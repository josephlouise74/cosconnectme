import { memo } from "react";
import { ChevronUp, ChevronDown, ArrowUpDown } from "lucide-react";
import { Costume } from "@/lib/api/costumeApi";

interface SortButtonProps {
    sortKey: keyof Costume | "rental_price" | "sale_price";
    children: React.ReactNode;
    sortConfig: {
        key: keyof Costume | "rental_price" | "sale_price" | null;
        direction: "asc" | "desc" | null;
    };
    onSort: (key: keyof Costume | "rental_price" | "sale_price") => void;
}

const SortButton = memo(({ sortKey, children, sortConfig, onSort }: SortButtonProps) => (
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
));

SortButton.displayName = "SortButton";

export default SortButton;
