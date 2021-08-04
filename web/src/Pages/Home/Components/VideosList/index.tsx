import {useEffect, useState, useContext} from 'react'
import {useCookies} from 'react-cookie'
import InfiniteScroll from 'react-infinite-scroll-component'

import styles from './styles.module.scss'

//Services
import api from '../../../../Services/api'
import {logout} from '../../../../Services/authorization'

//Contexts
import AlertContext from '../../../../Contexts/AlertContext'

//Interfaces
import {Video} from '../../../../@types'

export function VideosList(){

    const [cookies] = useCookies(['authorization'])
    const {showAlert} = useContext(AlertContext)

    const [sortBy, setSortBy] = useState<'latest' | 'oldest' | 'most_liked'>('latest')
    const [videos, setVideos] = useState<Video[]>([])
    const [hasMoreVideos, setHasMoreVideos] = useState<boolean>(true)
    const [isLoadingVideos, setIsLoadingVideos] = useState<boolean>(true)

    const getVideos = async () => {

        setIsLoadingVideos(true)

        const token = cookies.token

        const headers = {
            authorization: `Bearer ${token}`
        }

        const response = await api.get(`/videos?start=${videos.length}&order_by=${sortBy}`, {headers}).catch((error) => {

            console.log(error.response.data.message)

            if(error.response){

                const error_message = error.response.data.message

                if(error_message === 'Could not find any video'){
                    setHasMoreVideos(false)
                    
                }else if(error_message === 'Invalid authorization token'){
                    logout()
                }

            }else {
                showAlert({
                    message: 'Something went wrong in get videos process',
                    title: 'error'
                })
            }

            return 
        }) as any

        if(!response){
            setIsLoadingVideos(false)
            return
        }

        setVideos([...videos, ...response.data])
        setHasMoreVideos(true)
        setIsLoadingVideos(false)

    }

    useEffect(() => {
        setVideos([])
        setHasMoreVideos(true)
        getVideos()
    }, [sortBy])

    const handleSelectChange = (event:any) => {
        setSortBy(event.target.value)
    }

    if(!videos){
        return <h1>Carregando</h1>
    }

    return(
        <div className={styles.videosContainer}>
            <div className={styles.videosOptionsContainer}>
                <div>
                    <label>Sort by:</label>
                    <select onChange={handleSelectChange}>
                        <option value="latest">Latest first</option>
                        <option value="oldest">Oldest first</option>
                        <option value="most_liked">Most liked</option>
                    </select>
                </div>
            </div>
            <InfiniteScroll
                className={styles.videos}
                dataLength={videos.length}
                next={getVideos}
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
                            <div>
                                <img src={video.video_data.thumbnail_url}/>
                            </div>
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
