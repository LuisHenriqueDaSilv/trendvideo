import {useEffect, useState} from 'react'
import { useHistory, Link} from 'react-router-dom'

//services
import {logout} from '../../../../Services/Authorization'

import styles from './styles.module.scss'

export function AccountOptions(){

    const history = useHistory()

    const [isOpeningMenu, setIsOpeningMenu ] = useState<boolean>(false)

    const [userimage, setUserimage] = useState<any>()
    const [username, setUsername] = useState<any>()

    useEffect(() => {
        const profileImage = localStorage.getItem('profileImage')
        const username = localStorage.getItem('username')
        setUserimage(profileImage)
        setUsername(username)
    }, [])

    function onClickShowMenu(){
        setIsOpeningMenu(!isOpeningMenu)
    }

    function handleLogout(){
        logout()
        history.push(`/`)
    }

    return(
        <>
            <button 
                onClick={onClickShowMenu}
                className={styles.showMoreButton}
            >
                <img 
                    alt={username} 
                    src={userimage}
                />
                <h1>{username}</h1>
                <img 
                    alt="open" 
                    className={styles.expandIcon} 
                    id={
                        isOpeningMenu?styles.flipedExpandIcon:''
                    }
                    src="/icons/Caret.svg"/>
            </button>
            <div 
                className={styles.accountOptionsContainer}
                id={isOpeningMenu? styles.showOptions:styles.hideOptions}
            >
                <Link  
                    to={`/user/${username}`}
                    className={styles.optionButton}
                >
                    My account
                </Link>
                <Link 
                    className={styles.optionButton}
                    to="/myaccount/videos"
                >
                    My videos
                </Link>
                <Link 
                    className={styles.optionButton}
                    to="/myaccount"
                >
                    Options
                </Link>
                <button
                    onClick={handleLogout}
                    className={styles.optionButton}
                >Logout</button>
            </div>
        </>
    )
}