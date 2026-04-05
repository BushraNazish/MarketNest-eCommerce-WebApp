import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../../services/productService';
import type { Product } from '../../types/product';
import { ProductCard } from '../../components/products/ProductCard';
import { FilterSidebar } from '../../components/search/FilterSidebar';
import { SearchBar } from '../../components/search/SearchBar';

export default function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const q = searchParams.get('q') || '';
    const categoryId = searchParams.get('category') || undefined;
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const data = await productService.searchProducts({
                    q,
                    categoryId,
                    minPrice,
                    maxPrice,
                    size: 12
                });
                setProducts(data.content);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [q, categoryId, minPrice, maxPrice]);

    const handleFilterChange = (filters: { categoryId?: string; minPrice?: number; maxPrice?: number }) => {
        const params: any = {};
        if (q) params.q = q;
        if (filters.categoryId) params.category = filters.categoryId;
        if (filters.minPrice) params.minPrice = filters.minPrice.toString();
        if (filters.maxPrice) params.maxPrice = filters.maxPrice.toString();
        setSearchParams(params);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <SearchBar initialQuery={q} className="max-w-2xl mx-auto" />
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                <aside className="w-full md:w-64 flex-shrink-0">
                    <FilterSidebar
                        onFilterChange={handleFilterChange}
                        currentFilters={{ categoryId, minPrice, maxPrice }}
                    />
                </aside>

                <main className="flex-grow">
                    {loading ? (
                        <p>Loading...</p>
                    ) : products.length === 0 ? (
                        <div className="text-center py-10">
                            <h3 className="text-xl font-medium text-gray-900">No products found</h3>
                            <p className="text-gray-500">Try adjusting your search or filters.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
