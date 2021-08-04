import {useState} from 'react'
import { useHistory } from 'react-router-dom'

//services
import {logout} from '../../../../Services/authorization'

import styles from './styles.module.scss'

export function AccountOptions(){

    const history = useHistory()

    const [isOpeningMenu, setIsOpeningMenu ] = useState<boolean>(false)

    const onClickShowMenu = () => {
        
        setIsOpeningMenu(!isOpeningMenu)
    }

    const handleLogout = () => {
        logout()
        history.push('/')
    }

    return(
        <>
            <button 
                onClick={onClickShowMenu}
                className={styles.showMoreButton}
            >
                <img 
                    alt="Luis Silva" 
                    src="http://127.0.0.1:5000//account/image/18bfe6bcef914719a9f9f9637bdd60cb-2021-08-03.png"
                />
                <h1>Luis Silva</h1>
                <img 
                    alt="open" 
                    className={styles.expandIcon} 
                    id={
                        isOpeningMenu?styles.flipedExpandIcon:''
                    }
                    src="/Caret.svg"/>
            </button>
            <div 
                className={styles.accountOptionsContainer}
                id={isOpeningMenu? styles.showOptions:styles.hideOptions}
            >
                <button onClick={() => {alert('teste')}}>
                    My account
                </button>
                <button onClick={handleLogout}>Logout</button>
            </div>
        </>
    )
}