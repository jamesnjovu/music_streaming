import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import api from '../utils/api';

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
    filePath: string;
}

interface PlayerContextType {
    currentSong: Song | null;
    playlist: Song[];
    isPlaying: boolean;
    volume: number;
    currentTime: number;
    duration: number;
    playSong: (song: Song, newPlaylist?: Song[]) => void;
    togglePlay: () => void;
    pause: () => void;
    play: () => void;
    setVolume: (volume: number) => void;
    seekTo: (time: number) => void;
    playNext: () => void;
    playPrevious: () => void;
    addToQueue: (song: Song) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
    const [currentSong, setCurrentSong] = useState<Song | null>(null);
    const [playlist, setPlaylist] = useState<Song[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolumeState] = useState(0.7); // 70% volume by default
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize audio element
    useEffect(() => {
        const audio = new Audio();
        audioRef.current = audio;

        // Set initial volume
        audio.volume = volume;

        // Event listeners
        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('loadedmetadata', () => {
            setDuration(audio.duration);
        });
        audio.addEventListener('ended', handleSongEnd);

        // Cleanup
        return () => {
            audio.pause();
            audio.removeEventListener('timeupdate', updateProgress);
            audio.removeEventListener('loadedmetadata', () => { });
            audio.removeEventListener('ended', handleSongEnd);
        };
    }, []);

    // Update audio source when current song changes
    useEffect(() => {
        if (currentSong && audioRef.current) {
            const audio = audioRef.current;

            // Construct streaming URL
            const streamUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/stream/${currentSong._id}`;

            // Set new source
            audio.src = streamUrl;
            audio.load();

            // Play if isPlaying is true
            if (isPlaying) {
                const playPromise = audio.play();

                // Handle play promise (may be rejected if user hasn't interacted with the page)
                if (playPromise !== undefined) {
                    playPromise.catch((error) => {
                        console.error('Auto-play was prevented:', error);
                        setIsPlaying(false);
                    });
                }
            }

            // Log listen after playing for a few seconds
            const listenTimer = setTimeout(() => {
                if (isPlaying) {
                    logListenCount(currentSong._id);
                }
            }, 5000);

            return () => clearTimeout(listenTimer);
        }
    }, [currentSong]);

    // Log listen count for analytics
    const logListenCount = async (songId: string) => {
        try {
            await api.put(`/api/songs/${songId}/listen`);
        } catch (error) {
            console.error('Failed to log listen count:', error);
        }
    };

    // Update progress as song plays
    const updateProgress = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    // Handle song end
    const handleSongEnd = () => {
        playNext();
    };

    // Play a specific song
    const playSong = (song: Song, newPlaylist?: Song[]) => {
        setCurrentSong(song);

        // If a new playlist is provided, set it
        if (newPlaylist) {
            setPlaylist(newPlaylist);
        } else {
            // If not, add the song to the current playlist if it's not already there
            if (!playlist.some(item => item._id === song._id)) {
                setPlaylist(prev => [...prev, song]);
            }
        }

        setIsPlaying(true);
    };

    // Toggle play/pause
    const togglePlay = () => {
        if (!currentSong) return;

        if (isPlaying) {
            audioRef.current?.pause();
        } else {
            audioRef.current?.play();
        }

        setIsPlaying(!isPlaying);
    };

    // Pause playback
    const pause = () => {
        audioRef.current?.pause();
        setIsPlaying(false);
    };

    // Start/resume playback
    const play = () => {
        if (!currentSong) return;

        audioRef.current?.play();
        setIsPlaying(true);
    };

    // Set volume
    const setVolume = (newVolume: number) => {
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
            setVolumeState(newVolume);
        }
    };

    // Seek to a specific time
    const seekTo = (time: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    // Play next song in playlist
    const playNext = () => {
        if (!currentSong || playlist.length === 0) return;

        const currentIndex = playlist.findIndex(song => song._id === currentSong._id);
        const nextIndex = (currentIndex + 1) % playlist.length;

        setCurrentSong(playlist[nextIndex]);
        setIsPlaying(true);
    };

    // Play previous song in playlist
    const playPrevious = () => {
        if (!currentSong || playlist.length === 0) return;

        const currentIndex = playlist.findIndex(song => song._id === currentSong._id);
        const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;

        setCurrentSong(playlist[prevIndex]);
        setIsPlaying(true);
    };

    // Add song to playlist/queue
    const addToQueue = (song: Song) => {
        // Don't add if already in queue
        if (!playlist.some(item => item._id === song._id)) {
            setPlaylist(prev => [...prev, song]);
        }
    };

    return (
        <PlayerContext.Provider
            value={{
                currentSong,
                playlist,
                isPlaying,
                volume,
                currentTime,
                duration,
                playSong,
                togglePlay,
                pause,
                play,
                setVolume,
                seekTo,
                playNext,
                playPrevious,
                addToQueue
            }}
        >
            {children}
        </PlayerContext.Provider>
    );
};

// Custom hook to use player context
export const usePlayer = () => {
    const context = useContext(PlayerContext);
    if (context === undefined) {
        throw new Error('usePlayer must be used within a PlayerProvider');
    }
    return context;
};
