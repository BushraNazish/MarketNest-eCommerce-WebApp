import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

interface SearchBarProps {
    initialQuery?: string;
    className?: string;
}

export function SearchBar({ initialQuery = '', className = '' }: SearchBarProps) {
    const [query, setQuery] = useState(initialQuery);
    const navigate = useNavigate();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/products/search?q=${encodeURIComponent(query)}`);
        }
    };

    return (
        <form onSubmit={handleSearch} className={`flex gap-2 ${className}`}>
            <Input
                type="text"
                placeholder="Search for products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-grow"
            />
            <Button type="submit">Search</Button>
        </form>
    );
}
