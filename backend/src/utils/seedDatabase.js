const {
    sequelize,
    User,
    Artist,
    Album,
    Genre,
    Track,
    SubscriptionPlan
} = require('../models');
const bcrypt = require('bcryptjs');
const logger = require('./logger');
const { v4: uuidv4 } = require('uuid');

/**
 * Seed the database with initial data
 */
async function seedDatabase() {
    try {
        logger.info('Starting database seed');

        // Sync database models - this will create tables if they don't exist
        await sequelize.sync({ force: true });
        logger.info('Database synchronized');

        // Create admin user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        const admin = await User.create({
            username: 'admin',
            email: 'admin@example.com',
            password: hashedPassword,
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin',
            subscriptionStatus: 'premium',
            isActive: true
        });

        logger.info('Admin user created');

        // Create regular user
        const userPassword = await bcrypt.hash('user123', salt);

        const user = await User.create({
            username: 'user',
            email: 'user@example.com',
            password: userPassword,
            firstName: 'Regular',
            lastName: 'User',
            role: 'user',
            subscriptionStatus: 'free',
            isActive: true
        });

        logger.info('Regular user created');

        // Create genres
        const genres = await Genre.bulkCreate([
            { name: 'Rock', description: 'Rock music is a broad genre of popular music that originated as "rock and roll" in the United States in the late 1940s and early 1950s.' },
            { name: 'Pop', description: 'Pop music is a genre of popular music that originated in its modern form during the mid-1950s in the United States and the United Kingdom.' },
            { name: 'Hip Hop', description: 'Hip hop music, also known as rap music, is a genre of popular music that originated in the United States in the 1970s.' },
            { name: 'Jazz', description: 'Jazz is a music genre that originated in the African-American communities of New Orleans, Louisiana, in the late 19th and early 20th centuries.' },
            { name: 'Classical', description: 'Classical music is art music produced or rooted in the traditions of Western culture, including both liturgical and secular music.' },
            { name: 'Electronic', description: 'Electronic music is music that employs electronic musical instruments, digital instruments, or circuitry-based music technology in its creation.' },
            { name: 'Country', description: 'Country music, also known as country and western, is a genre of popular music that originated in the southern United States in the early 1920s.' },
            { name: 'R&B', description: 'Rhythm and blues, often abbreviated as R&B, is a genre of popular music that originated in African-American communities in the 1940s.' }
        ]);

        logger.info('Genres created');

        // Create artists
        const artists = await Artist.bulkCreate([
            { name: 'John Smith', bio: 'A versatile artist known for rock and pop music.', country: 'United States' },
            { name: 'Maria Rodriguez', bio: 'A talented vocalist specializing in jazz and R&B.', country: 'Spain' },
            { name: 'DJ Electron', bio: 'An electronic music producer with a unique sound.', country: 'Germany' },
            { name: 'Classical Ensemble', bio: 'A group dedicated to performing classical music.', country: 'Austria' },
            { name: 'The Band', bio: 'A rock band with multiple chart-topping hits.', country: 'United Kingdom' }
        ]);

        logger.info('Artists created');

        // Create albums
        const albums = await Album.bulkCreate([
            { title: 'First Album', releaseDate: '2020-01-15', artistId: artists[0].id, description: 'The debut album featuring a mix of rock and pop songs.' },
            { title: 'Jazz Collection', releaseDate: '2019-05-22', artistId: artists[1].id, description: 'A collection of jazz standards and original compositions.' },
            { title: 'Electronic Dreams', releaseDate: '2021-03-10', artistId: artists[2].id, description: 'An electronic music album with futuristic sounds and beats.' },
            { title: 'Classical Masterpieces', releaseDate: '2018-11-30', artistId: artists[3].id, description: 'A compilation of classical music performances.' },
            { title: 'Rock Anthems', releaseDate: '2022-02-05', artistId: artists[4].id, description: 'A rock album featuring powerful anthems and ballads.' }
        ]);

        logger.info('Albums created');

        // Create tracks (in a real app, these would have actual file paths)
        const tracks = [];

        // Tracks for First Album
        for (let i = 1; i <= 10; i++) {
            tracks.push({
                title: `Rock Song ${i}`,
                duration: Math.floor(Math.random() * 180) + 120, // 2-5 minutes
                filePath: `/uploads/tracks/sample_track_${i}.mp3`,
                artistId: artists[0].id,
                albumId: albums[0].id,
                releaseDate: albums[0].releaseDate,
                playCount: Math.floor(Math.random() * 10000),
                lyrics: `Sample lyrics for Rock Song ${i}...`,
                isExplicit: false
            });
        }

        // Tracks for Jazz Collection
        for (let i = 1; i <= 8; i++) {
            tracks.push({
                title: `Jazz Piece ${i}`,
                duration: Math.floor(Math.random() * 240) + 180, // 3-7 minutes
                filePath: `/uploads/tracks/jazz_track_${i}.mp3`,
                artistId: artists[1].id,
                albumId: albums[1].id,
                releaseDate: albums[1].releaseDate,
                playCount: Math.floor(Math.random() * 5000),
                lyrics: `Instrumental jazz piece ${i}...`,
                isExplicit: false
            });
        }

        // Tracks for Electronic Dreams
        for (let i = 1; i <= 12; i++) {
            tracks.push({
                title: `Electronic Track ${i}`,
                duration: Math.floor(Math.random() * 300) + 120, // 2-7 minutes
                filePath: `/uploads/tracks/electronic_track_${i}.mp3`,
                artistId: artists[2].id,
                albumId: albums[2].id,
                releaseDate: albums[2].releaseDate,
                playCount: Math.floor(Math.random() * 8000),
                lyrics: `Electronic music with minimal lyrics ${i}...`,
                isExplicit: i % 5 === 0 // Some tracks are explicit
            });
        }

        // Tracks for Classical Masterpieces
        for (let i = 1; i <= 6; i++) {
            tracks.push({
                title: `Classical Symphony ${i}`,
                duration: Math.floor(Math.random() * 600) + 300, // 5-15 minutes
                filePath: `/uploads/tracks/classical_track_${i}.mp3`,
                artistId: artists[3].id,
                albumId: albums[3].id,
                releaseDate: albums[3].releaseDate,
                playCount: Math.floor(Math.random() * 3000),
                lyrics: `Instrumental classical piece ${i}...`,
                isExplicit: false
            });
        }

        // Tracks for Rock Anthems
        for (let i = 1; i <= 9; i++) {
            tracks.push({
                title: `Rock Anthem ${i}`,
                duration: Math.floor(Math.random() * 240) + 150, // 2.5-6.5 minutes
                filePath: `/uploads/tracks/rock_anthem_${i}.mp3`,
                artistId: artists[4].id,
                albumId: albums[4].id,
                releaseDate: albums[4].releaseDate,
                playCount: Math.floor(Math.random() * 15000),
                lyrics: `Epic rock lyrics for anthem ${i}...`,
                isExplicit: i % 3 === 0 // Some tracks are explicit
            });
        }

        const createdTracks = await Track.bulkCreate(tracks);
        logger.info('Tracks created');

        // Assign genres to tracks
        await Promise.all([
            // Rock songs get Rock genre
            ...createdTracks.slice(0, 10).map(track => track.setGenres([genres[0].id])),

            // Jazz pieces get Jazz genre
            ...createdTracks.slice(10, 18).map(track => track.setGenres([genres[3].id, genres[7].id])),

            // Electronic tracks get Electronic genre
            ...createdTracks.slice(18, 30).map(track => track.setGenres([genres[5].id])),

            // Classical tracks get Classical genre
            ...createdTracks.slice(30, 36).map(track => track.setGenres([genres[4].id])),

            // Rock anthems get Rock genre
            ...createdTracks.slice(36, 45).map(track => track.setGenres([genres[0].id]))
        ]);

        logger.info('Track genres assigned');

        // Create subscription plans
        const subscriptionPlans = await SubscriptionPlan.bulkCreate([
            {
                name: 'Free',
                price: 0.00,
                description: 'Ad-supported streaming with standard quality audio',
                features: [
                    'Ad-supported streaming',
                    'Standard quality audio',
                    'Create and manage playlists',
                    'Browse all music'
                ],
                durationMonths: 1
            },
            {
                name: 'Premium Individual',
                price: 9.99,
                description: 'Ad-free streaming with high quality audio and offline listening',
                features: [
                    'Ad-free streaming',
                    'High quality audio',
                    'Offline downloads',
                    'Create and manage playlists',
                    'Browse all music'
                ],
                durationMonths: 1
            },
            {
                name: 'Premium Family',
                price: 14.99,
                description: 'All premium features for up to 6 family members',
                features: [
                    'Up to 6 accounts',
                    'Ad-free streaming',
                    'High quality audio',
                    'Offline downloads',
                    'Create and manage playlists',
                    'Browse all music',
                    'Family Mix playlist'
                ],
                durationMonths: 1
            },
            {
                name: 'Premium Student',
                price: 4.99,
                description: 'Premium features at a discounted price for students',
                features: [
                    'Ad-free streaming',
                    'High quality audio',
                    'Offline downloads',
                    'Create and manage playlists',
                    'Browse all music',
                    'Student discount'
                ],
                durationMonths: 1
            },
            {
                name: 'Premium Annual',
                price: 99.99,
                description: 'Premium features with annual billing (save 17%)',
                features: [
                    'Ad-free streaming',
                    'High quality audio',
                    'Offline downloads',
                    'Create and manage playlists',
                    'Browse all music',
                    'Annual billing (save 17%)'
                ],
                durationMonths: 12
            }
        ]);

        logger.info('Subscription plans created');

        // Have the user like some tracks
        await user.addLikedTracks([
            createdTracks[2].id,
            createdTracks[7].id,
            createdTracks[15].id,
            createdTracks[22].id,
            createdTracks[38].id
        ]);

        logger.info('User likes assigned');

        logger.info('Database seed completed successfully');
        return true;
    } catch (error) {
        logger.error('Database seed error:', error);
        return false;
    }
}

// Export the function to be called from other files
module.exports = seedDatabase;

// If this file is run directly, execute the seed function
if (require.main === module) {
    seedDatabase()
        .then(() => {
            console.log('Seed completed');
            process.exit(0);
        })
        .catch(error => {
            console.error('Seed failed:', error);
            process.exit(1);
        });
}