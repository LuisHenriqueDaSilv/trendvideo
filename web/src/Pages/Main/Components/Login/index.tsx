import { Link } from 'react-router-dom'
import styles from './styles.module.scss'


export function Login(){
    return (
        <div className={styles.loginContainer}>
            <h1>Login</h1>
            <form>

                <section>
                    <label>
                        Email
                    </label>
                    <input type="text"/>
                </section>
                <section>
                    <label>
                        Password
                    </label>
                    <input type="password"/>
                </section>

                <button>
                    Login
                </button>
                <div className={styles.optionsContainer}>
                    <a style={{textDecoration: 'none'}} href="https://google.com.br" target="__blank">forgot password?</a>
                    <Link style={{textDecoration: 'none'}} to="/create-account" >Don't have account? Create</Link>
                </div>
            </form>
        </div>
    )
}