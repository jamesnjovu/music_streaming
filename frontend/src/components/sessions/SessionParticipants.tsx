import { Crown, User } from 'lucide-react';

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

interface SessionParticipantsProps {
    participants: Participant[];
    hostId: string;
}

const SessionParticipants = ({ participants, hostId }: SessionParticipantsProps) => {
    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="font-medium">Participants ({participants.length})</h3>
            </div>

            <div className="max-h-64 overflow-y-auto">
                <ul className="divide-y divide-gray-200">
                    {participants.map((participant) => (
                        <li key={participant.user._id} className="px-4 py-3 flex items-center">
                            {/* User avatar */}
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 mr-3">
                                {participant.user.profileImage ? (
                                    <img
                                        src={`${process.env.NEXT_PUBLIC_API_URL}/${participant.user.profileImage}`}
                                        alt={participant.user.name}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-indigo-600 rounded-full flex items-center justify-center">
                                        <User size={20} className="text-white" />
                                    </div>
                                )}
                            </div>

                            {/* User info */}
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">{participant.user.name}</p>
                            </div>

                            {/* Role badge */}
                            {participant.user._id === hostId ? (
                                <span className="inline-flex items-center bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                                    <Crown size={12} className="mr-1" />
                                    Host
                                </span>
                            ) : participant.role === 'dj' ? (
                                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                                    DJ
                                </span>
                            ) : null}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default SessionParticipants;
