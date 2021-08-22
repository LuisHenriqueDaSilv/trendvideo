import { useState, useContext} from 'react'
import { useCookies } from 'react-cookie'
import {useDropzone} from 'react-dropzone'
import { useHistory } from 'react-router-dom'

//Contexts
import alertContext from '../../Contexts/AlertContext'

//Services
import api from '../../Services/Api'
import {logout} from '../../Services/Authorization'

import styles from './styles.module.scss'

export function PostVideoPage(){

    const history = useHistory()

    const {showAlert} = useContext(alertContext)
    const [cookies] = useCookies(['authorization'])

    const [videoThumbnail, setVideoThumbnail] = useState<any>()
    const [video, setVideo] = useState<any>()
    const [description, setDescription] = useState<string>('')

    const [videoThumbnailUrl, setVideoThumbnailUrl] = useState<string>('')
    const [videoUrl, setVideoUrl] = useState<string>('')

    function handleDropVideoThumbnail(files:any) {
        if (!files) {
            return;
        }

        if(!files[0]){
            return
        }

        const file = files[0]

        const allowedsImageTypes = [
            "image/png", 
            "image/jpeg" 
        ]

        if(!allowedsImageTypes.includes(file.type)){
            showAlert({
                title: 'error',
                message: 'Invalid thumbnail file'
            })
            return
        }

        setVideoThumbnail(file)
        setVideoThumbnailUrl(URL.createObjectURL(file))
    }

    function handleRemoveVideoThumbnail (){
        setVideoThumbnail(null)
        setVideoThumbnailUrl('')
    }

    function handleDropVideo(files:any){
        if (!files) {
            return;
        }

        if(!files[0]){
            return
        }

        const file = files[0]

        const allowedsImageTypes = [
            "video/webm", 
            "video/ogg",
            "video/mp4" 
        ]

        if(!allowedsImageTypes.includes(file.type)){
            showAlert({
                title: 'error',
                message: 'Invalid video file'
            })
            return
        }

        setVideo(file)
        setVideoUrl(URL.createObjectURL(file))

    }

    function handleRemoveVideo(){
        setVideo(null)
        setVideoUrl('')
    }

    async function handlePostVideo(){

        if(!video){
            showAlert({
                title: 'error',
                message: 'Video not provided'
            })
            return 
        }

        const token = cookies.token
        const headers = {
            authorization: `Bearer ${token}`
        }

        const data = new FormData()
        data.append('video', video)

        if(description){
            data.append('description', description)
        }

        if(videoThumbnail){
            data.append('thumbnail', videoThumbnail)
        }

        const response = await api.post(
            '/video/create',
            data,
            {headers}
        ).catch((error) => {

            if(error.response){
                const errorMessage = error.response.data.message

                if(errorMessage === 'Invalid authorization token'){
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
                    message: 'Something went wrong in posting video process'
                })
            }

            return false
        })

        console.log(response)

        if(!response){
            return
        }

        showAlert({
            title: 'Post Video',
            message: 'Video posted with sucess'
        })
        
        history.push('/')


    }

    function handleChangeTextArea (event:any) {

        setDescription(event.target.value)

        event.target.style.height = 'inherit'
        event.target.style.height = `${event.target.scrollHeight}px`
    }

    const {
        getRootProps: getThumbnailRootProps,
        getInputProps:getThumbnailInputProps,
        isDragActive: thumbnailIsDragActive
    } = useDropzone({
        onDrop: handleDropVideoThumbnail
    })
    const {
        getRootProps: getVideoRootProps,
        getInputProps:getVideoInputProps,
        isDragActive: videoIsDragActive
    } = useDropzone({
        onDrop: handleDropVideo
    })

    return (
        <div
            className={styles.overlay}
        > 
            <div className={styles.container}>

                <section className={styles.videoInfosSection}>

                    <div className={styles.descriptionArea}>
                        <label>Video Description</label>
                        <textarea
                            onChange={handleChangeTextArea}
                            maxLength={200}
                        />
                    </div>

                    <div 
                        className={styles.thumbnailArea}
                    >
                        <input
                            {...getThumbnailInputProps()}
                            style={{
                                display: 'none'
                            }}
                            accept="image/png, image/jpeg" 
                        />
                        <header>
                            <h1>Video Thumbnail</h1>
                        </header>

                        <div>
                            <div 
                                className={styles.thumbnailTextImage}
                            >
                                <label
                                    className={styles.selectThumbnailButton}
                                    {...getThumbnailRootProps()}
                                    style={{
                                        opacity: thumbnailIsDragActive? 0.5:1
                                    }}
                                >
                                    Drop video Thumbnail here or click to search file
                                </label>
                                <button 
                                    onClick={handleRemoveVideoThumbnail}
                                    className={styles.removeThumbnailbutton}
                                >
                                    Remove thumbnail
                                </button>
                            </div>
                            <div 
                                className={styles.thumbnailImage}
                                style={{
                                    backgroundImage: `url(${videoThumbnailUrl})`,
                                    opacity: thumbnailIsDragActive? 0.5:1
                                }}
                                {...getThumbnailRootProps()}

                            />
                        </div>

                    </div>

                    <button 
                        className={styles.postVideoButton}
                        onClick={handlePostVideo}
                    >
                        Post Video
                    </button>

                </section>

                <section className={styles.videoSection}>

                    <div
                        {...getVideoRootProps()}
                        style={{
                            opacity: videoIsDragActive? 0.5:1
                        }}
                    >
                        <input
                            {...getVideoInputProps()}
                            accept="video/webm, video/ogg, video/mp4" 
                        />
                        {
                            videoUrl? (
                                <video
                                    autoPlay
                                    loop={true}
                                    muted={true}
                                    controls={false}
                                    key={videoUrl}
                                >
                                    <source 
                                        src={videoUrl}
                                        type={video.type}
                                    />
                                    Your browser does not support video.
                                </video>
                            ):(
                                <p>
                                    Drop Video here or click to search
                                </p>
                            )
                        }
                    </div>

                    <button
                        onClick={handleRemoveVideo}
                    >
                        Remove Video
                    </button>

                </section>

            </div>
        </div>
    )
}