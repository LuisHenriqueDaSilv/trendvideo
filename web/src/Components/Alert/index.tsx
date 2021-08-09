//Styles
import styles from './styles.module.scss'

import {AlertProps} from '../../@types'

export function Alert({
    title, 
    percentageToEnd, 
    message, 
    closeAlert
}:AlertProps){

    return(

        <div className={styles.alertContainer}>
            <img 
                src={
                    title === 'error'? (
                        "/icons/ErrorIcon.png"
                    ):(
                        "/icons/NotificationIcon.png"
                    )
                }
                alt={title === 'error'? "errorIcon":"notificationIcon"}
            />
            <section
                className={
                    title === 'error'? (
                        styles.errorSection
                    ): (
                        styles.notificationSection
                    )
                }>
                <h1>{title}</h1>
                <p>{message}</p>
            </section>
            <div className={styles.closeButtonContainer}>
                <button onClick={closeAlert}>
                    <label>x</label>
                </button>
            </div>
            <div className={styles.alertFooter}>
                <div
                    style={{
                        width: `calc(${percentageToEnd}* 100%)`,
                        borderBottomRightRadius: `calc(${percentageToEnd}* 15px)`,
                    }}
                />
            </div>
        </div>

    )

}