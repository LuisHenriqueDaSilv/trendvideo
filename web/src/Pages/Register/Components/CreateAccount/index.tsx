import {useState, FormEvent, useContext} from 'react'
import { Link, useHistory } from 'react-router-dom'

//styles
import styles from './styles.module.scss'

//Services 
import api from '../../../../Services/api'

//Utils 
import {checkPassword, checkUsername} from '../../../../utils/checkUserInfo'

//contexts
import AlertContext from '../../../../Contexts/AlertContext'
import LoadingContext from '../../../../Contexts/LoadingContext'

require('dotenv/config')

export function CreateAccount(){

    const defaultProfileImageUrl = `${process.env.REACT_APP_BACKEND_URL}/account/userimage/default.png`

    const history = useHistory()

    const {showAlert, closeAlert} = useContext(AlertContext)
    const {disableLoading, enableLoading} = useContext(LoadingContext)

    const [username, setUsername] = useState<string>('')
    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [userImage, setUserImage] = useState<any>()
    const [userImageUrl, setUserImageUrl] = useState<string>(defaultProfileImageUrl)


    const handleSubmit = async (event: FormEvent) => {

        
        event.preventDefault()
        enableLoading()
        closeAlert()

        /*
            doing a pre-check of informations in the client-side to get a quick 
            response to the user if any of the information is invalid
        */
        const usernameStatus = checkUsername(username)        
        if(usernameStatus !== 'OK'){
            showAlert({
                title: 'error',
                message: usernameStatus
            })
            disableLoading()
            return
        }
        
        const passwordStatus = checkPassword(password)
        if(passwordStatus !== 'OK'){
            showAlert({
                title: 'error',
                message: passwordStatus
            })
            disableLoading()
            return
        }
        
        if(!email){
            showAlert({
                title: 'error',
                message: 'Email not provided'
            })
            disableLoading()
            return
        }

        const data = new FormData()

        data.append('email', email)
        data.append('password', password)
        data.append('username', username)
        
        if(userImage){
            data.append('userimage', userImage)
        }

        const response:any = await api.post('/account/create', data).catch((error) => {
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

        if(response.data.status === 'OK'){
            showAlert({
                message:'Ok, verify your email to confirm your account.',
                title: 'notification'
            })
            disableLoading()
            history.push('/')
            
        }else{
            showAlert({
                message: 'Something went wrong',
                title: 'error'
            })
            disableLoading()
            return
        }

        
    }

    const handleUserImageSelected = (event:any) => {

        if (!event.target.files) {
            return;
        }

        const files = Array.from(event.target.files)

        if(!files[0]){
            return
        }

        const file = files[0]

        setUserImage(file)
        setUserImageUrl(URL.createObjectURL(file))
    }

    const handleRemoveProfileImage = () => {
        setUserImageUrl(defaultProfileImageUrl)
        setUserImage(null)
    }

    return (
        <div className={styles.createAccountContainer}>
            <h1>Create Account</h1>

            <form onSubmit={handleSubmit}>

                <div className={styles.imageContainer}>
                    <img
                        src={userImageUrl}
                        alt="Profile"
                    />
                    <input 
                        id="imageInput" 
                        onChange={handleUserImageSelected} 
                        type="file" 
                        accept="image/png, image/jpeg" 
                    />
                    <label htmlFor="imageInput">
                        Change Profile Image
                    </label>
                    {
                        userImageUrl !== defaultProfileImageUrl? (
                            <button 
                                onClick={handleRemoveProfileImage} 
                                type="button"
                            >
                                Remove Profile Image
                            </button>
                        ):null
                    }
                </div>

                <section>
                    <label>Username</label>
                    <input 
                        onChange={(event:any) => {setUsername(event.target.value)}}
                        type="text"
                    />
                </section>

                <section>
                    <label>Password</label>
                    <input 
                        onChange={(event:any) => {setPassword(event.target.value)}}
                        type="password"
                    />
                    <p>This password will be used in the account confirmation process</p>
                </section>

                <section>
                    <label>Email</label>
                    <input 
                        onChange={(event:any) => {setEmail(event.target.value)}} 
                        type="text"
                    />
                </section>

                <button type="submit">
                    Create Account
                </button>

                <section>
                    <Link to="/login">already have an account? Login</Link>
                </section>
            </form>


        </div>
    )
}