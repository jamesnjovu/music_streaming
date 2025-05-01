import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { io, Socket } from 'socket.io-client';
import MainLayout from '@/components/layout/MainLayout';
import AuthGuard from '@/components/layout/AuthGuard';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { usePlayer } from '@/context/PlayerContext';
import SessionHeader from '@/components/sessions/SessionHeader';
import SessionPlayer from '@/components/sessions/SessionPlayer';
import SessionParticipants from '@/components/sessions/SessionParticipants';
import SessionChat from '@/components/sessions/SessionChat';
import SessionQueue from '@/components/sessions/SessionQueue';

interface Participant {
    user: {
        _id: string;
        name: string;
        profileImage: string;
    };
    role: string;
    joinedAt: string;
    lastActive: string;
}

interface QueueItem {
    song: {
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
        duration: number;
    };
    addedBy: {
        _id: string;
        name: string;
    };
    addedAt: string;
}

interface ChatMessage {
    userId: string;
    userName: string;
    userImage?: string;
    message: string;
    timestamp: number;
}

interface Session {
    _id: string;
    name: string;
    host: {
        _id: string;
        name: string;
        profileImage: string;
    };
    participants: Participant[];
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
        duration: number;
    };
    currentPosition: number;
    isPublic: boolean;
    isActive: boolean;
    queue: QueueItem[];
    createdAt: string;
}

