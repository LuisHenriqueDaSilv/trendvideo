import { useState, FormEvent, useContext } from 'react'
import { Link, useHistory } from 'react-router-dom'
import {useCookies} from 'react-cookie'

//Services
import api from '../../../../Services/Api'

//contexts
import AlertContext from '../../../../Contexts/AlertContext'
import LoadingContext from '../../../../Contexts/LoadingContext'

//Styles
import styles from './styles.module.scss'

export function Login(){

    const history = useHistory()

    // eslint-disable-next-line
    const [cookies, setCookie] = useCookies(['authorization'])

    const {showAlert, closeAlert} = useContext(AlertContext)
    const {disableLoading, enableLoading} = useContext(LoadingContext)

    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')

    const handleSubmitLogin = async (event:FormEvent) => {
        event.preventDefault()

        enableLoading()
        closeAlert()

        if(!password){
            showAlert({
                title:'error',
                message: 'Password not provided'
            })
            disableLoading()
            return
        }
        if(!email){
            showAlert({
                title:'error',
                message: 'Email not provided'
            })
            disableLoading()
            return
        }

        const data = new FormData()

        data.append('email', email)
        data.append('password', password)

        const response = await api.post(
            '/account/login', 
            data
        ).catch((error) => {
            if(error.response){
                showAlert({
                    message: error.response.data.message,
                    title: 'error'
                })
            }else {
                showAlert({
                    message: 'Something went wrong',
                    title: 'error'
                })
            }
            
            return null
        })

        if(!response){
            disableLoading()
            return
        }
        
        if(response.data.status === 'ok'){
            
            setCookie('token', response.data.token, {path: '/'})
            localStorage.setItem('profileImage', response.data.user.image_url)
            localStorage.setItem('username', response.data.user.username)

            history.push('/')
            
        }else{
            showAlert({
                message: 'Something went wrong',
                title: 'error'
            })
        }

        disableLoading()
    }


    return (
        <div className={styles.loginContainer}>
            <h1>Login</h1>
            <form onSubmit={handleSubmitLogin}>
                <section>
                    <label>
                        Email
                    </label>
                    <input
                        type="text"
                        onChange={(event:any) => {setEmail(event.target.value)}}
                    />
                </section>
                <section>
                    <label>
                        Password
                    </label>
                    <input 
                        type="password"
                        onChange={(event:any) => {setPassword(event.target.value)}}
                    />
                </section>

                <button>
                    Login
                </button>
                <div className={styles.optionsContainer}>
                    <Link
                        style={{textDecoration: 'none'}} 
                        to="/forgot-password" 
                    >
                        forgot password?
                    </Link>
                    <Link 
                        style={{textDecoration: 'none'}}
                        to="/create-account"
                    >
                        Don't have account? Create
                    </Link>
                </div>
            </form>
        </div>
    )
}