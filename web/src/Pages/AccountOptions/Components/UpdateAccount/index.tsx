import {Link} from 'react-router-dom'

import styles from './styles.module.scss'

export function UpdateAccount(){
    return (
        <div className={styles.updateAccountContainer}>
            <div className={styles.imageArea}>
                <img
                    src="/Logo.png"
                />
                <button>Remove image</button>
            </div>

            <div className={styles.textArea}>
                <label>New username</label>
                <input type="text"/>
            </div>
            <div className={styles.textArea}>
                <label>Your current password</label>
                <input type="text"/>
            </div>

            <button>Update</button>
            <Link to="/forgot-password">
                Forgot password
            </Link>
        </div>
    )
}