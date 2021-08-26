import {Cookies} from 'react-cookie'

//Services
import api from './Api'

//Interfaces
interface getVideosProps {
    sortBy: 'latest' | 'oldest' | 'most_liked',
    start: number
}

interface getVideosFromUsernameProps {
    username: string,
    start: number
}

interface getFollowedsVideoProps {
    start: number
}

export async function getVideos({sortBy, start}:getVideosProps){

    const cookies = new Cookies()
    const token = cookies.get('token')

    const headers = {
        authorization: `Bearer ${token}`
    }

    const response = await api.get(
        `/videos?order_by=${sortBy}&start=${start}`,
        {headers}
    ).catch((error) => {
        if(error.response){
            const errorMessage = error.response.data.message

            return({
                error: true,
                errorMessage
            })
        }else{
            return({
                error:true,
                errorMessage: 'Something went wrong in get videos process'
            })
        }

    }) as any

    if(!response){
        return({
            error:true,
            errorMessage: 'Something went wrong in get videos process'
        })
    }

    if(response.error){
        return(response)
    }else{
        return(response.data)
    }

}

export async function getVideosFromUsername(
    {
        username, 
        start
    }:getVideosFromUsernameProps
){

    const cookies = new Cookies()
    const token = cookies.get('token')

    const headers = {
        authorization: `Bearer ${token}`
    }

    const response = await api.get(
        `/videos/${username}?start=${start}`,
        {headers}
    ).catch((error) => {
        if(error.response){
            const errorMessage = error.response.data.message

            return({
                error: true,
                errorMessage
            })
        }else{
            return({
                error:true,
                errorMessage: 'Something went wrong in get videos process'
            })
        }

    }) as any

    if(!response){
        return({
            error:true,
            errorMessage: 'Something went wrong in get videos process'
        })
    }

    if(response.error){
        return(response)
    }else{
        return(response.data)
    }
}

export async function getFollowedsVideo({start}:getFollowedsVideoProps){


    const cookies = new Cookies()
    const token = cookies.get('token')

    const headers = {
        authorization: `Bearer ${token}`
    }

    const response = await api.get(
        `/videos/followeds?start=${start}`,
        {headers}
    ).catch((error) => {
        if(error.response){
            const errorMessage = error.response.data.message

            return({
                error: true,
                errorMessage
            })
        }else{
            return({
                error:true,
                errorMessage: 'Something went wrong in get videos process'
            })
        }

    }) as any

    if(!response){
        return({
            error:true,
            errorMessage: 'Something went wrong in get videos process'
        })
    }

    if(response.error){
        return(response)
    }else{
        return(response.data)
    }
    
}