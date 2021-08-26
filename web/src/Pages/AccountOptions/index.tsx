import {Link, Route} from 'react-router-dom'

import styles from './styles.module.scss'

//Components
import {MyVideos} from './Components/MyVideos'
import {UpdateAccount} from './Components/UpdateAccount'

export function AccountOptions(){

    return (
        <div className={styles.accountOptionsContainer}>

            <div className={styles.pageSelectorContainer}>
                <Link 
                    to="/"
                    className={styles.goToHomeButton}
                >
                    <img 
                        src="/Logo.png"
                        alt="Logo"
                    />
                    <h1>TrendVideo</h1>
                </Link>
                
                <div className={styles.navigationContainer}>
                    <Link to="/myaccount">
                        Edit Account
                    </Link>
                    <Link to="/myaccount/videos">
                        My Videos
                    </Link>
                </div>
            </div>
        
            <div className={styles.router}>
                <Route 
                    path="/myaccount" 
                    exact 
                    component={UpdateAccount}
                />
                <Route 
                    path="/myaccount/videos" 
                    component={MyVideos}
                />
            </div>
        </div>
    )
}