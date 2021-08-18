import {useEffect, useState, useRef, useContext } from 'react'
import {useHistory, useLocation} from 'react-router-dom'
import Bounce from 'react-reveal/Bounce'


import styles from './styles.module.scss'

import {VideoPageProps, VideoType} from '../../@types'

//Components
import {EndListMessage} from './Components/EndListMessage'
import {CommentsArea} from './Components/CommentsArea'
import {VideoOptionsArea} from './Components/VideoOptionsArea'

//Services
import {logout} from '../../Services/Authorization'
import {getVideos, getVideosFromUsername} from '../../Services/GetVideos'

//Contexts
import AlertContext from '../../Contexts/AlertContext'


export function VideoPage(){

    const countdownTimeoutRef = useRef(0);

    const history = useHistory()
    const location = useLocation() as {state: VideoPageProps, search:any}
    const queryParams = new URLSearchParams(location.search)
    
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
    const [videosOwnerUsername, setVideosOwnerUsername] = useState<string>('')    
    const [
        isLoadingMoreVideos, 
        setIsLoadingMoreVideos
    ] = useState<boolean>(false)
    const [hasMoreVideos, setHasMoreVideos] = useState<boolean>(true)

    
    useEffect(() => {

        const username = queryParams.get('user')

        if(!location.state || !location.state.videos){
            if(username){
                history.push(`/user/${username}`)
            }else {
                history.push('/')
            }

            return
        }

        const currentVideoIndex_ = location.state.videos.indexOf(
            location.state.currentVideo
        ) as number
        
        setVideos(location.state.videos)
        setCurrentVideoIndex(currentVideoIndex_)

        if(location.state.sortBy){
            setSortBy(location.state.sortBy)
        }
        if(username){
            setVideosOwnerUsername(username)
        }
        
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

    const handleGetMoreVideos = async () => {

        if(!hasMoreVideos || isLoadingMoreVideos){
            return
        }
        
        setIsLoadingMoreVideos(true)

        let response: any = false 

        if(videosOwnerUsername){

            response = await getVideosFromUsername({
                start: videos.length,
                username: videosOwnerUsername
            })

        }else {

            response = await getVideos({
                sortBy: sortBy,
                start:videos.length
            }) as any
        }
        


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

                                    <VideoOptionsArea
                                        isMuteVideos={isMuteVideos}
                                        setIsMuteVideos={setIsMuteVideos}
                                        setVideos={setVideos}
                                        video={video}
                                        videos={videos}
                                    />

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