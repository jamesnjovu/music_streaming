import { useEffect, useState, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Music } from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
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

interface SessionPlayerProps {
    currentSong?: Song;
    canControl: boolean;
    onPlaybackUpdate: (song: Song, position?: number, isPlaying?: boolean) => void;
}

const SessionPlayer = ({ currentSong, canControl, onPlaybackUpdate }: SessionPlayerProps) => {
    const { isPlaying, togglePlay, currentTime, duration, seekTo } = usePlayer();
    const progressRef = useRef<HTMLDivElement>(null);

    // Handle click on progress bar (if user has control)
    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!canControl || !progressRef.current || !currentSong) return;

        const progressRect = progressRef.current.getBoundingClientRect();
        const clickPosition = e.clientX - progressRect.left;
        const percentClicked = clickPosition / progressRect.width;
        const newTime = percentClicked * duration;

        seekTo(newTime);
        onPlaybackUpdate(currentSong, newTime, isPlaying);
    };

    // Handle play/pause
    const handlePlayPause = () => {
        if (!canControl || !currentSong) return;

        togglePlay();
        onPlaybackUpdate(currentSong, currentTime, !isPlaying);
    };

    // Calculate progress percentage
    const progressPercentage = (currentTime / duration) * 100 || 0;

    if (!currentSong) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Music size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-700 mb-2">No music playing</h3>
                <p className="text-gray-500">
                    {canControl
                        ? "Start playing a song to share with everyone"
                        : "Waiting for host to play music"}
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6">
                <div className="flex flex-col md:flex-row items-center">
                    {/* Album art */}
                    <div className="w-32 h-32 bg-gray-200 rounded overflow-hidden flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                        {currentSong.album?.coverArt ? (
                            <img
                                src={`${process.env.NEXT_PUBLIC_API_URL}/${currentSong.album.coverArt}`}
                                alt={currentSong.album.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                <Music size={32} className="text-white" />
                            </div>
                        )}
                    </div>

                    {/* Song info and controls */}
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{currentSong.title}</h3>
                        <p className="text-gray-600 mb-4">{currentSong.artist.name}</p>

                        {/* Progress bar */}
                        <div
                            ref={progressRef}
                            className="w-full h-2 bg-gray-200 rounded-full cursor-pointer mb-2"
                            onClick={handleProgressClick}
                        >
                            <div
                                className="h-full bg-indigo-600 rounded-full"
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>

                        {/* Time */}
                        <div className="flex justify-between text-sm text-gray-500 mb-4">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>

                        {/* Controls */}
                        <div className="flex justify-center space-x-4">
                            <button
                                className={`p-2 rounded-full text-gray-600 hover:text-indigo-600 hover:bg-indigo-100 ${!canControl && 'opacity-50 cursor-not-allowed'}`}
                                disabled={!canControl}
                            >
                                <SkipBack size={24} />
                            </button>

                            <button
                                onClick={handlePlayPause}
                                className={`p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 ${!canControl && 'opacity-50 cursor-not-allowed'}`}
                                disabled={!canControl}
                            >
                                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                            </button>

                            <button
                                className={`p-2 rounded-full text-gray-600 hover:text-indigo-600 hover:bg-indigo-100 ${!canControl && 'opacity-50 cursor-not-allowed'}`}
                                disabled={!canControl}
                            >
                                <SkipForward size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {!canControl && (
                <div className="bg-gray-100 px-4 py-2 text-sm text-center text-gray-600">
                    The host or DJ has control of playback
                </div>
            )}
        </div>
    );
};

export default SessionPlayer;
