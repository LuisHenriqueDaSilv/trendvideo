import {Cookies} from 'react-cookie'

//Types
import {VideoType} from '../@types'

//Services
import api from './Api'

export default async function likeVideo(video:VideoType){

    const cookies = new Cookies()
    const token = cookies.get('token')

    const headers = {
        authorization: `Bearer ${token}`
    }

    const data = new FormData()
    data.append('videoId', video.video_data.id.toString())

    const response = await api.post(
        '/video/like', 
        data,
        {
            headers
        }
    ).catch((error) => {
        if(error.response){
            const error_message = error.response.data.message

            return({
                error: true,
                error_message
            })

        }else{
            return({
                error:true,
                error_message: 'Something went wrong in like video process'
            })
        }

    }) as any

    if(!response){
        return({
            error: true,
            error_message: 'Something went wrong in like video process'
        })
    }

    if(response.error){
        return(response)
    }
    
    return(response.data)

}