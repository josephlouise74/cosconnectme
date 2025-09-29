"use client"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Search, SlidersHorizontal, X } from "lucide-react"
import type React from "react"
import { useCallback, useEffect, useMemo } from "react"
import type { UseFormReturn } from "react-hook-form"

interface SearchBarProps {
    search: string
    form: UseFormReturn<any> // External form from marketplace section
    onFilter: () => void
    placeholder?: string
    showFilterButton?: boolean
    isLoading?: boolean
}

const SearchBar = ({
    search,
    form,
    onFilter,
    placeholder = "Search costumes by name, brand, category, or tags...",
    showFilterButton = true,
    isLoading = false,
}: SearchBarProps) => {
    const currentSearchValue = form.watch("search") || ""

    // Update local form value when search prop changes
    useEffect(() => {
        if (search !== currentSearchValue) {
            form.setValue("search", search)
        }
    }, [search, currentSearchValue, form])

    const onSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault()
        // Trigger search only when form is submitted
        onFilter()
    }, [onFilter])

    const handleClearSearch = useCallback(() => {
        form.setValue("search", "")
    }, [form])

    const hasSearchValue = useMemo(() => currentSearchValue.length > 0, [currentSearchValue])

    return (
        <Form {...form}>
            <form onSubmit={onSubmit} className="flex w-full gap-2">
                <FormField
                    control={form.control}
                    name="search"
                    render={({ field }) => (
                        <FormItem className="flex-1 m-0 w-full">
                            <FormControl>
                                <div className="relative w-full flex items-center">
                                    <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                                    <Input
                                        type="text"
                                        placeholder={placeholder}
                                        className="pl-9 pr-10 flex-1 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                        disabled={isLoading}
                                        {...field}
                                        onChange={(e) => {
                                            field.onChange(e)
                                        }}
                                    />
                                    {hasSearchValue && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-2 h-6 w-6 p-0 hover:bg-muted rounded-full"
                                            onClick={handleClearSearch}
                                            disabled={isLoading}
                                        >
                                            <X className="h-3 w-3" />
                                            <span className="sr-only">Clear search</span>
                                        </Button>
                                    )}
                                </div>
                            </FormControl>
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isLoading} className="min-w-[80px] transition-all duration-200">
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            <span className="hidden sm:inline">Searching...</span>
                        </div>
                    ) : (
                        <>
                            <Search className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Search</span>
                        </>
                    )}
                </Button>

                {showFilterButton && (
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={onFilter}
                        className="md:hidden transition-all duration-200 hover:bg-muted bg-transparent"
                        disabled={isLoading}
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open filters</span>
                    </Button>
                )}
            </form>
        </Form>
    )
}

export default SearchBar
