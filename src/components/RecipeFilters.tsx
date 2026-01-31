'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  availableCuisines,
  availableCategories,
  RecipeFilters as FilterType,
  SortOption,
} from '@/lib/recipeDatabase';
import {
  Filter,
  Search,
  X,
  Clock,
  ChefHat,
  Globe,
  Star,
  ArrowUpDown,
  SlidersHorizontal,
} from 'lucide-react';

interface RecipeFiltersProps {
  filters: FilterType;
  sortBy: SortOption;
  onFiltersChange: (filters: FilterType) => void;
  onSortChange: (sort: SortOption) => void;
  totalResults: number;
}

const COOK_TIME_OPTIONS = [
  { value: '15', label: '15 min or less' },
  { value: '30', label: '30 min or less' },
  { value: '45', label: '45 min or less' },
  { value: '60', label: '1 hour or less' },
  { value: '120', label: '2 hours or less' },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'match', label: 'Best Match' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'time-asc', label: 'Quickest First' },
  { value: 'time-desc', label: 'Longest First' },
  { value: 'difficulty-asc', label: 'Easiest First' },
  { value: 'difficulty-desc', label: 'Hardest First' },
  { value: 'name', label: 'A-Z' },
];

export function RecipeFiltersComponent({
  filters,
  sortBy,
  onFiltersChange,
  onSortChange,
  totalResults,
}: RecipeFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.searchQuery || '');

  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== undefined && v !== ''
  ).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ ...filters, searchQuery: searchInput || undefined });
  };

  const clearFilter = (key: keyof FilterType) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
    if (key === 'searchQuery') setSearchInput('');
  };

  const clearAllFilters = () => {
    onFiltersChange({});
    setSearchInput('');
  };

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search recipes, ingredients..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      {/* Quick Filters Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4">
        {/* Filter Sheet Trigger */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="flex-shrink-0">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="ml-2 bg-emerald-500">{activeFilterCount}</Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader>
              <SheetTitle className="flex items-center justify-between">
                <span>Filter Recipes</span>
                {activeFilterCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                    Clear All
                  </Button>
                )}
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-6 overflow-y-auto">
              {/* Cuisine */}
              <div>
                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4" />
                  Cuisine
                </label>
                <Select
                  value={filters.cuisine || '_all'}
                  onValueChange={(v) =>
                    onFiltersChange({ ...filters, cuisine: v === '_all' ? undefined : v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All cuisines" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">All cuisines</SelectItem>
                    {availableCuisines.map((cuisine) => (
                      <SelectItem key={cuisine} value={cuisine}>
                        {cuisine}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category */}
              <div>
                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                  <ChefHat className="w-4 h-4" />
                  Category
                </label>
                <Select
                  value={filters.category || '_all'}
                  onValueChange={(v) =>
                    onFiltersChange({ ...filters, category: v === '_all' ? undefined : v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">All categories</SelectItem>
                    {availableCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Difficulty */}
              <div>
                <label className="text-sm font-medium mb-2 block">Difficulty</label>
                <div className="flex gap-2">
                  {['Easy', 'Medium', 'Hard'].map((diff) => (
                    <Button
                      key={diff}
                      variant={filters.difficulty === diff ? 'default' : 'outline'}
                      size="sm"
                      onClick={() =>
                        onFiltersChange({
                          ...filters,
                          difficulty:
                            filters.difficulty === diff
                              ? undefined
                              : (diff as 'Easy' | 'Medium' | 'Hard'),
                        })
                      }
                      className={
                        filters.difficulty === diff
                          ? 'bg-emerald-500 hover:bg-emerald-600'
                          : ''
                      }
                    >
                      {diff}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Cook Time */}
              <div>
                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4" />
                  Max Cooking Time
                </label>
                <Select
                  value={filters.maxCookTime?.toString() || '_any'}
                  onValueChange={(v) =>
                    onFiltersChange({
                      ...filters,
                      maxCookTime: v === '_any' ? undefined : parseInt(v),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_any">Any time</SelectItem>
                    {COOK_TIME_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Min Rating */}
              <div>
                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4" />
                  Minimum Rating
                </label>
                <div className="flex gap-2">
                  {[3, 4, 4.5].map((rating) => (
                    <Button
                      key={rating}
                      variant={filters.minRating === rating ? 'default' : 'outline'}
                      size="sm"
                      onClick={() =>
                        onFiltersChange({
                          ...filters,
                          minRating: filters.minRating === rating ? undefined : rating,
                        })
                      }
                      className={
                        filters.minRating === rating
                          ? 'bg-amber-500 hover:bg-amber-600'
                          : ''
                      }
                    >
                      {rating}+ ★
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                className="w-full bg-emerald-500 hover:bg-emerald-600"
                onClick={() => setIsOpen(false)}
              >
                Show {totalResults} Results
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Sort Dropdown */}
        <Select value={sortBy} onValueChange={(v) => onSortChange(v as SortOption)}>
          <SelectTrigger className="w-[140px] flex-shrink-0">
            <ArrowUpDown className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Quick difficulty filters */}
        <div className="flex gap-1 flex-shrink-0">
          {['Easy', 'Medium', 'Hard'].map((diff) => (
            <Badge
              key={diff}
              variant={filters.difficulty === diff ? 'default' : 'outline'}
              className={`cursor-pointer ${
                filters.difficulty === diff
                  ? 'bg-emerald-500'
                  : 'hover:bg-muted'
              }`}
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  difficulty:
                    filters.difficulty === diff
                      ? undefined
                      : (diff as 'Easy' | 'Medium' | 'Hard'),
                })
              }
            >
              {diff}
            </Badge>
          ))}
        </div>
      </div>

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Search: {filters.searchQuery}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => clearFilter('searchQuery')}
              />
            </Badge>
          )}
          {filters.cuisine && (
            <Badge variant="secondary" className="gap-1">
              {filters.cuisine}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => clearFilter('cuisine')}
              />
            </Badge>
          )}
          {filters.category && (
            <Badge variant="secondary" className="gap-1">
              {filters.category}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => clearFilter('category')}
              />
            </Badge>
          )}
          {filters.maxCookTime && (
            <Badge variant="secondary" className="gap-1">
              ≤{filters.maxCookTime} min
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => clearFilter('maxCookTime')}
              />
            </Badge>
          )}
          {filters.minRating && (
            <Badge variant="secondary" className="gap-1">
              {filters.minRating}+ ★
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => clearFilter('minRating')}
              />
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs"
            onClick={clearAllFilters}
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        {totalResults} recipe{totalResults !== 1 ? 's' : ''} found
      </p>
    </div>
  );
}