const SessionPage = () => {
    const router = useRouter();
    const { id: sessionId } = router.query;
    const { user } = useAuth();
    const { currentSong: playerCurrentSong, playSong, pause, play, seekTo, currentTime } = usePlayer();

    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isHost, setIsHost] = useState(false);
    const [isDJ, setIsDJ] = useState(false);
    const [canControl, setCanControl] = useState(false);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    const lastPlaybackUpdateRef = useRef<number>(0);

    // Connect to socket.io server
    useEffect(() => {
        if (!sessionId || !user) return;

        const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
            auth: {
                token: localStorage.getItem('token')
            }
        });

        socketInstance.on('connect', () => {
            console.log('Connected to socket server');
            setIsConnected(true);

            // Join the session room
            socketInstance.emit('joinSession', sessionId);
        });

        socketInstance.on('sessionJoined', (data) => {
            console.log('Joined session:', data);
        });

        socketInstance.on('error', (error) => {
            console.error('Socket error:', error);
            setError(error.message);
        });

        socketInstance.on('disconnect', () => {
            console.log('Disconnected from socket server');
            setIsConnected(false);
        });

        setSocket(socketInstance);

        // Clean up on unmount
        return () => {
            if (socketInstance) {
                socketInstance.disconnect();
            }
        };
    }, [sessionId, user]);

    // Listen for playback updates
    useEffect(() => {
        if (!socket) return;

        socket.on('playbackUpdated', (data) => {
            const { currentSong, currentPosition, timestamp, isPlaying, updatedBy } = data;

            // Skip if we're the one who sent the update
            if (updatedBy === user?._id) return;

            // Update last playback timestamp
            lastPlaybackUpdateRef.current = Date.now();

            // Update session state
            setSession(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    currentSong,
                    currentPosition
                };
            });

            // Update player
            if (currentSong) {
                if (playerCurrentSong?._id !== currentSong._id) {
                    // Play a new song
                    playSong(currentSong);
                } else {
                    // Just seek to the correct position
                    const timeSinceUpdate = (Date.now() - timestamp) / 1000;
                    const adjustedPosition = currentPosition + timeSinceUpdate;
                    seekTo(adjustedPosition);
                }
            }

            // Play or pause
            if (isPlaying) {
                play();
            } else {
                pause();
            }
        });

        socket.on('participantJoined', (data) => {
            const { participant } = data;

            setSession(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    participants: [...prev.participants, participant]
                };
            });

            // Add system message to chat
            setChatMessages(prev => [
                ...prev,
                {
                    userId: 'system',
                    userName: 'System',
                    message: `${participant.user.name} joined the session`,
                    timestamp: Date.now()
                }
            ]);
        });

        socket.on('participantLeft', (data) => {
            const { userId } = data;

            setSession(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    participants: prev.participants.filter(p => p.user._id !== userId)
                };
            });

            // Find user name
            const userName = session?.participants.find(p => p.user._id === userId)?.user.name || 'Someone';

            // Add system message to chat
            setChatMessages(prev => [
                ...prev,
                {
                    userId: 'system',
                    userName: 'System',
                    message: `${userName} left the session`,
                    timestamp: Date.now()
                }
            ]);
        });

        socket.on('queueUpdated', (data) => {
            const { queue } = data;

            setSession(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    queue
                };
            });
        });

        socket.on('sessionEnded', () => {
            setError('This session has ended');

            // Add system message to chat
            setChatMessages(prev => [
                ...prev,
                {
                    userId: 'system',
                    userName: 'System',
                    message: 'This session has ended',
                    timestamp: Date.now()
                }
            ]);

            // Redirect after a delay
            setTimeout(() => {
                router.push('/sessions');
            }, 5000);
        });

        socket.on('chatMessage', (data) => {
            const { userId, userName, userImage, message, timestamp } = data;

            setChatMessages(prev => [
                ...prev,
                { userId, userName, userImage, message, timestamp }
            ]);
        });

        return () => {
            socket.off('playbackUpdated');
            socket.off('participantJoined');
            socket.off('participantLeft');
            socket.off('queueUpdated');
            socket.off('sessionEnded');
            socket.off('chatMessage');
        };
    }, [socket, user, session, playerCurrentSong, playSong, play, pause, seekTo, router]);

    // Sync playback position periodically
    useEffect(() => {
        if (!session?.currentSong || !socket || !canControl) return;

        const syncInterval = setInterval(() => {
            // Only send update if we're hosting and it's been a while since the last update
            if (isHost && Date.now() - lastPlaybackUpdateRef.current > 15000) {
                socket.emit('updatePlayback', {
                    sessionId,
                    currentSong: playerCurrentSong?._id,
                    currentPosition: currentTime,
                    isPlaying: true
                });

                lastPlaybackUpdateRef.current = Date.now();
            }
        }, 15000);

        return () => clearInterval(syncInterval);
    }, [session, socket, isHost, canControl, sessionId, playerCurrentSong, currentTime]);

    // Fetch session data
    useEffect(() => {
        const fetchSession = async () => {
            if (!sessionId) return;

            setIsLoading(true);
            try {
                const res = await api.get(`/api/sessions/${sessionId}`);
                setSession(res.data.data);

                // Determine user's role
                const isUserHost = res.data.data.host._id === user?._id;
                setIsHost(isUserHost);

                const participant = res.data.data.participants.find(
                    (p: Participant) => p.user._id === user?._id
                );
                setIsDJ(participant?.role === 'dj');

                // Can control if host or DJ
                setCanControl(isUserHost || participant?.role === 'dj');

                // If there's a current song, play it
                if (res.data.data.currentSong) {
                    playSong(res.data.data.currentSong);
                    seekTo(res.data.data.currentPosition);
                }
            } catch (error: any) {
                console.error('Failed to fetch session:', error);
                setError(error.response?.data?.message || 'Failed to load session');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSession();
    }, [sessionId, user, playSong, seekTo]);

    // Handle sending chat messages
    const sendChatMessage = () => {
        if (!socket || !chatInput.trim() || !user) return;

        const messageData = {
            sessionId,
            userId: user._id,
            userName: user.name,
            userImage: user.profileImage,
            message: chatInput.trim(),
            timestamp: Date.now()
        };

        socket.emit('chatMessage', messageData);

        // Add to local messages immediately
        setChatMessages(prev => [...prev, messageData]);
        setChatInput('');
    };

    // Handle leaving session
    const leaveSession = async () => {
        try {
            await api.post(`/api/sessions/${sessionId}/leave`);
            router.push('/sessions');
        } catch (error) {
            console.error('Failed to leave session:', error);
        }
    };

    // Handle adding song to queue
    const addToQueue = async (songId: string) => {
        try {
            await api.post(`/api/sessions/${sessionId}/queue`, { songId });
        } catch (error) {
            console.error('Failed to add song to queue:', error);
        }
    };

    // Handle playback control
    const updatePlayback = (song: any, position: number = 0, isPlaying: boolean = true) => {
        if (!socket || !canControl) return;

        socket.emit('updatePlayback', {
            sessionId,
            currentSong: song._id,
            currentPosition: position,
            isPlaying
        });

        // Update last playback timestamp
        lastPlaybackUpdateRef.current = Date.now();

        // Play the song locally too
        playSong(song);
        if (position > 0) {
            seekTo(position);
        }
    };

    // Show loading state
    if (isLoading) {
        return (
            <AuthGuard>
                <MainLayout>
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                </MainLayout>
            </AuthGuard>
        );
    }

    // Show error state
    if (error) {
        return (
            <AuthGuard>
                <MainLayout>
                    <div className="flex flex-col items-center justify-center h-64">
                        <h2 className="text-xl font-medium text-red-600 mb-2">{error}</h2>
                        <p className="text-gray-600 mb-4">Redirecting to sessions page...</p>
                        <button
                            onClick={() => router.push('/sessions')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Back to Sessions
                        </button>
                    </div>
                </MainLayout>
            </AuthGuard>
        );
    }

    if (!session) {
        return (
            <AuthGuard>
                <MainLayout>
                    <div className="flex justify-center items-center h-64">
                        <p className="text-gray-600">Session not found</p>
                    </div>
                </MainLayout>
            </AuthGuard>
        );
    }

    return (
        <AuthGuard>
            <Head>
                <title>{session.name} | Shared Listening | Music Streaming</title>
                <meta name="description" content={`Join the "${session.name}" shared listening session`} />
            </Head>

            <MainLayout>
                <div className="container mx-auto px-4">
                    {/* Session Header */}
                    <SessionHeader
                        session={session}
                        isHost={isHost}
                        canControl={canControl}
                        onLeave={leaveSession}
                        connectionStatus={isConnected ? 'connected' : 'disconnected'}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                        {/* Left column - Player and Queue */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Player */}
                            <SessionPlayer
                                currentSong={session.currentSong}
                                canControl={canControl}
                                onPlaybackUpdate={updatePlayback}
                            />

                            {/* Queue */}
                            <SessionQueue
                                queue={session.queue}
                                canControl={canControl}
                                onPlaySong={(song) => updatePlayback(song)}
                            />
                        </div>

                        {/* Right column - Participants and Chat */}
                        <div className="space-y-6">
                            {/* Participants */}
                            <SessionParticipants participants={session.participants} hostId={session.host._id} />

                            {/* Chat */}
                            <SessionChat
                                messages={chatMessages}
                                inputValue={chatInput}
                                onInputChange={(e) => setChatInput(e.target.value)}
                                onSendMessage={sendChatMessage}
                                currentUserId={user?._id || ''}
                            />
                        </div>
                    </div>
                </div>
            </MainLayout>
        </AuthGuard>
    );
};

export default SessionPage;
