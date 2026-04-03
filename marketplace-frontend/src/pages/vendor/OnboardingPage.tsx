import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { vendorService } from '../../services/vendorService';
import type { CreateShopRequest } from '../../types/vendor';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';

export const OnboardingPage = () => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreateShopRequest>();
    const [error, setError] = useState('');

    const onSubmit = async (data: CreateShopRequest) => {
        try {
            await vendorService.createShop(data);
            navigate('/vendor/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create shop');
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>Welcome directly to Seller Onboarding</CardTitle>
                    <CardDescription>
                        Create your shop to start selling on MarketNest.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Business Name</label>
                            <Input
                                {...register('businessName', { required: 'Business Name is required' })}
                                placeholder="e.g. Acme Corp"
                            />
                            {errors.businessName && <span className="text-red-500 text-xs">{errors.businessName.message}</span>}
                        </div>

                        <div>
                            <label className="text-sm font-medium">Store Name (Display Name)</label>
                            <Input
                                {...register('storeName', { required: 'Store Name is required' })}
                                placeholder="e.g. Acme Store"
                            />
                            {errors.storeName && <span className="text-red-500 text-xs">{errors.storeName.message}</span>}
                        </div>

                        <div>
                            <label className="text-sm font-medium">Store URL Slug</label>
                            <Input
                                {...register('storeSlug', {
                                    required: 'Slug is required',
                                    pattern: {
                                        value: /^[a-z0-9-]+$/,
                                        message: 'Only lowercase letters, numbers, and hyphens'
                                    }
                                })}
                                placeholder="e.g. acme-store"
                            />
                            {errors.storeSlug && <span className="text-red-500 text-xs">{errors.storeSlug.message}</span>}
                        </div>

                        <div>
                            <label className="text-sm font-medium">Description</label>
                            <Textarea
                                {...register('storeDescription')}
                                placeholder="Tell us about your shop..."
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? 'Creating Shop...' : 'Create Shop'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};
