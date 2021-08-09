import {ReactNode} from 'react'

export interface contextProviderProps {
    children: ReactNode
}

export interface showAlertParams {
    title: 'error'|string,
    message: string
}

export interface AlertContextData {
    showAlert: (params: showAlertParams) => void,
    closeAlert: () => void
}

export interface AlertProps{
    title: 'error'|string,
    percentageToEnd: number,
    message: string,
    closeAlert: () => void
}

export interface LoadingContextData {
    enableLoading: () => void,
    disableLoading: () => void
}


export interface VideoType {
    url: string,
    video_data: {
        likes: string,
        id: number,
        description: string,
        created_at: string,
        thumbnail_url: string,
        name: string
    },
    owner: {
        username: string,
        created_at: string,
        followers: string,
        image_url: string
    }
}


export interface VideoPageProps {
    currentVideo: VideoType,
    sortBy: 'latest' | 'oldest' | 'most_liked',
    videos: VideoType[]
}