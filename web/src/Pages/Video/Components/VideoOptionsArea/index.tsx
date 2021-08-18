import {useContext} from 'react'
import {Link, useHistory} from 'react-router-dom'

//Styles
import styles from './styles.module.scss'

//Contexts
import alertContext from '../../../../Contexts/AlertContext'

//Services
import followAccount from '../../../../Services/FollowAccount'
import {logout} from '../../../../Services/Authorization'
import likeVideo from '../../../../Services/LikeVideo'

//Interfaces
import { VideoType } from "../../../../@types";
interface VideoOptionsAreaProps {
    video: VideoType,
    videos: any,
    isMuteVideos: boolean
    setVideos: (value:VideoType[]) => void,
    setIsMuteVideos: (value:boolean) => void,
}

export function VideoOptionsArea(
    {
        video,
        videos,
        setVideos,
        isMuteVideos,
        setIsMuteVideos
    }:VideoOptionsAreaProps
){

    const {showAlert} = useContext(alertContext)
    const history = useHistory()

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

    return (
        <div 
            className={styles.videoOptionsContainer}
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
    )
}