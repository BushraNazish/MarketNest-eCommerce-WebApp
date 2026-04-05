import { useNavigate } from 'react-router-dom';
import { SearchBar } from '../../components/search/SearchBar';

export default function HomePage() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center p-8 text-center space-y-8 min-h-[calc(100vh-64px)]">
            <div className="max-w-2xl space-y-4">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                    Welcome to MarketNest
                </h1>
                <p className="text-lg text-gray-600">
                    Discover amazing products from diverse vendors. Start your journey here.
                </p>
            </div>

            <div className="w-full max-w-xl">
                <SearchBar className="w-full shadow-lg" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 w-full max-w-4xl">
                {/* Placeholder Categories */}
                {['Electronics', 'Fashion', 'Home', 'Beauty'].map(cat => (
                    <div key={cat} onClick={() => navigate(`/products/search?q=${cat}`)}
                        className="bg-white p-6 rounded-lg shadow hover:shadow-md cursor-pointer transition-shadow">
                        <span className="font-medium text-gray-700">{cat}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
