import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import MusicPlayer from '../player/MusicPlayer';
import Header from './Header';
import { useAuth } from '@/context/AuthContext';

interface MainLayoutProps {
    children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Main content area */}
            <div className="flex flex-1">
                {/* Sidebar */}
                <Sidebar />

                {/* Content area */}
                <div className="flex-1 flex flex-col">
                    {/* Header */}
                    <Header />

                    {/* Main content */}
                    <main className="flex-1 p-6 overflow-y-auto pb-24">
                        {children}
                    </main>
                </div>
            </div>

            {/* Music player (fixed at bottom) */}
            <MusicPlayer />
        </div>
    );
};

export default MainLayout;
