import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Search, Bell, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

const Header = () => {
    const { isAuthenticated, user } = useAuth();
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [scrolled, setScrolled] = useState(false);

    // Handle scroll event to add/remove background color
    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 10;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [scrolled]);

    // Handle search submission
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
        }
    };

    return (
        <header
            className={`sticky top-0 z-10 py-4 px-6 flex items-center justify-between transition-colors ${scrolled ? 'bg-white shadow-sm' : 'bg-transparent'
                }`}
        >
            {/* Search bar */}
            <form onSubmit={handleSearch} className="relative w-1/3 max-w-md">
                <div className="relative">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search for songs, artists, or albums..."
                        className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </form>

            {/* Right side - auth buttons or user menu */}
            <div className="flex items-center">
                {isAuthenticated ? (
                    <>
                        {/* Notifications */}
                        <button className="p-2 rounded-full hover:bg-gray-200 relative mr-2">
                            <Bell size={20} className="text-gray-700" />
                            {/* Notification badge */}
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>

                        {/* User menu */}
                        <Link href="/profile" className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-2">
                                {user?.profileImage ? (
                                    <img
                                        src={`${process.env.NEXT_PUBLIC_API_URL}/${user.profileImage}`}
                                        alt={user?.name}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <span className="text-gray-700">{user?.name.charAt(0)}</span>
                                )}
                            </div>
                            <span className="text-gray-800 mr-1 hidden sm:block">{user?.name}</span>
                            <ChevronDown size={16} className="text-gray-600" />
                        </Link>
                    </>
                ) : (
                    <div className="space-x-2">
                        <Link
                            href="/login"
                            className="px-4 py-2 rounded-full border border-gray-300 text-gray-800 hover:bg-gray-100"
                        >
                            Log In
                        </Link>
                        <Link
                            href="/register"
                            className="px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700"
                        >
                            Sign Up
                        </Link>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
