import {Cookies} from 'react-cookie'

//Services
import api from './Api'

//Interfaces
interface getVideosProps {
    sortBy: 'latest' | 'oldest' | 'most_liked',
    start: number
}

export default async function GetVideos({sortBy, start}:getVideosProps){

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