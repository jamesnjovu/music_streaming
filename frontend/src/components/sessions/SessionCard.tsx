import { Users, Music, Headphones, Lock } from 'lucide-react';
import Link from 'next/link';

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
    createdAt: string;
}

interface SessionCardProps {
    session: Session;
    onJoin: () => void;
    isUserParticipant: boolean;
}

const SessionCard = ({ session, onJoin, isUserParticipant }: SessionCardProps) => {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            {/* Header with background and session info */}
            <div className="bg-gradient-to-r from-indigo-800 to-purple-700 text-white p-4">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="font-bold text-lg">{session.name}</h3>
                        <p className="text-indigo-200 text-sm">
                            Hosted by {session.host.name}
                        </p>
                    </div>

                    {!session.isPublic && (
                        <span className="bg-indigo-900 bg-opacity-50 p-1 rounded">
                            <Lock size={16} />
                        </span>
                    )}
                </div>
            </div>

            {/* Session content */}
            <div className="p-4">
                {/* Current song */}
                <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                        <Headphones size={16} className="mr-1" />
                        Currently Playing
                    </h4>

                    {session.currentSong ? (
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-200 rounded overflow-hidden mr-3">
                                {session.currentSong.album?.coverArt ? (
                                    <img
                                        src={`${process.env.NEXT_PUBLIC_API_URL}/${session.currentSong.album.coverArt}`}
                                        alt={session.currentSong.album.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                        <Music size={16} className="text-gray-600" />
                                    </div>
                                )}
                            </div>

                            <div className="overflow-hidden">
                                <p className="font-medium truncate text-gray-900">{session.currentSong.title}</p>
                                <p className="text-sm text-gray-600 truncate">{session.currentSong.artist.name}</p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm italic">Nothing playing right now</p>
                    )}
                </div>

                {/* Participants */}
                <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                        <Users size={16} className="mr-1" />
                        Participants
                    </h4>

                    <div className="flex -space-x-2">
                        {session.participants.slice(0, 5).map((participant) => (
                            <div
                                key={participant.user._id}
                                className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-gray-200"
                                title={participant.user.name}
                            >
                                {participant.user.profileImage ? (
                                    <img
                                        src={`${process.env.NEXT_PUBLIC_API_URL}/${participant.user.profileImage}`}
                                        alt={participant.user.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                                        {participant.user.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                        ))}

                        {session.participants.length > 5 && (
                            <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                                +{session.participants.length - 5}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer with join button */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                {isUserParticipant ? (
                    <Link href={`/sessions/${session._id}`} className="block w-full bg-indigo-600 text-white text-center py-2 rounded-md hover:bg-indigo-700 transition-colors font-medium">
                        Continue Listening
                    </Link>
                ) : (
                    <button
                        onClick={onJoin}
                        className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors font-medium"
                    >
                        Join Session
                    </button>
                )}
            </div>
        </div>
    );
};

export default SessionCard;