import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import MainLayout from '@/components/layout/MainLayout';
import AuthGuard from '@/components/layout/AuthGuard';
import api from '@/utils/api';
import SessionCard from '@/components/sessions/SessionCard';
import { Plus, Users } from 'lucide-react';
import CreateSessionModal from '@/components/sessions/CreateSessionModal';

interface Session {
    _id: string;
    name: string;
    host: {
        _id: string;
        name: string;
        profileImage: string;
    };
    participants: Array<{
        user: {
            _id: string;
            name: string;
            profileImage: string;
        };
        role: string;
    }>;
    currentSong?: {
        _id: string;
        title: string;
        artist: {
            _id: string;
            name: string;
        };
        album?: {
            _id: string;
            title: string;
            coverArt: string;
        };
    };
    isPublic: boolean;
    isActive: boolean;
    createdAt: string;
}

const SessionsPage = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [userSessions, setUserSessions] = useState<Session[]>([]);
    const [publicSessions, setPublicSessions] = useState<Session[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchSessions = async () => {
            setIsLoading(true);
            try {
                // Fetch sessions where user is participant
                const userSessionsRes = await api.get('/api/sessions/active');
                setUserSessions(userSessionsRes.data.data);

                // Fetch public sessions
                const publicSessionsRes = await api.get('/api/sessions/public');
                setPublicSessions(publicSessionsRes.data.data);

                // Combine all sessions
                const allSessions = [
                    ...userSessionsRes.data.data,
                    ...publicSessionsRes.data.data.filter(
                        (session: Session) =>
                            !userSessionsRes.data.data.some(
                                (userSession: Session) => userSession._id === session._id
                            )
                    )
                ];
                setSessions(allSessions);
            } catch (error) {
                console.error('Failed to fetch sessions:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSessions();
    }, []);

    const handleCreateSession = async (sessionData: { name: string; isPublic: boolean }) => {
        try {
            const res = await api.post('/api/sessions', sessionData);
            router.push(`/sessions/${res.data.data._id}`);
        } catch (error) {
            console.error('Failed to create session:', error);
        }
    };

    const handleJoinSession = async (sessionId: string) => {
        try {
            await api.post(`/api/sessions/${sessionId}/join`);
            router.push(`/sessions/${sessionId}`);
        } catch (error) {
            console.error('Failed to join session:', error);
        }
    };

    return (
        <AuthGuard>
            <Head>
                <title>Shared Listening Sessions | Music Streaming</title>
                <meta name="description" content="Join shared listening sessions with friends and other users" />
            </Head>

            <MainLayout>
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold">Shared Listening Sessions</h1>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            <Plus size={20} className="mr-2" />
                            Create Session
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* User's active sessions */}
                            {userSessions.length > 0 && (
                                <div>
                                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                                        <Users size={20} className="mr-2" />
                                        Your Sessions
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {userSessions.map((session) => (
                                            <SessionCard
                                                key={session._id}
                                                session={session}
                                                onJoin={() => handleJoinSession(session._id)}
                                                isUserParticipant={true}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Public sessions */}
                            {publicSessions.length > 0 && (
                                <div>
                                    <h2 className="text-xl font-semibold mb-4">Public Sessions</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {publicSessions
                                            .filter(session =>
                                                !userSessions.some(us => us._id === session._id)
                                            )
                                            .map((session) => (
                                                <SessionCard
                                                    key={session._id}
                                                    session={session}
                                                    onJoin={() => handleJoinSession(session._id)}
                                                    isUserParticipant={false}
                                                />
                                            ))
                                        }
                                    </div>
                                </div>
                            )}

                            {sessions.length === 0 && (
                                <div className="text-center py-12">
                                    <h3 className="text-xl font-medium text-gray-600 mb-2">No active sessions found</h3>
                                    <p className="text-gray-500 mb-6">Create a new session or join a public one</p>
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors mx-auto"
                                    >
                                        <Plus size={20} className="mr-2" />
                                        Create Session
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Create session modal */}
                    {showCreateModal && (
                        <CreateSessionModal
                            onClose={() => setShowCreateModal(false)}
                            onCreate={handleCreateSession}
                        />
                    )}
                </div>
            </MainLayout>
        </AuthGuard>
    );
};

export default SessionsPage;
