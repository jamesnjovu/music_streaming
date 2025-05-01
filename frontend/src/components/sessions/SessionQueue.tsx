import { Play, Plus, Music } from 'lucide-react';
import { formatTime } from '@/utils/formatters';
import { useState } from 'react';
import AddToQueueModal from './AddToQueueModal';

interface Song {
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
}

interface QueueItem {
    song: Song;
    addedBy: {
        _id: string;
        name: string;
    };
    addedAt: string;
}

interface SessionQueueProps {
    queue: QueueItem[];
    canControl: boolean;
    onPlaySong: (song: Song) => void;
}

const SessionQueue = ({ queue, canControl, onPlaySong }: SessionQueueProps) => {
    const [showAddModal, setShowAddModal] = useState(false);

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-medium">Queue ({queue.length})</h3>

                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center text-indigo-600 hover:text-indigo-800"
                >
                    <Plus size={18} className="mr-1" />
                    <span className="text-sm">Add Song</span>
                </button>
            </div>

            {queue.length === 0 ? (
                <div className="py-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Music size={24} className="text-gray-400" />
                    </div>
                    <p className="text-gray-500 mb-1">Queue is empty</p>
                    <p className="text-sm text-gray-400">Add songs to the queue</p>
                </div>
            ) : (
                <ul className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
                    {queue.map((item) => (
                        <li
                            key={`${item.song._id}-${item.addedAt}`}
                            className="px-4 py-3 hover:bg-gray-50"
                        >
                            <div className="flex items-center">
                                {/* Album art */}
                                <div className="w-10 h-10 bg-gray-200 rounded overflow-hidden mr-3">
                                    {item.song.album?.coverArt ? (
                                        <img
                                            src={`${process.env.NEXT_PUBLIC_API_URL}/${item.song.album.coverArt}`}
                                            alt={item.song.album.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                            <Music size={16} className="text-gray-600" />
                                        </div>
                                    )}
                                </div>

                                {/* Song info */}
                                <div className="flex-1 min-w-0 mr-3">
                                    <p className="font-medium text-gray-900 truncate">{item.song.title}</p>
                                    <p className="text-sm text-gray-600 truncate">{item.song.artist.name}</p>
                                    <p className="text-xs text-gray-500">Added by {item.addedBy.name}</p>
                                </div>

                                {/* Duration */}
                                <div className="text-sm text-gray-500 mr-3">
                                    {formatTime(item.song.duration)}
                                </div>

                                {/* Play button */}
                                {canControl && (
                                    <button
                                        onClick={() => onPlaySong(item.song)}
                                        className="p-2 text-gray-600 hover:text-indigo-600 rounded-full hover:bg-indigo-50"
                                    >
                                        <Play size={16} />
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {/* Add to queue modal */}
            {showAddModal && (
                <AddToQueueModal
                    onClose={() => setShowAddModal(false)}
                    sessionId={queue[0]?.song._id.split('-')[0] || ''}
                />
            )}
        </div>
    );
};

export default SessionQueue;
