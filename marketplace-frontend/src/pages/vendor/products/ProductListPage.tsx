import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../../services/productService';
import type { Product } from '../../../types/product';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';

export default function ProductListPage() {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const data = await productService.getMyProducts();
            setProducts(data.content);
        } catch (error) {
            console.error("Failed to load products", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Products</h1>
                <Button onClick={() => navigate('/vendor/products/new')}>Add Product</Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Your Products</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p>Loading...</p>
                    ) : products.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            No products found. Start by adding one!
                        </div>
                    ) : (
                        <div className="relative overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3">Product</th>
                                        <th className="px-6 py-3">Category</th>
                                        <th className="px-6 py-3">Price</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product) => (
                                        <tr key={product.id} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    {product.images[0] && (
                                                        <img src={product.images[0].imageUrl} alt={product.name} className="w-10 h-10 object-cover rounded" />
                                                    )}
                                                    <span>{product.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">{product.categoryName}</td>
                                            <td className="px-6 py-4">${product.basePrice.toFixed(2)}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                                    ${product.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                                        product.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {product.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Button variant="outline" className="mr-2" onClick={() => navigate(`/vendor/products/${product.id}/edit`)}>Edit</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
