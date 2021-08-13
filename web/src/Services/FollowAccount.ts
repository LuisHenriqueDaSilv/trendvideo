import api from './Api'
import {Cookies} from 'react-cookie'

export default async function FollowAccount(accountId:number){

    const cookies = new Cookies()
    const token = cookies.get('token')

    const headers = {
        authorization: `Bearer ${token}`
    }

    const data = new FormData()
    data.append('followed_user_id', accountId.toString())

    const response = await api.post(
        '/account/follow', 
        data,
        {headers}
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
                error_message: 'Something went wrong in follow account process'
            })
        }

    }) as any

    if(response.error){
        return(response)
    }else{
        return(response.data)
    }
}