import {useState, FormEvent} from 'react'
import { Link } from 'react-router-dom'

//styles
import styles from './styles.module.scss'

//Services 
import api from '../../../../Services/api'

require('dotenv/config')

export function CreateAccount(){

    const defaultProfileImageUrl = `${process.env.REACT_APP_BACKEND_URL}/account/userimage/default.png`

    const [username, setUsername] = useState<string>('')
    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [userImage, setUserImage] = useState<any>()
    const [userImageUrl, setUserImageUrl] = useState<string>(defaultProfileImageUrl)


    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()

        /*
            doing a pre-check of the client-side information to get a faster 
            response to the user if any of the information is invalid
        */
 
        if(!username){
            return alert('Username not provided')
        }
        if(username.length >20){
            return alert('Username cannot be longer than 20 characters')
        }
        if(username.length < 5){
            return alert('Username cannot be lowest than 5 characters')
        }
        if (username.trim().includes(' ')){
            return alert('Username cannot have blank spaces')
        }

        if(!password){
            return alert('Password not provided')
        }
        if(password.length > 30){
            return alert('Password cannot be longer than 30 characters')
        }
        if(password.length <8){
            return alert('Password cannot be lowest than 8 characters')
        }
        if(password.trim().includes(' ')){
            return alert('Password cannot have blank spaces')
        }

        if(!email){
            return alert('Email not provided')
        }

        const data = new FormData()

        if(userImage){
            data.append('userimage', userImage)
        }

        data.append('email', email)
        data.append('password', password)
        data.append('username', username)

        const response:any = await api.post('/account/create', data).catch((error) => {
            if(error.response){
                alert(error.response.data.message)
                return null
            }
            alert('Something went wrong')
            return null
        })

        if(!response){
            return
        }

        if(response.data.status === 'OK'){
            alert('Ok, verify your email to confirm your account.')
        }

        
    }

    const handleUserImageSelected = (event:any) => {

        if (!event.target.files) {
            return;
        }

        const files = Array.from(event.target.files)

        setUserImage(files[0])
        setUserImage(URL.createObjectURL(files[0]))
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
                    />
                    <input id="imageInput" onChange={handleUserImageSelected} type="file" accept="image/png, image/jpeg" />
                    <label htmlFor="imageInput">
                        Change Profile Image
                    </label>
                    {
                        userImageUrl !== defaultProfileImageUrl? (
                            <button onClick={handleRemoveProfileImage} type="button">
                                Remove Profile Image
                            </button>
                        ):null
                    }
                </div>

                <section>
                    <label>Username</label>
                    <input onChange={(event:any) => {setUsername(event.target.value)}} type="text"/>
                </section>

                <section>
                    <label>Password</label>
                    <input onChange={(event:any) => {setPassword(event.target.value)}} type="password"/>
                    <p>This password will be used in the account confirmation process</p>
                </section>

                <section>
                    <label>Email</label>
                    <input onChange={(event:any) => {setEmail(event.target.value)}} type="text"/>
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