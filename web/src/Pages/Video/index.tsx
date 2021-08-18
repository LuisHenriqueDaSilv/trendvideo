import {useEffect, useState, useRef, useContext } from 'react'
import {useHistory, useLocation, Link} from 'react-router-dom'
import Bounce from 'react-reveal/Bounce'


import styles from './styles.module.scss'

import {VideoPageProps, VideoType} from '../../@types'

//Components
import {EndListMessage} from './Components/EndListMessage'
import {CommentsArea} from './Components/CommentsArea'

//Services
import {logout} from '../../Services/Authorization'
import likeVideo from '../../Services/LikeVideo'
import {getVideos} from '../../Services/GetVideos'
import followAccount from '../../Services/FollowAccount'

//Contexts
import AlertContext from '../../Contexts/AlertContext'


export function VideoPage(){

    const countdownTimeoutRef = useRef(0);

    const history = useHistory()
    const location = useLocation() as {state: VideoPageProps}
    
    const {showAlert} = useContext(AlertContext)

    const [isMuteVideos, setIsMuteVideos] = useState<boolean>(true)
    const [videos, setVideos] = useState<VideoType[]>([])
    const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(0)
    const [previousVideoIndex, setPreviousVideoIndex] = useState<number>(0)
    const [isToSlideVideoUp, setIsToSlideVideoUp] = useState<boolean>(true)
    const [
        sortBy, 
        setSortBy
    ] = useState<'latest' | 'oldest' | 'most_liked'>('latest')

    const [
        isLoadingMoreVideos, 
        setIsLoadingMoreVideos
    ] = useState<boolean>(false)
    const [hasMoreVideos, setHasMoreVideos] = useState<boolean>(true)

    
    useEffect(() => {

        if(!location.state || !location.state.videos){
            history.push('/')
        }

        const currentVideoIndex_ = location.state.videos.indexOf(
            location.state.currentVideo
        ) as number
        
        setVideos(location.state.videos)
        setCurrentVideoIndex(currentVideoIndex_)
        setSortBy(location.state.sortBy)
        
    // eslint-disable-next-line
    }, [])

    useEffect(() => {

        window.clearTimeout(countdownTimeoutRef.current)
        countdownTimeoutRef.current = window.setTimeout(() => {
            setPreviousVideoIndex(-10)
        }, 500)

    }, [previousVideoIndex])

    useEffect(() => {
        if(currentVideoIndex === videos.length-2){
            handleGetMoreVideos()
        }

    // eslint-disable-next-line
    }, [currentVideoIndex])

    const handleNextVideo = () => {
        setIsToSlideVideoUp(false)

        if(currentVideoIndex <= videos.length - 1){
            setPreviousVideoIndex(currentVideoIndex)
            setCurrentVideoIndex(currentVideoIndex +1)
        }
    }

    const handlePreviousVideo = () => {
        setIsToSlideVideoUp(true)

        if(currentVideoIndex >= 0){
            setPreviousVideoIndex(currentVideoIndex)
            setCurrentVideoIndex(currentVideoIndex - 1)
        }
    }

    const handleLikeVideo = async (video:VideoType) => {
        
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

    const handleFollowAccount = async (accountId:number) => {

        const response = await followAccount(accountId)

        if(response.error){
            if(response.errorMessage === 'Invalid authorization token'){
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

        const newVideoData = [...videos]
        
        // eslint-disable-next-line
        newVideoData.map((video) => {

            if(video.owner.id === accountId){
                video.owner.followed = response.message === 'Follow'
            }

        })

        setVideos(newVideoData)
    }

    const handleGetMoreVideos = async () => {

        if(!hasMoreVideos || isLoadingMoreVideos){
            return
        }
        
        setIsLoadingMoreVideos(true)
        
        const response = await getVideos({
            sortBy: sortBy,
            start:videos.length
        }) as any

        if(response.error){
                if(response.errorMessage === 'Could not find any video'){
                    setHasMoreVideos(false)
                    
                }else if(
                    response.errorMessage === 'Invalid authorization token'
                ){
                    logout()
                    history.push('/')
                }else {
                    showAlert({
                        message: 'Something went wrong in get videos process',
                        title: 'error'
                    })
                }

                setIsLoadingMoreVideos(false)

                return
        }

        if(!response){
            setIsLoadingMoreVideos(false)
            return
        }

        setIsLoadingMoreVideos(false)
        setVideos([...videos, ...response])

    }

    return (
        <>
            <button 
                className={styles.carouselController}
                id={styles.previousButton}
                onClick={handlePreviousVideo}
            >
                <img 
                    alt="Previous"
                    src="/icons/Caret.svg"
                />
            </button>

            { 
                currentVideoIndex >= videos.length? (
                    <EndListMessage 
                        type={
                            isLoadingMoreVideos? "loading":"end"
                        }
                    />
                ) : (
                    currentVideoIndex < 0? (
                        <EndListMessage 
                            type="initial"
                        />
                    ):(

                        videos?.map((video, index) => {

                            if(currentVideoIndex > videos.length -1){
                                return <EndListMessage type="end"/>
                            }

                            if(
                                (
                                    index !== currentVideoIndex
                                ) && (
                                    previousVideoIndex !== index
                                )
                            ){
                                return null
                            }

                            return (
                                <div 
                                    className={styles.pageContainer}
                                    id={index === previousVideoIndex? (
                                            styles.hidePageContainer
                                        ):''
                                    }
                                    style={{
                                        zIndex: index === currentVideoIndex? 10:1
                                    }}
                                    key={video.video_data.id}
                                >
                                    <Bounce 
                                        bottom={isToSlideVideoUp? false:true}
                                        top={isToSlideVideoUp? true:false}
                                    >

                                    <div 
                                        className={styles.accountAndOptionsContainer}
                                    >

                                        <header>
                                            <Link to={`/user/${video.owner.username}`}>

                                                <img
                                                    alt={video.owner.username}
                                                    src={video.owner.image_url}
                                                />

                                                <div 
                                                    className={styles.videoOwnerInfos}
                                                >
                                                    <h1>{video.owner.username}</h1>
                                                    <h2>
                                                        {video.owner.followers} followers
                                                    </h2>
                                                    <h2>
                                                        Posted on {video.video_data.created_at.split(' ')[0]}
                                                    </h2>
                                                </div>
                                            </Link>
                                            <button
                                                id={
                                                    video.owner.followed? styles.followedButton:''
                                                }
                                                onClick={
                                                    () => {handleFollowAccount(video.owner.id)}
                                                }
                                            >
                                                {video.owner.followed? 'Followed':'Follow'}
                                            </button>
                                        </header>

                                        <div 
                                            className={styles.optionsContainer}
                                        >
                                            <button
                                                id={video.video_data.liked?'':styles.unlikedButton}
                                                onClick={() => {handleLikeVideo(video)}}
                                            >
                                                <img
                                                    alt="Like"
                                                    src="/icons/Like.png"
                                                />
                                                <label>
                                                    {video.video_data.liked? 'Liked':'Like'}
                                                </label>
                                            </button>
                                            <button 
                                                onClick={() => {setIsMuteVideos(!isMuteVideos)}}
                                            >
                                                <img
                                                    src={isMuteVideos? '/icons/Mute.png':'/icons/Unmute.png'}
                                                    alt="mute"
                                                    id={styles.soundImage}
                                                />
                                                <label>
                                                    {isMuteVideos? 'unmute': 'mute'}
                                                </label>
                                            </button>
                                        </div>
                                    </div>

                                    <div className={styles.videoContainer}>
                                        
                                        <video
                                            autoPlay
                                            loop={true}
                                            muted={isMuteVideos}
                                            key={video.url}
                                        >
                                            <source 
                                                src={video.url}
                                                type="video/ogg"
                                            />
                                            Your browser does not support video.
                                        </video>
                                    </div>

                                    <CommentsArea
                                        video={video}
                                    />

                                    </Bounce>

                                </div>
                        )
                        })
                    )
                )
            }
            
            <button 
                className={styles.carouselController}
                id={styles.nextButton}
                onClick={handleNextVideo}
            >
                <img
                    alt="next" 
                    src="/icons/Caret.svg"
                />

            </button>
        </>
    )
}