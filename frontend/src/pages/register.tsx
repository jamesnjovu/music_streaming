import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import RegisterForm from '@/components/auth/RegisterForm';
import { useAuth } from '@/context/AuthContext';

const RegisterPage = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Redirect if already authenticated
        if (isAuthenticated && !isLoading) {
            router.push('/');
        }
    }, [isAuthenticated, isLoading, router]);

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>Register | Music Streaming</title>
                <meta name="description" content="Create your music streaming account" />
            </Head>
            <div className="min-h-screen bg-gray-100 flex flex-col justify-center">
                <div className="max-w-md mx-auto w-full px-4">
                    <RegisterForm />
                </div>
            </div>
        </>
    );
};

export default RegisterPage;
