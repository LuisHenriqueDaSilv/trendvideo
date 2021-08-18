import {ReactNode} from 'react'

export interface contextProviderProps {
    children: ReactNode
}

export interface VideoType {
    url: string,
    video_data: {
        likes: string,
        id: number,
        description: string,
        created_at: string,
        thumbnail_url: string,
        name: string,
        liked: boolean
    },
    owner: {
        username: string,
        created_at: string,
        followers: string,
        image_url: string,
        followed: boolean,
        id: number
    }
}

export interface VideoPageProps {
    currentVideo: VideoType,
    sortBy?: 'latest' | 'oldest' | 'most_liked',
    videos: VideoType[]
}