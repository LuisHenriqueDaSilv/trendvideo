import {Cookies} from 'react-cookie'

export function isAuthenticated(){
    const cookies = new Cookies()

    const token = cookies.get('token')

    return(token && token !== '')
}