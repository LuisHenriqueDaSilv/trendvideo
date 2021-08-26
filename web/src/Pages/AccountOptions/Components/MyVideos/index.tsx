import { useContext, useState } from 'react'
import {useCookies} from 'react-cookie'
import InfiniteScroll from 'react-infinite-scroll-component'

//Styles
import styles from './styles.module.scss'

//Contexts
import alertContext from '../../../../Contexts/AlertContext'
import loadingContext from '../../../../Contexts/LoadingContext'

//Services
import {getVideosFromUsername} from '../../../../Services/GetVideos'
import {logout} from '../../../../Services/Authorization'
import api from '../../../../Services/Api'

//Interfaces
import {VideoType} from '../../../../@types'
import { useHistory } from 'react-router-dom'
import { useEffect } from 'react'

export function MyVideos(){

    const history = useHistory()
    const [cookies] = useCookies()

    const {showAlert} = useContext(alertContext)
    const {enableLoading, disableLoading} = useContext(loadingContext)

    const [isLoadingMoreVideos, setIsLoadingMoreVideos] = useState<boolean>(false)
    const [hasMoreVideos, setHasMoreVideos] = useState<boolean>(true)
    const [videos, setVideos] = useState<VideoType[]>([])

    useEffect(() => {
        getVideos()
        // eslint-disable-next-line
    }, [])

    async function getVideos() {

        if(isLoadingMoreVideos){
            return
        }

        setIsLoadingMoreVideos(true)

        const username = localStorage.getItem('username')


        if(!username){
            return
        }
        
        const response = await getVideosFromUsername({
            start: videos.length,
            username
        }) as any

        if(response.error){

            if(response.errorMessage === 'Invalid authorization token') {
                logout()
                history.push('/')
            }else if(response.errorMessage === 'Could not find any video'){

                return setHasMoreVideos(false)

            } else {
                showAlert({
                    message: response.errorMessage,
                    title: 'error'
                })
            }
            setIsLoadingMoreVideos(false)
            return
        }

        setVideos([...videos, ...response])
        setIsLoadingMoreVideos(false)
    }

    async function handleDeleteVideo(videoToDelete:VideoType){

        enableLoading()

        const token = cookies.token

        const headers = {
            authorization: `Bearer ${token}`
        }

        const data = new FormData()
        
        data.append('video_id', videoToDelete.video_data.id.toString()) 

        const response = await api.delete(
            '/video/delete',
            {
                headers,
                data
            }
        ).catch((error) => {

            if(error.response){

                const errorMessage = error.response.data.message

                if(errorMessage === 'Invalid authorization token') {
                    logout()
                    history.push('/')
                }else {
                    showAlert({
                        title: 'error',
                        message: errorMessage
                    })
                }

            }else {
                showAlert({
                    title: 'error',
                    message: 'Something went wrong in delete video process'
                })
            }

            return
        })

        if(!response){
            disableLoading()
            return
        }

        const newVideosData = [...videos]
        const videosIds = newVideosData.map((video) => {
            return(video.video_data.id)
        })

        const deletedVideoIndex = videosIds.indexOf(videoToDelete.video_data.id)

        newVideosData.splice(deletedVideoIndex, 1)

        setVideos(newVideosData)

        disableLoading()

    } 

    return (
        <div className={styles.myVideosContainer}>
            <h1>Your Videos</h1>

            <table>
                <InfiniteScroll 
                        className={styles.videosContainer}

                        dataLength={videos.length}
                        next={() => {getVideos()}}
                        hasMore={hasMoreVideos}
                        loader={
                            <></>
                        }
                        endMessage={
                            <></>
                        }
                >
                    <tr>
                        <th>Thumbnail</th>
                        <th>Likes</th>
                        <th>Description</th>
                        <th>Comments</th>
                        <th>Delete</th>
                    </tr>
                    {
                        videos.map((video) => {
                            return (
                                <tr className={styles.videoContainer}>
                                    <td>
                                        <div 
                                            className={styles.thumbnailImage}
                                            style={{
                                                backgroundImage: `url(${video.video_data.thumbnail_url})`
                                            }}
                                        />
                                    </td>
                                    <td>
                                        {video.video_data.likes}
                                    </td>
                                    <td className={styles.descriptionArea}>bb{video.video_data.description}</td>
                                    <td>{video.video_data.comments}</td>
                                    <td>
                                        <button 
                                            onClick={() => {handleDeleteVideo(video)}}
                                            className={styles.deleteButton}
                                        >
                                            <img alt="Delete" src="/icons/DeleteIcon.png"/>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            )
                        })
                    }
                </InfiniteScroll>
            </table>
            {
                hasMoreVideos? (
                    isLoadingMoreVideos&& (
                        <h1>Loading videos</h1>
                    )
                ) : (
                    <h1>This account not have more videos</h1>
                )
            }
        </div>
    )
}