import { useEffect, useState, useContext } from "react"
import { Link, useHistory, useParams } from "react-router-dom"
import {useCookies} from 'react-cookie'
import InfiniteScroll from 'react-infinite-scroll-component'


//Styles
import styles from './styles.module.scss'

//Services
import api from '../../Services/Api'
import {logout} from '../../Services/Authorization'
import {getVideosFromUsername} from '../../Services/GetVideos'
import followAccount from '../../Services/FollowAccount'

//Contexts
import AlertContext from '../../Contexts/AlertContext'

//Components
import {Loading} from '../../Components/Loading'

//Interfaces
import {VideoType, VideoPageProps} from '../../@types'

interface userdataInterface {
    followed: boolean,
    followers: number,
    id: number,
    image_url: string,
    username: string,
    videos: number
}

export function AccountInfos(){

    const [cookies] = useCookies(['authorization'])
    const {showAlert} = useContext(AlertContext)
    
    const history = useHistory()
    const {username} = useParams() as any

    const [userdata, setUserdata] = useState<userdataInterface | null>(null)
    const [videos, setVideos] = useState<VideoType[]>([])
    const [accountNotFound, setAccountNotFound] = useState<boolean>(false)
    const [hasMoreVideos, setHasMoreVideos] = useState<boolean>(true)
    const [isLoadingMoreVideos, setIsLoadingMoreVideos] = useState<boolean>(false)

    useEffect(() => {

        setUserdata(null)
        setAccountNotFound(false)

        getUserInfos()

        // eslint-disable-next-line
    }, [username])

    const getUserInfos = async () => {

        const token = cookies.token

        const headers = {
            authorization: `Bearer ${token}`
        }

        const response = await api.get(
            `/account/${username}`,
            {headers}
        ).catch((error) => {

            if(error.response){

                const errorMessage = error.response.data.message

                if(errorMessage === 'Invalid authorization token') {
                    logout()
                    history.push('/')

                }else if(errorMessage === 'Account not found') {
                    setAccountNotFound(true)
                }else{
                    showAlert({
                        title: 'error',
                        message: errorMessage
                    })
                }

            }else {
                showAlert({
                    title: 'error',
                    message: 'Something went wrong in get account infos'
                })
            }

            return

        })

        if(!response){
            return
        }
        
        setUserdata(response.data.userinfos)
        setVideos(response.data.videos)

    }

    const getMoreVideos = async () => {

        setIsLoadingMoreVideos(true)
        
        const response = await getVideosFromUsername({
            start:videos.length,
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

    const goToVideosPage = (video:VideoType) => {

        const state: VideoPageProps = {
            videos,
            currentVideo: video,
        }


        history.push(`/videos?user=${username}`, state)
    }

    const handleFollowAccount = async () => {

        if(!userdata){
            return
        }

        const response = await followAccount(userdata.id)

        if(response.error){

            if(response.errorMessage === 'Invalid authorization token') {
                logout()
                history.push('/')
            }else {
                showAlert({
                    title: 'error',
                    message: response.errorMessage
                })
            }
            return
        }

        const newUserData = {
            ...userdata
        }

        newUserData.followed = response.message === 'Follow'

        setUserdata(newUserData)
    }

    if(accountNotFound){
        return(
            <div className={styles.container}>
                <h1 className={styles.errorText}>User not found</h1>
            </div>
        )
    }
    
    if(!userdata){
        return(
            <Loading/>
        )
    }

    return (
        <div className={styles.container}>

            <Link to="/">
                <img 
                    src="/Logo.png"
                    alt="Home"
                />
            </Link>

            <header className={styles.infosArea}>

                <img
                    src={userdata.image_url}
                    alt={userdata.username}
                />
                <div className={styles.infosContainer}>
                    <h1>
                        {userdata.username}
                    </h1>
                    <div>
                        <label>{userdata.followers} Followers</label>
                        <label>{userdata.videos} Videos</label>
                    </div>
                    <button 
                        id={userdata.followed? styles.followedButton:''}
                        onClick={handleFollowAccount}
                    >
                        {
                            userdata.followed? 'Followed':'Follow'
                        }
                    </button>
                </div>

            </header>

            <div className={styles.videosArea}>
                <header>
                    
                    <h1>{ videos? 'Videos':"This account don't have videos"}</h1>
                </header>

                <InfiniteScroll 
                    className={styles.videosContainer}

                    dataLength={videos.length}
                    next={() => {getMoreVideos()}}
                    hasMore={hasMoreVideos}
                    loader={
                        <></>
                    }
                    endMessage={
                        <></>
                    }
                >

                    {
                        videos? (
                            videos.map((video) => {
                                return(
                                    <button 
                                        key={video.video_data.id}
                                        className={styles.video}
                                        onClick={() => {goToVideosPage(video)}}
                                        style={{
                                            backgroundImage: `url(${video.video_data.thumbnail_url})`
                                        }}
                                    >
                                        <div className={styles.videoInfoContainer}>
                                            <label>{video.video_data.likes}</label>
                                            <img alt="Likes" src="/icons/Like.png"/>
                                        </div>
                                    </button>
                                )
                            })
                        ): null
                    }

                </InfiniteScroll>

                {
                    hasMoreVideos? (
                        isLoadingMoreVideos&& <h1 className={styles.scrollEndMessage}>Loading more videos</h1>
                    ):(
                        <h1 className={styles.scrollEndMessage}>This account don't have more videos</h1>
                    )
                }
            </div>

        </div>
    )
}