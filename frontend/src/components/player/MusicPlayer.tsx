import { useState, useEffect, useRef } from 'react';
import { usePlayer } from '@/context/PlayerContext';
import { formatTime } from '@/utils/formatters';
import {
    Play, Pause, SkipBack, SkipForward,
    Volume2, Volume1, VolumeX, List, Heart
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/utils/api';

const MusicPlayer = () => {
    const {
        currentSong, playlist, isPlaying, volume, currentTime, duration,
        togglePlay, playNext, playPrevious, setVolume, seekTo
    } = usePlayer();

    const { isAuthenticated } = useAuth();
    const [isMuted, setIsMuted] = useState(false);
    const [prevVolume, setPrevVolume] = useState(volume);
    const [isLiked, setIsLiked] = useState(false);
    const [showPlaylist, setShowPlaylist] = useState(false);

    const progressRef = useRef<HTMLDivElement>(null);

    // Check if current song is liked
    useEffect(() => {
        const checkIfLiked = async () => {
            if (!currentSong || !isAuthenticated) return;

            try {
                const res = await api.get('/api/users/me/liked-songs');
                const likedSongs = res.data.data;

                setIsLiked(likedSongs.some((song: any) => song._id === currentSong._id));
            } catch (error) {
                console.error('Failed to check if song is liked:', error);
            }
        };

        checkIfLiked();
    }, [currentSong, isAuthenticated]);

    // Handle click on progress bar
    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!progressRef.current || !duration) return;

        const progressRect = progressRef.current.getBoundingClientRect();
        const clickPosition = e.clientX - progressRect.left;
        const percentClicked = clickPosition / progressRect.width;
        const newTime = percentClicked * duration;

        seekTo(newTime);
    };

    // Toggle mute
    const toggleMute = () => {
        if (isMuted) {
            setVolume(prevVolume);
            setIsMuted(false);
        } else {
            setPrevVolume(volume);
            setVolume(0);
            setIsMuted(true);
        }
    };

    // Handle volume change
    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
    };

    // Toggle like status for current song
    const toggleLike = async () => {
        if (!currentSong || !isAuthenticated) return;

        try {
            if (isLiked) {
                await api.delete(`/api/users/me/liked-songs/${currentSong._id}`);
                setIsLiked(false);
            } else {
                await api.post(`/api/users/me/liked-songs/${currentSong._id}`);
                setIsLiked(true);
            }
        } catch (error) {
            console.error('Failed to toggle like status:', error);
        }
    };

    // If no current song, don't render the player
    if (!currentSong) {
        return null;
    }

    // Calculate progress percentage
    const progressPercentage = (currentTime / duration) * 100 || 0;

    // Get volume icon based on current volume
    const VolumeIcon = isMuted || volume === 0
        ? VolumeX
        : volume < 0.5
            ? Volume1
            : Volume2;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-3 shadow-lg">
            <div className="max-w-7xl mx-auto flex flex-col">
                {/* Progress bar */}
                <div
                    ref={progressRef}
                    className="w-full h-1 bg-gray-700 cursor-pointer mb-2"
                    onClick={handleProgressClick}
                >
                    <div
                        className="h-full bg-blue-500"
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>

                <div className="flex items-center justify-between">
                    {/* Song info */}
                    <div className="flex items-center w-1/3">
                        <div className="h-12 w-12 mr-3 bg-gray-800 rounded overflow-hidden">
                            {currentSong.album?.coverArt ? (
                                <img
                                    src={`${process.env.NEXT_PUBLIC_API_URL}/${currentSong.album.coverArt}`}
                                    alt={currentSong.album.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-700">
                                    <span className="text-xs text-gray-400">No Cover</span>
                                </div>
                            )}
                        </div>

                        <div className="truncate">
                            <h3 className="font-medium truncate">{currentSong.title}</h3>
                            <p className="text-gray-400 text-sm truncate">{currentSong.artist.name}</p>
                        </div>

                        {isAuthenticated && (
                            <button
                                onClick={toggleLike}
                                className="ml-4 focus:outline-none"
                            >
                                <Heart
                                    size={20}
                                    className={isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'}
                                />
                            </button>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-center space-x-4 w-1/3">
                        <button
                            onClick={playPrevious}
                            className="p-2 rounded-full hover:bg-gray-800 focus:outline-none"
                        >
                            <SkipBack size={20} />
                        </button>

                        <button
                            onClick={togglePlay}
                            className="p-3 bg-blue-500 rounded-full hover:bg-blue-600 focus:outline-none"
                        >
                            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                        </button>

                        <button
                            onClick={playNext}
                            className="p-2 rounded-full hover:bg-gray-800 focus:outline-none"
                        >
                            <SkipForward size={20} />
                        </button>
                    </div>

                    {/* Volume and duration */}
                    <div className="flex items-center justify-end space-x-4 w-1/3">
                        <div className="text-xs text-gray-400 hidden sm:block">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </div>

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={toggleMute}
                                className="focus:outline-none"
                            >
                                <VolumeIcon size={20} />
                            </button>

                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={volume}
                                onChange={handleVolumeChange}
                                className="w-20 h-1"
                            />
                        </div>

                        <button
                            onClick={() => setShowPlaylist(!showPlaylist)}
                            className="p-2 rounded-full hover:bg-gray-800 focus:outline-none"
                        >
                            <List size={20} />
                        </button>
                    </div>
                </div>

                {/* Playlist drawer */}
                {showPlaylist && (
                    <div className="absolute bottom-full right-0 w-64 bg-gray-900 border border-gray-800 rounded-t shadow-lg max-h-96 overflow-y-auto">
                        <div className="p-3 border-b border-gray-800">
                            <h3 className="font-medium">Queue ({playlist.length})</h3>
                        </div>

                        <ul>
                            {playlist.map((song) => (
                                <li
                                    key={song._id}
                                    className={`p-3 border-b border-gray-800 hover:bg-gray-800 cursor-pointer flex items-center ${currentSong._id === song._id ? 'bg-gray-800' : ''
                                        }`}
                                >
                                    <div className="truncate flex-1">
                                        <p className="truncate font-medium">{song.title}</p>
                                        <p className="text-gray-400 text-sm truncate">{song.artist.name}</p>
                                    </div>

                                    <div className="text-xs text-gray-400">
                                        {formatTime(song.duration)}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MusicPlayer;
