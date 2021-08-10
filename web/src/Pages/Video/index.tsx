import {useEffect, useState, useRef } from 'react'
import {useHistory, useLocation} from 'react-router-dom'
import Bounce from 'react-reveal/Bounce'


import styles from './styles.module.scss'

import {VideoPageProps, VideoType} from '../../@types'

//Components
import {EndListMessage} from './Components/EndListMessage'

export function VideoPage(){

    const countdownTimeoutRef = useRef(0);

    const history = useHistory()
    const location = useLocation() as {state: VideoPageProps}

    const [muteVideos, setMuteVideos] = useState<boolean>(true)
    const [videos, setVideos] = useState<VideoType[]>([])
    const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(0)
    const [previousVideoIndex, setPreviousVideoIndex] = useState<number>(0)
    const [isToSlideVideoUp, setIsToSlideVideoUp] = useState<boolean>(true)

    
    useEffect(() => {

        if(!location.state){
            history.push('/')
        }

        const currentVideoIndex_ = location.state.videos.indexOf(location.state.currentVideo) as number
        setVideos(location.state.videos)
        setCurrentVideoIndex(currentVideoIndex_)
        
    // eslint-disable-next-line
    }, [])

    useEffect(() => {

        window.clearTimeout(countdownTimeoutRef.current)
        countdownTimeoutRef.current = window.setTimeout(() => {
            setPreviousVideoIndex(-10)
        }, 500)
    }, [previousVideoIndex])

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

    const handleLikeVideo = (videoId:any) => {
        alert(videoId)
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
                currentVideoIndex >= videos.length? <EndListMessage type="end"/>: (
                    currentVideoIndex < 0? <EndListMessage type="initial"/>:(
                        videos?.map((video, index) => {

                            if(currentVideoIndex > videos.length -1){
                                return <EndListMessage type="end"/>
                            }

                            if(index !== currentVideoIndex && previousVideoIndex !== index){
                                return null
                            }

                            return (
                                <div 
                                    className={styles.pageContainer}
                                    id={index === previousVideoIndex? styles.hidePageContainer:''}
                                    style={{
                                        zIndex: index === currentVideoIndex? 10:1
                                    }}
                                >
                                    <Bounce 
                                        bottom={isToSlideVideoUp? false:true}
                                        top={isToSlideVideoUp? true:false}
                                    >

                                    <div className={styles.accountAndOptionsContainer}>

                                        <header>
                                            <div>
                                                <img 
                                                    alt={video.owner.username}
                                                    src={video.owner.image_url}
                                                />
                                                <div className={styles.videoOwnerInfos}>
                                                    <h1>{video.owner.username}</h1>
                                                    <h2>{video.owner.followers} followers</h2>
                                                    <h2>Posted on {video.video_data.created_at.split(' ')[0]}</h2>
                                                </div>
                                            </div>
                                            <button>Follow</button>
                                        </header>

                                        <div className={styles.optionsContainer}>
                                            <button
                                                id={video.video_data.liked?'':styles.unlikedButton}
                                                onClick={() => {handleLikeVideo(video.video_data.id)}}
                                            >
                                                <img
                                                    alt="Like"
                                                    src="/icons/Like.png"
                                                />
                                                <label>
                                                    {video.video_data.liked? 'Liked':'Like'}
                                                </label>
                                            </button>
                                            <button onClick={() => {setMuteVideos(!muteVideos)}}>
                                                <img
                                                    src={muteVideos? '/icons/Mute.png':'/icons/Unmute.png'}
                                                    alt="mute"
                                                    id={styles.soundImage}
                                                />
                                                <label>
                                                    {muteVideos? 'unmute': 'mute'}
                                                </label>
                                            </button>
                                        </div>
                                    </div>

                                    <div className={styles.videoContainer}>
                                        
                                        <video
                                            autoPlay
                                            loop={true}
                                            muted={muteVideos}
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