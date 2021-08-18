import {useEffect, useState, useContext, FormEvent} from 'react'
import {useCookies} from 'react-cookie'
import { useHistory, Link } from 'react-router-dom'

//Styles
import styles from './styles.module.scss'

//Services
import api from '../../../../Services/Api'
import {logout} from '../../../../Services/Authorization'

//Contexts
import AlertContext from '../../../../Contexts/AlertContext'

//Interfaces
import {VideoType} from '../../../../@types'
interface CommentsAreaProps {
    video: VideoType
}

interface CommentInterface {
    content: string,
    id: number,
    comment_is_your: boolean,
    owner: {
        id: number,
        image_url: string,
        username: string
    }
}

export function CommentsArea({video}:CommentsAreaProps){

    const [cookies] = useCookies(['authorization'])
    const history = useHistory()

    const {showAlert} = useContext(AlertContext)

    const [comments, setComments] = useState<CommentInterface[]>([])
    const [isLoadingComments, setIsLoadingComments] = useState<boolean>(true)

    const [commentTextValue, setCommentTextValue] = useState<string>('')
    const [isSendingComment, setIsSendingComment] = useState<boolean>(false)
    const [haveComments, setHaveComments] = useState<boolean>(true)

    useEffect(() => {
        getComments(0)

        // eslint-disable-next-line 
    }, [video])
    
    const getComments = async(start:number) => {

        setIsLoadingComments(true)

        const token = cookies.token

        const headers = {
            authorization: `Bearer ${token}`
        }

        const response = await api.get(
            `/comments/video?start=${start}&video_id=${video.video_data.id}`,
            {headers}
        ).catch((error) => {

            if(error.response){

                const errorMessage = error.response.data.message

                if(errorMessage === 'Invalid authorization token'){
                    logout()
                    history.push('/')

                }else if(errorMessage === 'Could not find any comment') {
                    setHaveComments(false)
                }else {
                    showAlert({
                        message: errorMessage,
                        title: 'error'
                    })
                }
                
            }else {
                showAlert({
                    message: 'Somethin went wrong in get video comments process',
                    title: 'error'
                })
            }

            return
        })

        if(!response){
            setIsLoadingComments(false)
            return
        }

        if(start === 0){
            setComments(response.data)
        }else{
            setComments([...comments, ...response.data])
        }

        setIsLoadingComments(false)

    }

    const handleSubmitComment = async (event:FormEvent) => {

        event.preventDefault()
        
        if(isSendingComment){
            return
        }

        setIsSendingComment(true)
        
        if(!commentTextValue){
            showAlert({
                title: 'error',
                message: 'Comment not provided'
            })

            return 
        }

        const data = new FormData()

        data.append('video_id', video.video_data.id.toString())
        data.append('content', commentTextValue)

        const token = cookies.token
        const headers = {
            authorization: `Bearer ${token}`
        }

        const response = await api.post(
            '/comments/create',
            data, 
            {headers}
        ).catch((error) => {

            if(error.response){

                const errorMessage = error.response.data.message
                
                if(
                    errorMessage === 'Invalid authorization token'
                ){
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
                    message: 'Something went wrong in send comment process'
                })    
            }
            return
        })

        if(!response){
            setIsSendingComment(false)
            return
        }

        const newComment = response.data.comment as CommentInterface

        const newCommentsData = [...comments]

        newCommentsData.unshift(newComment)
        setComments(newCommentsData)

        showAlert({
            title: 'Sucess',
            message: 'Your comment is submited with sucess'
        })

        setCommentTextValue('')
        setIsSendingComment(false)

    }

    const handleDeleteComment = async (comment:CommentInterface) => {

        const token = cookies.token
        const headers = {
            authorization: `Bearer ${token}`
        }

        const data = new FormData()
        data.append('comment_id', comment.id.toString())

        const response = await api.delete(
            '/comments/delete', {
                headers,
                data
            }
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
                    message: 'Something went wrong in delete comment process'
                })
            }

            return 
        })

        if(!response){
            return
        }

        const newCommentsData = [...comments]
        const commentsIds = newCommentsData.map((comment) => {
            return comment.id
        })

        const deletedCommentIndex = commentsIds.indexOf(
            response.data.deleted_comment.id
        )
        newCommentsData.splice(deletedCommentIndex, 1)

        setComments(newCommentsData)

        showAlert({
            title: 'Delete comment',
            message: 'Comment deleted with sucess'
        })

        return
        
    }


    const handleChangeTextArea = (event:any) => {

        setCommentTextValue(event.target.value)

        event.target.style.height = 'inherit'
        event.target.style.height = `${event.target.scrollHeight}px`
    }

    return (
        <div className={styles.container}>

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

            <div
                className={styles.commentsContainer}
            >

                {
                    comments?.map((comment) => {
                        return (
                                <div
                                    className={styles.comment}
                                    key={comment.id}
                                >
                                    <Link
                                        to={`/user/${comment.owner.username}`}
                                    >
                                        <img 
                                            alt={comment.owner.username}
                                            src={comment.owner.image_url}
                                        />
                                    </Link>
                                    <div>
                                        <Link
                                            to={`/user/${comment.owner.username}`}
                                        >
                                            <h1>{comment.owner.username}</h1>
                                        </Link>
                                        <p>
                                            {comment.content}  
                                        </p>
                                        {
                                            comment.comment_is_your&& (
                                                <button
                                                    onClick={() => {handleDeleteComment(comment)}}
                                                >
                                                    Delete comment
                                                </button>
                                            )
                                        }
                                    </div>
                                </div> 
                        )
                    })
                }
                <button
                    disabled={isLoadingComments||!haveComments}
                    onClick={()=> {getComments(comments.length)}}
                    id={haveComments? '':styles.notCommentsButton}
                >
                    {
                        haveComments? (
                            isLoadingComments? 'Loading comments':'Get more comments'
                        ):(
                            'This video not have more comments'
                        )
                    }
                </button>
            </div>
            <form onSubmit={handleSubmitComment} className={styles.createCommentContainer}>
                <textarea
                    onChange={handleChangeTextArea} 
                    rows={1}
                    value={commentTextValue}
                    maxLength={500}
                />
                <button 
                    type="submit"
                    disabled={isSendingComment}
                >
                    {
                        isSendingComment? 'Sending comment':'Comment'
                    }
                </button>
            </form>

        </div>
    )

}