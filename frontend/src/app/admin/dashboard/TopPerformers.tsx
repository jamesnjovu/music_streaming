'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatNumber } from "@/lib/utils"

// Mock data for demonstration
const topTracks = [
  {
    id: "track1",
    title: "Summer Vibes",
    artist: "Electric Dreams",
    plays: 186452,
    coverImage: "/placeholder/400/400",
  },
  {
    id: "track2",
    title: "Midnight Drive",
    artist: "Neon Lights",
    plays: 142739,
    coverImage: "/placeholder/400/400",
  },
  {
    id: "track3",
    title: "Lost in Translation",
    artist: "Urban Echoes",
    plays: 128304,
    coverImage: "/placeholder/400/400",
  },
  {
    id: "track4",
    title: "Ocean Waves",
    artist: "Coastal Symphony",
    plays: 115982,
    coverImage: "/placeholder/400/400",
  },
  {
    id: "track5",
    title: "City Lights",
    artist: "Metropolis",
    plays: 103745,
    coverImage: "/placeholder/400/400",
  },
]

const topArtists = [
  {
    id: "artist1",
    name: "Electric Dreams",
    followers: 2453789,
    genres: ["Electronic", "Pop"],
    profileImage: "/placeholder/400/400",
  },
  {
    id: "artist2",
    name: "Urban Echoes",
    followers: 1854236,
    genres: ["Hip-Hop", "R&B"],
    profileImage: "/placeholder/400/400",
  },
  {
    id: "artist3",
    name: "Neon Lights",
    followers: 1653982,
    genres: ["Synthwave", "Electronic"],
    profileImage: "/placeholder/400/400",
  },
  {
    id: "artist4",
    name: "Coastal Symphony",
    followers: 1427683,
    genres: ["Ambient", "Chill"],
    profileImage: "/placeholder/400/400",
  },
  {
    id: "artist5",
    name: "Metropolis",
    followers: 1238976,
    genres: ["Alternative", "Rock"],
    profileImage: "/placeholder/400/400",
  },
]

const topAlbums = [
  {
    id: "album1",
    title: "Electric Dreams",
    artist: "Electric Dreams",
    plays: 876542,
    coverImage: "/placeholder/400/400",
  },
  {
    id: "album2",
    title: "Night Drive",
    artist: "Neon Lights",
    plays: 754236,
    coverImage: "/placeholder/400/400",
  },
  {
    id: "album3",
    title: "Urban Stories",
    artist: "Urban Echoes",
    plays: 678921,
    coverImage: "/placeholder/400/400",
  },
  {
    id: "album4",
    title: "Waves",
    artist: "Coastal Symphony",
    plays: 587643,
    coverImage: "/placeholder/400/400",
  },
  {
    id: "album5",
    title: "Downtown",
    artist: "Metropolis",
    plays: 526321,
    coverImage: "/placeholder/400/400",
  },
]

export function TopPerformers() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Performers</CardTitle>
        <CardDescription>
          The most popular content on your platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="tracks">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="tracks" className="flex-1">Tracks</TabsTrigger>
            <TabsTrigger value="artists" className="flex-1">Artists</TabsTrigger>
            <TabsTrigger value="albums" className="flex-1">Albums</TabsTrigger>
          </TabsList>
          
          {/* Tracks tab content */}
          <TabsContent value="tracks">
            <div className="space-y-4">
              {topTracks.map((track, index) => (
                <div key={track.id} className="flex items-center space-x-3">
                  <div className="text-muted-foreground font-medium w-5 text-center">
                    {index + 1}
                  </div>
                  <Avatar className="h-10 w-10 rounded-sm">
                    <AvatarImage src={track.coverImage} alt={track.title} />
                    <AvatarFallback className="rounded-sm">
                      {track.title.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{track.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatNumber(track.plays)} plays
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          {/* Artists tab content */}
          <TabsContent value="artists">
            <div className="space-y-4">
              {topArtists.map((artist, index) => (
                <div key={artist.id} className="flex items-center space-x-3">
                  <div className="text-muted-foreground font-medium w-5 text-center">
                    {index + 1}
                  </div>
                  <Avatar className="h-10 w-10 rounded-full">
                    <AvatarImage src={artist.profileImage} alt={artist.name} />
                    <AvatarFallback>
                      {artist.name.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{artist.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {artist.genres.join(", ")}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatNumber(artist.followers)} followers
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          {/* Albums tab content */}
          <TabsContent value="albums">
            <div className="space-y-4">
              {topAlbums.map((album, index) => (
                <div key={album.id} className="flex items-center space-x-3">
                  <div className="text-muted-foreground font-medium w-5 text-center">
                    {index + 1}
                  </div>
                  <Avatar className="h-10 w-10 rounded-sm">
                    <AvatarImage src={album.coverImage} alt={album.title} />
                    <AvatarFallback className="rounded-sm">
                      {album.title.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{album.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{album.artist}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatNumber(album.plays)} plays
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}