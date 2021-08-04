import {Link} from 'react-router-dom'

//Styles
import styles from './styles.module.scss'

export function Index(){
    return(
        <div className={styles.indexContaienr}>
            <header>
                <h1>Trend Video</h1>
                <p>The place to explore your creativity</p>
            </header>
            <section>
                <Link to="/create-account">
                    <div id={styles.createButton} className={styles.button}>
                        Create Account
                    </div>
                </Link>
                <Link to="/login">
                    <div id={styles.loginButton} className={styles.button}>
                        Login
                    </div>
                </Link>
            </section>
        </div>
    )
}