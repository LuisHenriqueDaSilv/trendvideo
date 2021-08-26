import {useState, useContext, useEffect} from 'react'
import {Link, useHistory} from 'react-router-dom'
import InfiniteScroll from 'react-infinite-scroll-component'

import styles from './styles.module.scss'

//Services
import {getFollowedsVideo} from '../../../../Services/GetVideos'
import {logout} from '../../../../Services/Authorization'
import likeVideo from '../../../../Services/LikeVideo'

//Contexts
import alertContext from '../../../../Contexts/AlertContext'

//Interfaces
import {VideoType, VideoPageProps} from '../../../../@types'

export function FollowedVideos(){

    const history = useHistory() 

    const {showAlert} = useContext(alertContext)

    const [isMuteVideos, setIsMuteVideos] = useState<boolean>(true) 
    const [videos, setVideos] = useState<VideoType[]>([])
    const [hasMoreVideos, setHasMoreVideos] = useState<boolean>(true)
    const [isLoadingVideos, setIsLoadingVideos] = useState<boolean>(false)
    const [playingVideoIndex, setPlayingVideoIndex] = useState<number>(0)

    useEffect(() => {
        getMoreVideos()
        // eslint-disable-next-line
    }, [])

    async function getMoreVideos(){

        if(isLoadingVideos){
            return
        }

        setIsLoadingVideos(true)

        const response = await getFollowedsVideo({start: videos.length})
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
            setIsLoadingVideos(false)
            return
        }

        setVideos([...videos, ...response])
        setIsLoadingVideos(false)
    }

    function handleGoToVideosPage(video:VideoType){
        const state: VideoPageProps = {
            videos,
            currentVideo: video,
        }

        history.push('/videos?followeds=true', state)
    }

    async function handleLikeVideo(video:VideoType){

        const response = await likeVideo(video) as any

        if(response.error){

            if(response.errorMessage === 'video not found'){
                showAlert({
                    message: 'Probably this video was deleted',
                    title: 'error'
                })
            }else if(response.errorMessage === 'Invalid authorization token'){
                logout()
                history.push('/')
            }else {
                showAlert({
                    message: response.errorMessage,
                    title: 'error'
                })
            }
            return
        }

        const newVideosData = [...videos]
        const likedVideoIndex = newVideosData.indexOf(video)

        if(response.message === 'like'){
            const likes = Number(
                newVideosData[likedVideoIndex].video_data.likes
            )
            if(!Number.isNaN(likes)){
                newVideosData[
                    likedVideoIndex
                ].video_data.likes = (likes + 1).toString()
            }
            newVideosData[likedVideoIndex].video_data.liked = true
        }else {
            const likes = Number(
                newVideosData[likedVideoIndex].video_data.likes
            )
            if(!Number.isNaN(likes)){
                newVideosData[
                    likedVideoIndex
                ].video_data.likes = (likes - 1).toString()
            }
            newVideosData[likedVideoIndex].video_data.liked = false
        }
        setVideos(newVideosData)
    }
    
    return (
        <InfiniteScroll
                className={styles.followedVideosContainer}

                dataLength={videos.length}
                next={() => {getMoreVideos()}}
                hasMore={hasMoreVideos}
                loader={
                    <h1>Loading more videos</h1>
                }
                endMessage={
                    <h1>These were all the account videos you follow.</h1>
                }
        >

            {videos.map((video, index) => {
                return (

                    <div className={styles.videoContainer}>
                        <Link
                            to={`/user/${video.owner.username}`}
                            className={styles.accountArea}
                        >
                            <img 
                                src="/Logo.png"
                                alt=""
                            />
                            <h1>{video.owner.username}</h1>
                            <div/>
                        </Link>
                        {
                            index === playingVideoIndex? (
                                <video
                                    className={styles.video}
                                    autoPlay
                                    loop={true}
                                    muted={isMuteVideos}
                                    controls={false}
                                    key={video.url}
                                >
                                    <source 
                                        src={video.url}
                                        type="video/ogg"
                                    />
                                    Your browser does not support video.
                                </video>
                            ): (
                                <img
                                    src={video.video_data.thumbnail_url}
                                    onClick={
                                        () => {setPlayingVideoIndex(index)}
                                    }
                                    alt="Video thumbnail"
                                />
                            )
                        }
                        <div className={styles.videoOptionsArea}>
                            <button onClick={() => {handleLikeVideo(video)}}>
                                <img
                                    src="/icons/Like.png"
                                    alt="Like"
                                    id={video.video_data.liked? '': styles.unlikedButton}
                                />
                                <label>{video.video_data.likes}</label>
                            </button>
                            <button 
                                id={styles.invertColor}
                                onClick={() => {setIsMuteVideos(!isMuteVideos)}}
                            >
                                <img
                                    src={
                                        isMuteVideos?"/icons/Mute.png":"/icons/Unmute.png"
                                    }
                                    alt={isMuteVideos?"Unmute":"Mute"}
                                />
                            </button>
                            <button 
                                id={styles.invertColor}
                                onClick={() => {handleGoToVideosPage(video)}}
                            >
                                <img
                                    src="/icons/FullScreenIcon.png"
                                    alt="FullScreen"
                                />
                            </button>
                        </div>
                    </div>
                )
            }) }

        </InfiniteScroll>
    )
}