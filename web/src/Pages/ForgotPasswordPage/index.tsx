import { FormEvent, useContext, useState} from 'react'
import {useHistory} from 'react-router-dom'

import styles from './styles.module.scss'


//Services
import api from '../../Services/Api'

//Contexts
import alertContext from '../../Contexts/AlertContext'
import loadingContext from '../../Contexts/LoadingContext'

export function ForgotPasswordPage(){

    const history = useHistory()

    const {showAlert} = useContext(alertContext)
    const {enableLoading, disableLoading} = useContext(loadingContext)

    const [userEmail, setUserEmail] = useState<string>('')

    async function handleSubmitChangePasswordRequest(event: FormEvent){
        event.preventDefault()

        if(!userEmail){
            showAlert({
                title: 'error',
                message: 'Email not provided'
            })
            return
        }

        enableLoading()

        const data = new FormData()
        data.append('email', userEmail)

        const response = await api.post(
            '/account/update/password',
            data
        ).catch((error) => {
            if(error.response){
                const errorMessage = error.response.data.message
                showAlert({
                    title: 'error',
                    message: errorMessage
                })
            }else {
                showAlert({
                    title: 'error',
                    message: 'Something went wrong in send change password request'
                })
            }
            return
        })

        if(!response){
            disableLoading()
            return
        }

        showAlert({
            title: 'Sucess',
            message: 'Check your email to change your password'
        })

        disableLoading()
        history.push('/')
    }

    return (
        <div className={styles.container}>
            <div className={styles.infosAreas}>
                
                <h1>
                    Forgot password
                </h1>

                <form onSubmit={handleSubmitChangePasswordRequest}>
                    
                    <div className={styles.inputArea}>
                        <label>
                            Email used in create account process
                        </label>
                        <input 
                            onChange={
                                (event) => {setUserEmail(event.target.value)}
                            }
                            type="text"
                        />
                    </div>

                    <p>
                        When sending a password change request you will receive
                        an email to proceed with changing your password
                    </p>
                    <button type="submit">
                        Send change password request
                    </button>
                </form>
            </div>
        </div>
    )
} 