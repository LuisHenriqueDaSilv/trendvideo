import {Link} from 'react-router-dom'

//Styles
import styles from './styles.module.scss'

export function Index(){
    return(
        <div className={styles.container}>
            <header>
                <h1>Trend Video</h1>
                <p>The place to explore your creativity</p>
            </header>
            <section>
                <Link style={{textDecoration: 'none'}} to="/account/create">
                    <div id={styles.createButton} className={styles.button}>
                        Create Account
                    </div>
                </Link>
                <Link style={{textDecoration: 'none'}} to="/account/login">
                    <div id={styles.loginButton} className={styles.button}>
                        Login
                    </div>
                </Link>
            </section>
        </div>
    )
}