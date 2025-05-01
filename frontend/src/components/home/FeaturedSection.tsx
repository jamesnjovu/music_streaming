import { usePlayer } from '@/context/PlayerContext';
import { Play } from 'lucide-react';

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

interface FeaturedSectionProps {
    songs: Song[];
}

const FeaturedSection = ({ songs }: FeaturedSectionProps) => {
    const { playSong } = usePlayer();

    if (songs.length === 0) {
        return null;
    }

    // Featured song is the first song in the list
    const featuredSong = songs[0];

    return (
        <section>
            <h2 className="text-2xl font-bold mb-6">Featured</h2>

            <div className="bg-gradient-to-r from-blue-900 to-indigo-800 rounded-xl overflow-hidden">
                <div className="flex flex-col md:flex-row">
                    {/* Album art */}
                    <div className="w-full md:w-1/3 aspect-square">
                        {featuredSong.album?.coverArt ? (
                            <img
                                src={`${process.env.NEXT_PUBLIC_API_URL}/${featuredSong.album.coverArt}`}
                                alt={featuredSong.album.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                                <span className="text-white text-lg">No Cover</span>
                            </div>
                        )}
                    </div>

                    {/* Song info */}
                    <div className="p-8 flex flex-col justify-between flex-1">
                        <div>
                            <h3 className="text-3xl font-bold text-white mb-2">{featuredSong.title}</h3>
                            <p className="text-xl text-blue-200 mb-6">{featuredSong.artist.name}</p>

                            <p className="text-blue-100 mb-8">
                                Featured song of the week. Listen now!
                            </p>
                        </div>

                        <button
                            onClick={() => playSong(featuredSong, songs)}
                            className="flex items-center bg-white text-blue-900 py-3 px-6 rounded-full font-medium hover:bg-blue-50 transition-colors self-start"
                        >
                            <Play size={20} className="mr-2" />
                            Play Now
                        </button>
                    </div>
                </div>

                {/* Other featured songs */}
                <div className="bg-blue-900 bg-opacity-50 p-4">
                    <h4 className="text-white font-medium mb-4">More Featured Songs</h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {songs.slice(1, 5).map((song) => (
                            <div
                                key={song._id}
                                className="bg-blue-800 bg-opacity-50 rounded-md p-3 cursor-pointer hover:bg-opacity-75 transition-colors"
                                onClick={() => playSong(song, songs)}
                            >
                                <div className="flex items-center">
                                    <div className="w-12 h-12 mr-3">
                                        {song.album?.coverArt ? (
                                            <img
                                                src={`${process.env.NEXT_PUBLIC_API_URL}/${song.album.coverArt}`}
                                                alt={song.album.title}
                                                className="w-full h-full object-cover rounded"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-700 flex items-center justify-center rounded">
                                                <span className="text-white text-xs">No Cover</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="overflow-hidden">
                                        <h5 className="text-white font-medium truncate">{song.title}</h5>
                                        <p className="text-blue-200 text-sm truncate">{song.artist.name}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeaturedSection;