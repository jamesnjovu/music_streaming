import { usePlayer } from '@/context/PlayerContext';
import { Play, Plus } from 'lucide-react';
import { formatTime } from '@/utils/formatters';

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

interface RecommendedSectionProps {
    songs: Song[];
}

const RecommendedSection = ({ songs }: RecommendedSectionProps) => {
    const { playSong, addToQueue } = usePlayer();

    if (songs.length === 0) {
        return null;
    }

    return (
        <section>
            <h2 className="text-2xl font-bold mb-6">Recommended for You</h2>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="w-full table-auto">
                    <thead className="bg-gray-50 text-left">
                        <tr>
                            <th className="py-3 px-4">#</th>
                            <th className="py-3 px-4">Title</th>
                            <th className="py-3 px-4 hidden md:table-cell">Album</th>
                            <th className="py-3 px-4 text-right">Duration</th>
                            <th className="py-3 px-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {songs.map((song, index) => (
                            <tr
                                key={song._id}
                                className="border-t border-gray-200 hover:bg-gray-50 cursor-pointer"
                                onClick={() => playSong(song, songs)}
                            >
                                <td className="py-3 px-4 text-gray-500">{index + 1}</td>
                                <td className="py-3 px-4">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 mr-3 bg-gray-200 rounded">
                                            {song.album?.coverArt ? (
                                                <img
                                                    src={`${process.env.NEXT_PUBLIC_API_URL}/${song.album.coverArt}`}
                                                    alt={song.album.title}
                                                    className="w-full h-full object-cover rounded"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-300 flex items-center justify-center rounded">
                                                    <span className="text-gray-500 text-xs">No Cover</span>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <p className="font-medium text-gray-900">{song.title}</p>
                                            <p className="text-sm text-gray-600">{song.artist.name}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-gray-600 hidden md:table-cell">
                                    {song.album?.title || '-'}
                                </td>
                                <td className="py-3 px-4 text-gray-600 text-right">
                                    {formatTime(song.duration)}
                                </td>
                                <td className="py-3 px-4">
                                    <div className="flex items-center justify-center space-x-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                playSong(song, songs);
                                            }}
                                            className="p-2 text-gray-600 hover:text-blue-600 rounded-full hover:bg-blue-50"
                                        >
                                            <Play size={18} />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                addToQueue(song);
                                            }}
                                            className="p-2 text-gray-600 hover:text-blue-600 rounded-full hover:bg-blue-50"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

export default RecommendedSection;
