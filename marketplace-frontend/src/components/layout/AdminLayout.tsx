import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Settings, Ticket } from 'lucide-react';

const AdminLayout = () => {
    const location = useLocation();

    const navigation = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Configurations', href: '/admin/configs', icon: Settings },
        { name: 'Coupons', href: '/admin/coupons', icon: Ticket },
    ];

    return (
        <div className="flex min-h-[calc(100vh-4rem)]">
            {/* Sidebar */}
            <aside className="w-64 border-r bg-background hidden md:block">
                <nav className="space-y-1 p-4">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    }`}
                            >
                                <Icon className="h-4 w-4" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                <div className="mx-auto max-w-6xl">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
