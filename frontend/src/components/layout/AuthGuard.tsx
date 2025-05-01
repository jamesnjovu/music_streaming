import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';

interface AuthGuardProps {
    children: ReactNode;
    adminOnly?: boolean;
}

const AuthGuard = ({ children, adminOnly = false }: AuthGuardProps) => {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // If not loading and not authenticated, redirect to login
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }

        // If adminOnly and user is not admin, redirect to home
        if (adminOnly && !isLoading && isAuthenticated && user?.role !== 'admin') {
            router.push('/');
        }
    }, [isAuthenticated, isLoading, router, adminOnly, user]);

    // Show loading state while checking authentication
    if (isLoading || !isAuthenticated || (adminOnly && user?.role !== 'admin')) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return <>{children}</>;
};

export default AuthGuard;
