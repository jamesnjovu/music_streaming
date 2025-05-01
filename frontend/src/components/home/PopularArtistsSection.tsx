import Link from 'next/link';

interface Artist {
    _id: string;
    name: string;
    profileImage: string;
    verified: boolean;
}

interface PopularArtistsSectionProps {
    artists: Artist[];
}

const PopularArtistsSection = ({ artists }: PopularArtistsSectionProps) => {
    if (artists.length === 0) {
        return null;
    }

    return (
        <section>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Popular Artists</h2>
                <Link href="/artists" className="text-blue-600 hover:underline">
                    See All
                </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {artists.map((artist) => (
                    <Link
                        key={artist._id}
                        href={`/artists/${artist._id}`}
                        className="text-center group"
                    >
                        <div className="relative mx-auto w-32 h-32 rounded-full overflow-hidden mb-3 bg-gray-200 group-hover:shadow-md transition-shadow">
                            {artist.profileImage ? (
                                <img
                                    src={`${process.env.NEXT_PUBLIC_API_URL}/${artist.profileImage}`}
                                    alt={artist.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                                    <span className="text-white text-2xl font-bold">{artist.name.charAt(0)}</span>
                                </div>
                            )}

                            {/* Verified badge */}
                            {artist.verified && (
                                <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        <h3 className="font-medium text-gray-900">{artist.name}</h3>
                        <p className="text-xs text-gray-500">Artist</p>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default PopularArtistsSection;
