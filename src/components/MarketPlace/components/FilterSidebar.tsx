"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"
import React, { useMemo } from "react"
import type { FilterSidebarProps, FilterState } from "../types"

import { useFetchAllCategories } from "@/lib/api/categoryApi"

import { X } from "lucide-react"
import { useGetAllTags } from "@/lib/api/tagsApi"

interface SelectableTag {
  value: string
  label: string
}

const FilterSidebar = ({ filters, form, minMaxPrice, isOpen, onClose }: FilterSidebarProps) => {
  // Handler for price range changes
  const handlePriceChange = (value: number[]) => {
    form.setValue("priceRange", [value[0], value[1]] as [number, number])
  }

  // Handler for category changes
  const handleCategoryChange = (category: string) => {
    form.setValue("category", category as any)
  }

  // Handler for tag selection
  const handleTagChange = (tag: string, checked: boolean) => {
    const currentTags = form.getValues("tags") || []
    form.setValue("tags", checked ? [...currentTags, tag] : currentTags.filter((t: string) => t !== tag))
  }

  // Handler for gender selection
  const handleGenderChange = (gender: string) => {
    form.setValue("gender", gender)
  }

  // Handler for sort selection
  const handleSortChange = (sort: "newest" | "price-low" | "price-high" | "popular") => {
    form.setValue("sort", sort)
  }

  // Reset all filters
  const resetFilters = () => {
    form.reset({
      search: "",
      category: "",
      priceRange: minMaxPrice,
      tags: [],
      gender: "",
      sort: "newest",
    })
  }

  // Fetch categories from API
  const { data: categoriesData, isLoading: isCategoriesLoading } = useFetchAllCategories({
    page: 1,
    limit: 100,
  })

  // Fetch tags from API
  const { tags: availableTags, isLoading: isTagsLoading } = useGetAllTags({
    page: 1,
    limit: 100,
  })

  // Memoize categories to prevent unnecessary re-renders
  const categories = useMemo(() => {
    if (!categoriesData?.data?.categories) return []
    return categoriesData.data.categories.map((category) => ({
      value: category.categoryName,
      label: category.categoryName,
    }))
  }, [categoriesData])

  // Memoize tags to prevent unnecessary re-renders
  const tags = useMemo<SelectableTag[]>(() => {
    if (!availableTags) return []
    return availableTags.map((tag) => ({
      value: tag.tagName,
      label: tag.tagName,
    }))
  }, [availableTags])

  // Get popular tags (first 15)
  const popularTags = useMemo<SelectableTag[]>(() => {
    return tags.slice(0, 15)
  }, [tags])

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-80 sm:w-96 p-0 overflow-hidden">
        <SheetHeader className="p-4 border-b">
          <div className="flex justify-between items-center">
            <SheetTitle>Filters</SheetTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-5rem)] p-4">
          <div className="space-y-6">
            {/* Price Range Filter */}
            <div>
              <h3 className="font-medium mb-3">Price Range</h3>
              <div className="space-y-4">
                <Slider
                  defaultValue={[filters.priceRange[0], filters.priceRange[1]]}
                  min={minMaxPrice[0]}
                  max={minMaxPrice[1]}
                  step={10}
                  value={[filters.priceRange[0], filters.priceRange[1]]}
                  onValueChange={handlePriceChange}
                  className="mb-6"
                />
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={filters.priceRange[0]}
                    onChange={(e) => handlePriceChange([Number.parseInt(e.target.value), filters.priceRange[1]])}
                    className="h-9"
                    placeholder="Min"
                  />
                  <span>to</span>
                  <Input
                    type="number"
                    value={filters.priceRange[1]}
                    onChange={(e) => handlePriceChange([filters.priceRange[0], Number.parseInt(e.target.value)])}
                    className="h-9"
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <h3 className="font-medium mb-3">Category</h3>
              <RadioGroup value={filters.category} onValueChange={handleCategoryChange} className="space-y-1">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="" id="category-all" />
                  <Label htmlFor="category-all">All Categories</Label>
                </div>
                {isCategoriesLoading ? (
                  <div className="text-sm text-gray-500">Loading categories...</div>
                ) : categories.length === 0 ? (
                  <div className="text-sm text-gray-500">No categories available</div>
                ) : (
                  categories.map((category, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={category.value} id={`category-${category.value}`} />
                      <Label htmlFor={`category-${category.value}`}>{category.label}</Label>
                    </div>
                  ))
                )}
              </RadioGroup>
            </div>

            {/* Gender Filter */}
            <div>
              <h3 className="font-medium mb-3">Gender</h3>
              <RadioGroup value={filters.gender} onValueChange={handleGenderChange} className="space-y-1">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="" id="gender-all" />
                  <Label htmlFor="gender-all">All</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="gender-male" />
                  <Label htmlFor="gender-male">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="gender-female" />
                  <Label htmlFor="gender-female">Female</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="unisex" id="gender-unisex" />
                  <Label htmlFor="gender-unisex">Unisex</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Sizes Filter */}
            <div>
              <h3 className="font-medium mb-3">Sizes</h3>
              <div className="flex flex-wrap gap-2">
                {["XS", "S", "M", "L", "XL", "XXL"].map((size) => {
                  const selectedSizes = Array.isArray(filters.sizes) ? filters.sizes : []
                  return (
                    <Button
                      key={size}
                      variant={selectedSizes.includes(size) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const checked = !selectedSizes.includes(size)
                        form.setValue(
                          "sizes",
                          checked ? [...selectedSizes, size] : selectedSizes.filter((s: string) => s !== size),
                        )
                      }}
                      className="rounded-full text-xs h-7"
                    >
                      {size}
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Popular Tags */}
            <div>
              <h3 className="font-medium mb-3">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                {isTagsLoading ? (
                  <div className="text-sm text-gray-500">Loading tags...</div>
                ) : popularTags.length === 0 ? (
                  <div className="text-sm text-gray-500">No tags available</div>
                ) : (
                  popularTags.map((tag) => (
                    <Button
                      key={tag.value}
                      variant={filters.tags.includes(tag.value) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleTagChange(tag.value, !filters.tags.includes(tag.value))}
                      className="rounded-full text-xs h-7"
                    >
                      {tag.label}
                    </Button>
                  ))
                )}
              </div>
            </div>

            {/* All Tags */}
            <div>
              <h3 className="font-medium mb-3">All Tags</h3>
              <div className="space-y-1 max-h-40 overflow-y-auto pr-2">
                {isTagsLoading ? (
                  <div className="text-sm text-gray-500">Loading tags...</div>
                ) : tags.length === 0 ? (
                  <div className="text-sm text-gray-500">No tags available</div>
                ) : (
                  tags.map((tag, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tag-${tag.value}`}
                        checked={filters.tags.includes(tag.value)}
                        onCheckedChange={(checked) => handleTagChange(tag.value, checked as boolean)}
                      />
                      <Label htmlFor={`tag-${tag.value}`} className="text-sm">
                        {tag.label}
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Sort By */}
            <div>
              <h3 className="font-medium mb-3">Sort By</h3>
              <RadioGroup
                value={filters.sort}
                onValueChange={(value) => handleSortChange(value as FilterState["sort"])}
                className="space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="newest" id="sort-newest" />
                  <Label htmlFor="sort-newest">Newest</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="price-low" id="sort-price-low" />
                  <Label htmlFor="sort-price-low">Price: Low to High</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="price-high" id="sort-price-high" />
                  <Label htmlFor="sort-price-high">Price: High to Low</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Reset Button */}
            <Button variant="outline" className="w-full bg-transparent" onClick={resetFilters}>
              Reset Filters
            </Button>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

export default React.memo(FilterSidebar)
