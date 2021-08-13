import {useEffect, useState, useRef, useContext } from 'react'
import {useHistory, useLocation} from 'react-router-dom'
import Bounce from 'react-reveal/Bounce'


import styles from './styles.module.scss'

import {VideoPageProps, VideoType} from '../../@types'

//Components
import {EndListMessage} from './Components/EndListMessage'

//Services
import {logout} from '../../Services/Authorization'
import likeVideo from '../../Services/LikeVideo'
import getVideos from '../../Services/GetVideos'
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

        if(!location.state){
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

            if(response.error_message === 'video not found'){
                showAlert({
                    message: 'Probably this video was deleted',
                    title: 'error'
                })

            }else if(response.error_message === 'Invalid authorization token'){
                logout()
                history.push('/')

            }else {
                showAlert({
                    message: response.error_message,
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
            if(response.error_message === 'Invalid authorization token'){
                logout()
                history.push('/')
            
            }else {
                showAlert({
                    message: response.error_message,
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
                if(response.error_message === 'Could not find any video'){
                    setHasMoreVideos(false)
                    
                }else if(
                    response.error_message === 'Invalid authorization token'
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


    const autoResizeTextarea = (event:any) => {
        event.target.style.height = 'inherit'
        event.target.style.height = `${event.target.scrollHeight}px`
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
                                            <div>

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
                                            </div>
                                            <button
                                                id={
                                                    video.owner.followed? styles.followedButton:''
                                                }
                                                onClick={
                                                    () => {handleFollowAccount(video.owner.id)}
                                                }
                                            >
                                                {video.owner.followed? 'Followed':'Follow'
                                                }
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

                                    <div className={styles.comentsArea}>
                                        <div className={styles.videoDescriptionContainer}>
                                            <img 
                                                alt="Luis Silva"
                                                src={video.owner.image_url}
                                            />
                                            <div className={styles.videoDescriptionAndInfosContainer}>
                                                <h1>{video.owner.username}</h1>
                                                <p>
                                                    {video.video_data.description}
                                                </p>

                                                <div className={styles.videoInfosContainer}>
                                                    <div>
                                                        <label>12k</label>
                                                        <img
                                                            alt="Comments"
                                                            src="/icons/Comments.png"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label>{video.video_data.likes}</label>
                                                        <img
                                                            alt="Likes"
                                                            src="/icons/Like.png"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={styles.commentsContainer}>
                                            <div className={styles.comment}>
                                                <img 
                                                    alt="Ultimo"
                                                    src="https://i.pinimg.com/236x/c5/16/bb/c516bb6c5d3e2b608977bc5b721b7e75.jpg"
                                                />
                                                <div>
                                                    <h1>Ultimo</h1>
                                                    <p>
                                                        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb  
                                                    </p>
                                                </div>
                                            </div> 
                                        </div>
                                        
                                        <form className={styles.createCommentContainer}>
                                            <textarea onChange={autoResizeTextarea} rows={1}/>
                                            <button type="submit">
                                                Comment
                                            </button>
                                        </form>
                                    </div>
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