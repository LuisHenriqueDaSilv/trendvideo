//Styles
import styles from './styles.module.scss'

interface AlertProps{
    type: 'error'|'notification',
    percentageToEnd: number,
    message: string
}

export function Alert( {type, percentageToEnd, message} :AlertProps){


    return(
        <div className={styles.alertContainer}>
            <img src="/errorIcon.png"/>
            <section>
                <h1>Error</h1>
                <p>{message}</p>
            </section>
            <label/>{/*to "justify-content: space-between" work*/}
            <div>
                <div
                    style={{
                        width: `calc(${percentageToEnd}* 50rem)`,
                        borderBottomRightRadius: `calc(${percentageToEnd}* 15px)`,
                    }}
                />
            </div>
        </div>
    )
}