const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

// User Model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  firstName: {
    type: DataTypes.STRING
  },
  lastName: {
    type: DataTypes.STRING
  },
  profileImage: {
    type: DataTypes.STRING
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user'
  },
  subscriptionStatus: {
    type: DataTypes.ENUM('free', 'premium'),
    defaultValue: 'free'
  },
  subscriptionExpiryDate: {
    type: DataTypes.DATE
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastLogin: {
    type: DataTypes.DATE
  }
});

// Artist Model
const Artist = sequelize.define('Artist', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  bio: {
    type: DataTypes.TEXT
  },
  profileImage: {
    type: DataTypes.STRING
  },
  country: {
    type: DataTypes.STRING
  }
});

// Album Model
const Album = sequelize.define('Album', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  releaseDate: {
    type: DataTypes.DATEONLY
  },
  coverImage: {
    type: DataTypes.STRING
  },
  description: {
    type: DataTypes.TEXT
  }
});

// Genre Model
const Genre = sequelize.define('Genre', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT
  }
});

// Track Model
const Track = sequelize.define('Track', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER, // Duration in seconds
    allowNull: false
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: false
  },
  filePathHQ: {
    type: DataTypes.STRING // High-quality version path
  },
  coverImage: {
    type: DataTypes.STRING
  },
  releaseDate: {
    type: DataTypes.DATEONLY
  },
  isExplicit: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  playCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lyrics: {
    type: DataTypes.TEXT
  }
});

// Playlist Model
const Playlist = sequelize.define('Playlist', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  coverImage: {
    type: DataTypes.STRING
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

// ListeningSession Model (for shared listening)
const ListeningSession = sequelize.define('ListeningSession', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  currentTrackId: {
    type: DataTypes.UUID,
    references: {
      model: 'Tracks',
      key: 'id'
    }
  },
  currentPosition: {
    type: DataTypes.INTEGER, // Position in seconds
    defaultValue: 0
  },
  isPlaying: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

// Subscription Plan Model
const SubscriptionPlan = sequelize.define('SubscriptionPlan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  features: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
  durationMonths: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  }
});

// UserSubscription Model (for tracking user subscriptions)
const UserSubscription = sequelize.define('UserSubscription', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  autoRenew: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  paymentMethod: {
    type: DataTypes.STRING
  },
  paymentId: {
    type: DataTypes.STRING
  }
});

// Define relationships
User.hasMany(Playlist);
Playlist.belongsTo(User);

Artist.hasMany(Album);
Album.belongsTo(Artist);

Artist.hasMany(Track);
Track.belongsTo(Artist);

Album.hasMany(Track);
Track.belongsTo(Album);

Track.belongsToMany(Genre, { through: 'TrackGenres' });
Genre.belongsToMany(Track, { through: 'TrackGenres' });

Playlist.belongsToMany(Track, { through: 'PlaylistTracks' });
Track.belongsToMany(Playlist, { through: 'PlaylistTracks' });

User.belongsToMany(Track, { through: 'UserLikedTracks', as: 'LikedTracks' });
Track.belongsToMany(User, { through: 'UserLikedTracks', as: 'LikedBy' });

User.belongsToMany(Album, { through: 'UserLikedAlbums', as: 'LikedAlbums' });
Album.belongsToMany(User, { through: 'UserLikedAlbums', as: 'LikedBy' });

User.belongsToMany(Artist, { through: 'UserFollowedArtists', as: 'FollowedArtists' });
Artist.belongsToMany(User, { through: 'UserFollowedArtists', as: 'FollowedBy' });

User.belongsToMany(ListeningSession, { through: 'SessionParticipants' });
ListeningSession.belongsToMany(User, { through: 'SessionParticipants' });

User.hasOne(UserSubscription, { foreignKey: 'userId' });
UserSubscription.belongsTo(User);

SubscriptionPlan.hasMany(UserSubscription);
UserSubscription.belongsTo(SubscriptionPlan);

ListeningSession.belongsTo(User, { as: 'host' });

// Export models
module.exports = {
  sequelize,
  User,
  Artist,
  Album,
  Genre,
  Track,
  Playlist,
  ListeningSession,
  SubscriptionPlan,
  UserSubscription
};