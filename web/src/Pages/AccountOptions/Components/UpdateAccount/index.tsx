import { useContext, useState } from 'react'
import {Link, useHistory} from 'react-router-dom'
import {useDropzone} from 'react-dropzone'
import {useCookies} from 'react-cookie'

import styles from './styles.module.scss'

//Contexts
import alertContext from '../../../../Contexts/AlertContext'
import loadingContext from '../../../../Contexts/LoadingContext'

//Services
import api from '../../../../Services/Api'
import { logout } from '../../../../Services/Authorization'

require('dotenv/config')

export function UpdateAccount(){
    const history = useHistory()

    const defaultProfileImage = `${process.env.REACT_APP_BACKEND_URL}/account/image/default.jpg`
    const currentProfileImage = localStorage.getItem('profileImage')
    const currentUsername = localStorage.getItem('username')

    const {showAlert} = useContext(alertContext)
    const {disableLoading, enableLoading} = useContext(loadingContext)
    const [cookies] = useCookies(['authorization'])

    const [removeProfileImage, setRemoveProfileImage] = useState<boolean>(false)
    const [newProfileImage, setNewProfileImage] = useState<any>(null)
    const [newUsername, setNewUsername] = useState<string>(currentUsername||'')

    const [
        profileImageUrl, 
        setProfileImageUrl
    ] = useState<string>(currentProfileImage||defaultProfileImage)

    function handleSelectProfileImage(files:any){

        if (!files) {
            return;
        }
        if(!files[0]){
            return
        }

        const file = files[0]

        const allowedsImageTypes = [
            "image/png", 
            "image/jpeg" 
        ]
        if(!allowedsImageTypes.includes(file.type)){
            showAlert({
                title: 'error',
                message: 'Invalid thumbnail file'
            })
            return
        }

        if(removeProfileImage){
            setRemoveProfileImage(!removeProfileImage)
        }

        setNewProfileImage(file)
        setProfileImageUrl(URL.createObjectURL(file))
    }

    function handleRemoveProfileImage(){

        if(removeProfileImage){
            setProfileImageUrl(currentProfileImage||defaultProfileImage)
        }else {
            setNewProfileImage(null)
            setProfileImageUrl(defaultProfileImage)
        }
        setRemoveProfileImage(!removeProfileImage)

    }

    async function handleSubmitUpdateAccount(){

        enableLoading()
        
        const token = cookies.token
        const headers = {
            authorization: `Bearer ${token}`
        }
        const data = new FormData()

        if(newUsername && newUsername !== currentUsername){
            data.append('new_username', newUsername)
        }
        if(removeProfileImage){
            data.append('remove_profile_image', 'True')
        }
        if(newProfileImage){
            data.append('new_profile_image', newProfileImage)
        }

        const response = await api.post(
            '/account/update',
            data,
            {headers}    
        ).catch((error) => {

            
            if(error.response){

                const errorMessage = error.response.data.message
                if(errorMessage === 'Invalid authorization token'){
                    logout()
                    history.push('/')
                }else {
                    showAlert({
                        title: 'error',
                        message: errorMessage
                    })
                }
            }else {
                showAlert({
                    title: 'error',
                    message: 'Something went wrong in update account process'
                })
            }
            return
        })

        if(!response){
            disableLoading()
            return
        }

        localStorage.setItem('profileImage', response.data.new_userdata.image_url)
        localStorage.setItem('username', response.data.new_userdata.username)

        showAlert({
            title: 'update account',
            message: 'Your account are updated with sucess'
        })

        disableLoading()
    }

    const {
        getRootProps:getProfileImageDropzoneRootProps, 
        getInputProps:getProfileImageDropzoneInputProps, 
        isDragActive:profileImageDropzoneIsDragActive
    } = useDropzone({
        onDrop: handleSelectProfileImage
    })

    return (
        <div className={styles.updateAccountContainer}>

            <div className={styles.imageArea}>
                <input
                    {...getProfileImageDropzoneInputProps()}
                />
                <div
                    {...getProfileImageDropzoneRootProps()}
                    className={styles.changeImageDropzone}
                    style={{
                        opacity: profileImageDropzoneIsDragActive? 0.5:1
                    }}
                >
                    <img
                        src={profileImageUrl}
                        alt=""
                    />
                    <p>Click or drop image here to change profile image</p>
                </div>
            
                <button 
                    onClick={handleRemoveProfileImage}
                    id={removeProfileImage? styles.removeImage:''}
                    className={styles.removeImageButton}
                >
                    {removeProfileImage? 'Cancel remove image':'Remove image'}
                </button>
            </div>

            <div className={styles.textArea}>
                <label>New username</label>
                <input 
                    type="text"
                    value={newUsername}
                    onChange={
                        (event) => {setNewUsername(event.target.value)}
                    }
                />
            </div>

            <button 
                className={styles.submitButton}
                onClick={handleSubmitUpdateAccount}
            >
                Submit account update
            </button>
            <Link to="/forgot-password">
                Forgot password
            </Link>
        </div>
    )
}