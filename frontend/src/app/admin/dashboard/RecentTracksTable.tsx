'use client'

import * as React from "react"
import { formatDate, formatFileSize } from "@/lib/utils"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from "@tanstack/react-table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown, 
  MoreHorizontal,
  Edit,
  Trash,
  Eye
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Track data type
type Track = {
  id: string
  title: string
  artist: string
  album: string
  genre: string
  uploadDate: string
  status: "published" | "pending" | "rejected"
  fileSize: number
  coverImage: string
}

// Dummy data
const tracks: Track[] = [
  {
    id: "track1",
    title: "Summer Vibes",
    artist: "Electric Dreams",
    album: "Electric Dreams",
    genre: "Electronic",
    uploadDate: "2023-08-15T12:00:00",
    status: "published",
    fileSize: 8524288, // 8.1 MB
    coverImage: "/placeholder/400/400",
  },
  {
    id: "track2",
    title: "Midnight Drive",
    artist: "Neon Lights",
    album: "Night Drive",
    genre: "Synthwave",
    uploadDate: "2023-08-14T15:30:00",
    status: "published",
    fileSize: 7340032, // 7 MB
    coverImage: "/placeholder/400/400",
  },
  {
    id: "track3",
    title: "Lost in Translation",
    artist: "Urban Echoes",
    album: "Urban Stories",
    genre: "Hip-Hop",
    uploadDate: "2023-08-14T09:15:00",
    status: "pending",
    fileSize: 9123840, // 8.7 MB
    coverImage: "/placeholder/400/400",
  },
  {
    id: "track4",
    title: "Ocean Waves",
    artist: "Coastal Symphony",
    album: "Waves",
    genre: "Ambient",
    uploadDate: "2023-08-13T17:45:00",
    status: "published",
    fileSize: 6815744, // 6.5 MB
    coverImage: "/placeholder/400/400",
  },
  {
    id: "track5",
    title: "City Lights",
    artist: "Metropolis",
    album: "Downtown",
    genre: "Alternative",
    uploadDate: "2023-08-12T14:20:00",
    status: "published",
    fileSize: 7654400, // 7.3 MB
    coverImage: "/placeholder/400/400",
  },
  {
    id: "track6",
    title: "Eclipse",
    artist: "Lunar Phase",
    album: "Moon Cycles",
    genre: "Ambient",
    uploadDate: "2023-08-12T11:10:00",
    status: "rejected",
    fileSize: 9437184, // 9 MB
    coverImage: "/placeholder/400/400",
  },
  {
    id: "track7",
    title: "Digital Dreams",
    artist: "Pixel Pulse",
    album: "8-Bit Memories",
    genre: "Chiptune",
    uploadDate: "2023-08-11T16:25:00",
    status: "published",
    fileSize: 5242880, // 5 MB
    coverImage: "/placeholder/400/400",
  },
  {
    id: "track8",
    title: "Mountain High",
    artist: "Alpine Echo",
    album: "Summit",
    genre: "Folk",
    uploadDate: "2023-08-10T13:40:00",
    status: "published",
    fileSize: 7036928, // 6.7 MB
    coverImage: "/placeholder/400/400",
  },
]

export function RecentTracksTable() {
  // Define table columns
  const columns: ColumnDef<Track>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => {
        const track = row.original
        return (
          <div className="flex items-center space-x-3">
            <Avatar className="h-9 w-9 rounded-sm">
              <AvatarImage src={track.coverImage} alt={track.title} />
              <AvatarFallback className="rounded-sm">
                {track.title.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{track.title}</div>
              <div className="text-xs text-muted-foreground">{track.artist}</div>
            </div>
          </div>
        )
      }
    },
    {
      accessorKey: "album",
      header: "Album",
    },
    {
      accessorKey: "genre",
      header: "Genre",
    },
    {
      accessorKey: "uploadDate",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Upload Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => formatDate(row.original.uploadDate),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status
        
        let badgeVariant:
          | "default"
          | "secondary"
          | "destructive"
          | "outline" = "default"
        
        switch (status) {
          case "published":
            badgeVariant = "default"
            break
          case "pending":
            badgeVariant = "secondary"
            break
          case "rejected":
            badgeVariant = "destructive"
            break
          default:
            badgeVariant = "outline"
        }
        
        return (
          <Badge variant={badgeVariant}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        )
      },
    },
    {
      accessorKey: "fileSize",
      header: "File Size",
      cell: ({ row }) => formatFileSize(row.original.fileSize),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const track = row.original
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                <span>View</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Trash className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  // Set up table
  const table = useReactTable({
    data: tracks,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Tracks</CardTitle>
        <CardDescription>
          The most recently uploaded tracks on your platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No tracks found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous page</span>
          </Button>
          <div className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next page</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}