import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { productService } from '../../../services/productService';
import type { Category, CreateProductRequest } from '../../../types/product';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Alert, AlertTitle, AlertDescription } from '../../../components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';

export default function ProductCreatePage() {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm<CreateProductRequest>();
    const [categories, setCategories] = useState<Category[]>([]);
    const [submitError, setSubmitError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await productService.getAllCategories();
                setCategories(data);
            } catch (err) {
                console.error("Failed to load categories", err);
            }
        };
        fetchCategories();
    }, []);

    const onSubmit = async (data: CreateProductRequest) => {
        setIsSubmitting(true);
        setSubmitError('');
        try {
            // Convert images string (comma separated) to array if we used a simple input
            // For now, let's assume the form handles one image URL or we parse it.
            // But the type says imageUrls: string[].
            // To simplify, let's just make the UI accept one image URL for MVP.

            const payload = {
                ...data,
                // Ensure numbers are numbers
                basePrice: Number(data.basePrice),
                salePrice: Number(data.salePrice),
                imageUrls: data.imageUrls ? [data.imageUrls as any] : [] // Hacky, better to use proper array input
            };

            await productService.createProduct(payload);
            navigate('/vendor/products');
        } catch (err: any) {
            setSubmitError(err.response?.data?.message || 'Failed to create product');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Add New Product</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Product Details</CardTitle>
                    <CardDescription>Fill in the information below to add a new product to your catalog.</CardDescription>
                </CardHeader>
                <CardContent>
                    {submitError && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{submitError}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Product Name</Label>
                            <Input id="name" {...register('name', { required: 'Name is required' })} placeholder="e.g., Wireless Headset" />
                            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="categoryId">Category</Label>
                            <select id="categoryId" {...register('categoryId', { required: 'Category is required' })}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                <option value="">Select a category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            {errors.categoryId && <p className="text-sm text-red-500">{errors.categoryId.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="basePrice">Price ($)</Label>
                                <Input id="basePrice" type="number" step="0.01" {...register('basePrice', { required: 'Price is required', min: 0 })} />
                                {errors.basePrice && <p className="text-sm text-red-500">{errors.basePrice.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="salePrice">Sale Price ($)</Label>
                                <Input id="salePrice" type="number" step="0.01" {...register('salePrice')} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="shortDescription">Short Description</Label>
                            <Input id="shortDescription" {...register('shortDescription')} placeholder="Brief summary" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Full Description</Label>
                            <Textarea id="description" {...register('description')} placeholder="Detailed product description" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="imageUrl">Product Image URL</Label>
                            <Input id="imageUrl" {...register('imageUrls')} placeholder="https://example.com/image.jpg" />
                            <p className="text-xs text-gray-500">Provide a direct link to an image.</p>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => navigate('/vendor/products')}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Creating...' : 'Create Product'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
