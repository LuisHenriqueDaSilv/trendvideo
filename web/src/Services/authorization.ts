import {Cookies} from 'react-cookie'

export function isAuthenticated(){
    const cookies = new Cookies()

    const token = cookies.get('token')

    const hasToken = token && token !== ''

    return(hasToken)
}

export function logout(){
    const cookies = new Cookies()

    cookies.remove('token', {path: '/'})
    localStorage.clear()

}