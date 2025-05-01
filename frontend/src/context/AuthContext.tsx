import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../utils/api';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    accountType: string;
    profileImage: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    updateUser: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Load user on initial load and token change
    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                try {
                    // Set token in axios headers
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                    // Fetch user data
                    const res = await api.get('/api/auth/me');
                    setUser(res.data.data);
                    setIsAuthenticated(true);
                } catch (err) {
                    // If there's an error (like token expired), clear everything
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                    setIsAuthenticated(false);
                    delete api.defaults.headers.common['Authorization'];
                }
            }
            setIsLoading(false);
        };

        loadUser();
    }, [token]);

    // Login user
    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const res = await api.post('/api/auth/login', { email, password });

            // Save token to localStorage and state
            localStorage.setItem('token', res.data.token);
            setToken(res.data.token);
        } catch (err) {
            setIsLoading(false);
            throw err;
        }
    };

    // Register user
    const register = async (name: string, email: string, password: string) => {
        setIsLoading(true);
        try {
            const res = await api.post('/api/auth/register', { name, email, password });

            // Save token to localStorage and state
            localStorage.setItem('token', res.data.token);
            setToken(res.data.token);
        } catch (err) {
            setIsLoading(false);
            throw err;
        }
    };

    // Logout user
    const logout = () => {
        // Remove token from localStorage
        localStorage.removeItem('token');

        // Remove auth header
        delete api.defaults.headers.common['Authorization'];

        // Reset state
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
    };

    // Update user profile
    const updateUser = async (userData: Partial<User>) => {
        try {
            const res = await api.put('/api/users/me', userData);
            setUser(res.data.data);
            return res.data.data;
        } catch (err) {
            throw err;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated,
                isLoading,
                login,
                register,
                logout,
                updateUser
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};