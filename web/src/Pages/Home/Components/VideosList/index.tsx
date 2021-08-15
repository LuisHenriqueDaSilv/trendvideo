import {useEffect, useState, useContext} from 'react'
import {useHistory} from 'react-router-dom'
import InfiniteScroll from 'react-infinite-scroll-component'

import styles from './styles.module.scss'

//Services
import {logout} from '../../../../Services/Authorization'

//Contexts
import AlertContext from '../../../../Contexts/AlertContext'

//Interfaces
import { VideoType, VideoPageProps } from '../../../../@types'

//Services 
import getVideos from '../../../../Services/GetVideos'

export function VideosList(){

    const history = useHistory()

    const {showAlert} = useContext(AlertContext)

    const [sortBy, setSortBy] = useState<'latest' | 'oldest' | 'most_liked'>('latest')
    const [videos, setVideos] = useState<VideoType[]>([])
    const [hasMoreVideos, setHasMoreVideos] = useState<boolean>(true)
    const [isLoadingVideos, setIsLoadingVideos] = useState<boolean>(true)

    const getMoreVideos = async (start:number) => {

        setIsLoadingVideos(true)

        const response = await getVideos({
            sortBy,
            start
        }) as any

        if(response.error){

            if(response.errorMessage === 'Could not find any video'){
                setHasMoreVideos(false)
                
            }else if(response.errorMessage === 'Invalid authorization token'){
                logout()
                history.push('/')
            }else {
                showAlert({
                    message: response.errorMessage,
                    title: 'error'
                })
            }

            setIsLoadingVideos(false)
            return

        }

        if(!response){
            setIsLoadingVideos(false)
            return
        }

        setIsLoadingVideos(false)

        if(start){
            setVideos([...videos, ...response])
        }else {
            setVideos(response)
        }

    }

    const goToVideosPage = (video:VideoType) => {

        const state: VideoPageProps = {
            sortBy,
            videos,
            currentVideo: video,
        }


        history.push('/videos', state)
    }

    useEffect(() => {
        setHasMoreVideos(true)
        setVideos([])
        getMoreVideos(0)
        
        // eslint-disable-next-line
    }, [sortBy])

    if(!videos){
        return <h1>Carregando</h1>
    }

    return(
        <div className={styles.videosContainer}>
            <div className={styles.videosOptionsContainer}>
                <div>
                    <label>Sort by:</label>
                    <select 
                        onChange={(event:any) => {setSortBy(event.target.value)}}
                    >
                        <option value="latest">Latest first</option>
                        <option value="oldest">Oldest first</option>
                        <option value="most_liked">Most liked</option>
                    </select>
                </div>
            </div>
            <InfiniteScroll
                className={styles.videos}
                dataLength={videos.length}
                next={() => {getMoreVideos(videos.length)}}
                hasMore={hasMoreVideos}
                loader={
                    <></>
                }
                endMessage={
                    <></>
                }
            >
                {
                    videos.map((video) => {
                        return (
                            <button
                                onClick={() => {goToVideosPage(video)}}
                                className={styles.video}
                                key={video.video_data.id}
                                style={{
                                    backgroundImage: `url(${video.video_data.thumbnail_url})`,
                                }}
                            >
                                <div className={styles.videoInfoContainer}>
                                    <label>{video.video_data.likes}</label>
                                    <img alt="Likes" src="/icons/Like.png"/>
                                </div>
                            </button>
                        )
                    })
                }
            </InfiniteScroll>
            <div className={styles.endMessageContainer}>
                {
                    isLoadingVideos? (
                        <h1>
                            Loading...
                        </h1>
                    ):(
                        hasMoreVideos? (
                            null
                        ):(
                            <h1>
                                Its the end! try reload page to get latests videos
                            </h1>
                        )
                    )
                }
            </div>
        </div>
    )
}
