import { useState, useEffect } from 'react';
import { X, Search, Music, Plus } from 'lucide-react';
import api from '@/utils/api';

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

interface AddToQueueModalProps {
    onClose: () => void;
    sessionId: string;
}

const AddToQueueModal = ({ onClose, sessionId }: AddToQueueModalProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Song[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Search for songs
    useEffect(() => {
        if (!searchTerm.trim()) {
            setSearchResults([]);
            return;
        }

        const searchTimer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await api.get(`/api/songs?search=${encodeURIComponent(searchTerm)}`);
                setSearchResults(res.data.data);
            } catch (err) {
                console.error('Failed to search songs:', err);
                setError('Failed to search for songs');
            } finally {
                setIsSearching(false);
            }
        }, 500);

        return () => clearTimeout(searchTimer);
    }, [searchTerm]);

    // Add song to queue
    const addToQueue = async (songId: string) => {
        try {
            await api.post(`/api/sessions/${sessionId}/queue`, { songId });
            // Give feedback that song was added
            setSearchResults(prev =>
                prev.map(song =>
                    song._id === songId ? { ...song, added: true } : song
                )
            );
        } catch (err) {
            console.error('Failed to add song to queue:', err);
            setError('Failed to add song to queue');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
                <div className="flex justify-between items-center border-b border-gray-200 p-4">
                    <h3 className="text-lg font-medium">Add to Queue</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                        <X size={20} />
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mx-4 mt-4 rounded">
                        {error}
                    </div>
                )}

                <div className="p-4">
                    {/* Search input */}
                    <div className="relative mb-4">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search for songs..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        />
                    </div>

                    {/* Search results */}
                    <div className="max-h-96 overflow-y-auto">
                        {isSearching ? (
                            <div className="flex justify-center items-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : searchResults.length > 0 ? (
                            <ul className="divide-y divide-gray-200">
                                {searchResults.map((song) => (
                                    <li key={song._id} className="py-3 flex items-center">
                                        {/* Album art */}
                                        <div className="w-10 h-10 bg-gray-200 rounded overflow-hidden mr-3">
                                            {song.album?.coverArt ? (
                                                <img
                                                    src={`${process.env.NEXT_PUBLIC_API_URL}/${song.album.coverArt}`}
                                                    alt={song.album.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                                    <Music size={16} className="text-gray-600" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Song info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate">{song.title}</p>
                                            <p className="text-sm text-gray-600 truncate">{song.artist.name}</p>
                                        </div>

                                        {/* Add button */}
                                        <button
                                            onClick={() => addToQueue(song._id)}
                                            disabled={song.added}
                                            className={`ml-2 p-2 rounded-full ${song.added
                                                    ? 'bg-green-100 text-green-600 cursor-default'
                                                    : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                                                }`}
                                        >
                                            {song.added ? (
                                                <span className="text-xs font-medium px-2">Added</span>
                                            ) : (
                                                <Plus size={18} />
                                            )}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : searchTerm.trim() ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500">No songs found</p>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500">Search for songs to add to the queue</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end border-t border-gray-200 p-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddToQueueModal;
