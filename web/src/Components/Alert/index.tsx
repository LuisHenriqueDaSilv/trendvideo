//Styles
import styles from './styles.module.scss'

import {AlertProps} from '../../@types'

export function Alert( {title, percentageToEnd, message, closeAlert} :AlertProps){

    return(
        <div className={styles.alertContainer}>
            <img 
                src={title === 'error'? "/errorIcon.png":"/notificationIcon.png"}
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
            <footer>
                <div
                    style={{
                        width: `calc(${percentageToEnd}* 100%)`,
                        borderBottomRightRadius: `calc(${percentageToEnd}* 15px)`,
                    }}
                />
            </footer>
        </div>
    )
}