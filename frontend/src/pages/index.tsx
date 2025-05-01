import { useEffect, useState } from 'react';
import Head from 'next/head';
import MainLayout from '@/components/layout/MainLayout';
import { usePlayer } from '@/context/PlayerContext';
import api from '@/utils/api';
import FeaturedSection from '@/components/home/FeaturedSection';
import NewReleasesSection from '@/components/home/NewReleasesSection';
import PopularArtistsSection from '@/components/home/PopularArtistsSection';
import RecommendedSection from '@/components/home/RecommendedSection';

const HomePage = () => {
    const [featuredSongs, setFeaturedSongs] = useState([]);
    const [newReleases, setNewReleases] = useState([]);
    const [popularArtists, setPopularArtists] = useState([]);
    const [recommended, setRecommended] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch data on component mount
    useEffect(() => {
        const fetchHomePageData = async () => {
            try {
                // Fetch featured songs
                const songsRes = await api.get('/api/songs?featured=true&limit=10');
                setFeaturedSongs(songsRes.data.data);

                // Fetch new releases
                const newReleasesRes = await api.get('/api/albums?sort=-releaseDate&limit=10');
                setNewReleases(newReleasesRes.data.data);

                // Fetch popular artists
                const artistsRes = await api.get('/api/artists?limit=6');
                setPopularArtists(artistsRes.data.data);

                // Fetch recommended songs (could be personalized if user is logged in)
                const recommendedRes = await api.get('/api/songs?limit=10');
                setRecommended(recommendedRes.data.data);
            } catch (error) {
                console.error('Failed to fetch home page data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHomePageData();
    }, []);

    return (
        <>
            <Head>
                <title>Music Streaming - Discover New Music</title>
                <meta name="description" content="Stream your favorite music anytime, anywhere" />
            </Head>

            <MainLayout>
                {isLoading ? (
                    // Loading state
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <div className="space-y-10">
                        {/* Featured Section */}
                        <FeaturedSection songs={featuredSongs} />

                        {/* New Releases */}
                        <NewReleasesSection albums={newReleases} />

                        {/* Popular Artists */}
                        <PopularArtistsSection artists={popularArtists} />

                        {/* Recommended for You */}
                        <RecommendedSection songs={recommended} />
                    </div>
                )}
            </MainLayout>
        </>
    );
};

export default HomePage;
