import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { 
  Home, Search, Library, PlusSquare, Heart, 
  Settings, LogOut, Music, Users, BarChart, Grid
} from 'lucide-react';

const Sidebar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  
  // Navigation items with icons
  const navItems = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Search', icon: Search, path: '/search' },
    { name: 'Your Library', icon: Library, path: '/library', requireAuth: true },
    { name: 'Create Playlist', icon: PlusSquare, path: '/create-playlist', requireAuth: true },
    { name: 'Liked Songs', icon: Heart, path: '/liked-songs', requireAuth: true },
  ];
  
  // Admin menu items
  const adminItems = [
    { name: 'Dashboard', icon: BarChart, path: '/admin' },
    { name: 'Songs', icon: Music, path: '/admin/songs' },
    { name: 'Artists', icon: Users, path: '/admin/artists' },
    { name: 'Albums', icon: Grid, path: '/admin/albums' },
  ];
  
  // Handle logout
  const handleLogout = () => {
    logout();
    router.push('/login');
  };
  
  return (
    <aside className="w-64 bg-gray-900 text-white h-screen sticky top-0 overflow-y-auto">
      {/* Logo */}
      <div className="p-6">
        <Link href="/" className="text-2xl font-bold">
          Music Stream
        </Link>
      </div>
      
      {/* Main navigation */}
      <nav className="px-4 py-2">
        <ul>
          {navItems.map((item) => {
            // Skip items that require authentication if user is not authenticated
            if (item.requireAuth && !isAuthenticated) return null;
            
            return (
              <li key={item.name}>
                <Link
                  href={item.path}
                  className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                    router.pathname === item.path
                      ? 'bg-blue-700 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <item.icon size={20} className="mr-3" />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* Admin section (only for admin users) */}
      {user?.role === 'admin' && (
        <div className="mt-8">
          <h3 className="px-6 py-2 text-xs uppercase text-gray-500 font-semibold">
            Admin
          </h3>
          <nav className="px-4 py-2">
          <ul>
            {adminItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.path}
                  className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                    router.pathname === item.path
                      ? 'bg-blue-700 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <item.icon size={20} className="mr-3" />
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    )}
    
    {/* User section */}
    {isAuthenticated && (
      <div className="mt-auto p-4 border-t border-gray-800">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center mr-3">
            {user?.profileImage ? (
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL}/${user.profileImage}`}
                alt={user?.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-white">{user?.name.charAt(0)}</span>
            )}
          </div>
          <div>
            <p className="font-medium">{user?.name}</p>
            <p className="text-sm text-gray-400 capitalize">{user?.accountType} Account</p>
          </div>
        </div>
        
        <div className="flex flex-col space-y-2">
          <Link
            href="/settings"
            className="flex items-center px-4 py-2 rounded-md text-gray-300 hover:bg-gray-800 transition-colors"
          >
            <Settings size={18} className="mr-3" />
            <span>Settings</span>
          </Link>
          
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 rounded-md text-gray-300 hover:bg-gray-800 transition-colors w-full text-left"
          >
            <LogOut size={18} className="mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    )}
  </aside>
);
};

export default Sidebar;
