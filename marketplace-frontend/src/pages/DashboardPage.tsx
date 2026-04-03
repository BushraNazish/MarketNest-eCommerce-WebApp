import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export const DashboardPage = () => {
    const { user, role, logout } = useAuthStore();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <Button onClick={logout} variant="destructive">Logout</Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Welcome back!</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="p-4 bg-muted rounded-md">
                            <p><strong>Email:</strong> {user?.email}</p>
                            <p><strong>Role:</strong> {role}</p>
                        </div>
                        <p className="text-muted-foreground">This is a protected area. Only authenticated users can see this.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
