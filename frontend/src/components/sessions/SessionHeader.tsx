import { ArrowLeft, Users, Signal, SignalOff, LogOut, Settings } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import SessionSettingsModal from './SessionSettingsModal';

interface Session {
    _id: string;
    name: string;
    host: {
        _id: string;
        name: string;
    };
    isPublic: boolean;
    participants: Array<any>;
}

interface SessionHeaderProps {
    session: Session;
    isHost: boolean;
    canControl: boolean;
    onLeave: () => void;
    connectionStatus: 'connected' | 'disconnected';
}

const SessionHeader = ({
    session,
    isHost,
    canControl,
    onLeave,
    connectionStatus
}: SessionHeaderProps) => {
    const [showSettings, setShowSettings] = useState(false);

    return (
        <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
            <div className="flex items-center">
                <Link href="/sessions" className="mr-3 p-2 rounded-full hover:bg-gray-100">
                    <ArrowLeft size={20} />
                </Link>

                <div>
                    <h1 className="font-bold text-xl">{session.name}</h1>
                    <p className="text-gray-600 text-sm">
                        Hosted by {session.host.name}
                        {isHost && <span className="text-blue-600 ml-1">(You)</span>}
                    </p>
                </div>
            </div>

            <div className="flex items-center space-x-3">
                {/* Connection status */}
                <div className="flex items-center">
                    {connectionStatus === 'connected' ? (
                        <div className="flex items-center text-green-600">
                            <Signal size={18} className="mr-1" />
                            <span className="text-sm hidden sm:inline">Connected</span>
                        </div>
                    ) : (
                        <div className="flex items-center text-red-600">
                            <SignalOff size={18} className="mr-1" />
                            <span className="text-sm hidden sm:inline">Disconnected</span>
                        </div>
                    )}
                </div>

                {/* Participants count */}
                <div className="flex items-center text-gray-600">
                    <Users size={18} className="mr-1" />
                    <span className="text-sm">{session.participants.length}</span>
                </div>

                {/* Settings button (host only) */}
                {isHost && (
                    <button
                        onClick={() => setShowSettings(true)}
                        className="p-2 text-gray-600 rounded-full hover:bg-gray-100"
                    >
                        <Settings size={20} />
                    </button>
                )}

                {/* Leave session button */}
                <button
                    onClick={onLeave}
                    className="flex items-center px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                    <LogOut size={16} className="mr-1" />
                    <span>Leave</span>
                </button>
            </div>

            {/* Settings modal */}
            {showSettings && (
                <SessionSettingsModal
                    session={session}
                    onClose={() => setShowSettings(false)}
                />
            )}
        </div>
    );
};

export default SessionHeader;
