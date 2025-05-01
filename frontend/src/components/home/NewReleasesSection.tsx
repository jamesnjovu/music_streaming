import Link from 'next/link';
import { formatDate } from '@/utils/formatters';

interface Album {
    _id: string;
    title: string;
    artist: {
        _id: string;
        name: string;
    };
    coverArt: string;
    releaseDate: string;
}

interface NewReleasesSectionProps {
    albums: Album[];
}

const NewReleasesSection = ({ albums }: NewReleasesSectionProps) => {
    if (albums.length === 0) {
        return null;
    }

    return (
        <section>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">New Releases</h2>
                <Link href="/albums" className="text-blue-600 hover:underline">
                    See All
                </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                {albums.map((album) => (
                    <Link
                        key={album._id}
                        href={`/albums/${album._id}`}
                        className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-3"
                    >
                        <div className="aspect-square mb-3 bg-gray-200 rounded overflow-hidden">
                            {album.coverArt ? (
                                <img
                                    src={`${process.env.NEXT_PUBLIC_API_URL}/${album.coverArt}`}
                                    alt={album.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                    <span className="text-gray-500 text-sm">No Cover</span>
                                </div>
                            )}
                        </div>

                        <h3 className="font-medium text-gray-900 truncate">{album.title}</h3>
                        <p className="text-sm text-gray-600 truncate">{album.artist.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(album.releaseDate)}</p>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default NewReleasesSection;
