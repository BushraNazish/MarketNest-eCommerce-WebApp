import { useEffect, useState } from 'react';
import type { Category } from '../../types/product';
import { productService } from '../../services/productService';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface FilterSidebarProps {
    onFilterChange: (filters: { categoryId?: string; minPrice?: number; maxPrice?: number }) => void;
    currentFilters: { categoryId?: string; minPrice?: number; maxPrice?: number };
}

export function FilterSidebar({ onFilterChange, currentFilters }: FilterSidebarProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [minPrice, setMinPrice] = useState(currentFilters.minPrice?.toString() || '');
    const [maxPrice, setMaxPrice] = useState(currentFilters.maxPrice?.toString() || '');

    useEffect(() => {
        productService.getAllCategories().then(setCategories).catch(console.error);
    }, []);

    const handleApply = () => {
        onFilterChange({
            categoryId: currentFilters.categoryId,
            minPrice: minPrice ? Number(minPrice) : undefined,
            maxPrice: maxPrice ? Number(maxPrice) : undefined
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-3">Categories</h3>
                <div className="space-y-2">
                    <Button
                        variant={!currentFilters.categoryId ? 'default' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => onFilterChange({ ...currentFilters, categoryId: undefined })}
                    >
                        All Categories
                    </Button>
                    {categories.map(cat => (
                        <Button
                            key={cat.id}
                            variant={currentFilters.categoryId === cat.id ? 'default' : 'ghost'}
                            className="w-full justify-start pl-4"
                            onClick={() => onFilterChange({ ...currentFilters, categoryId: cat.id })}
                        >
                            {cat.name}
                        </Button>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-3">Price Range</h3>
                <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="space-y-1">
                        <Label>Min</Label>
                        <Input
                            type="number"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            placeholder="0"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label>Max</Label>
                        <Input
                            type="number"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            placeholder="Max"
                        />
                    </div>
                </div>
                <Button onClick={handleApply} className="w-full">Apply Filters</Button>
            </div>
        </div>
    );
}
