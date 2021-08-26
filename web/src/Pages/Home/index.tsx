import {Route, Link, useLocation} from 'react-router-dom'

import styles from './styles.module.scss'

//Components
import {VideosList} from './Components/VideosList'
import {FollowedVideos} from './Components/FollowedVideos'
import {AccountOptions} from './Components/AccountOptions'
import {FollowedAccounts} from './Components/FollowedAccounts'
import {SearchBar} from '../../Components/SearchBar'

export function Home(){

    const location = useLocation()

    return (
        <div className={styles.container}>

            <FollowedAccounts/>

            <header className={styles.pageHeader}>

                <Link to="/" className={styles.LogoContainer}>
                    <img alt="logo" src="/Logo.png"/>
                    <h1>TrendVideo</h1>
                </Link>

                <AccountOptions/>

            </header>

            <div className={styles.videoListContainer}>

                <header>
                    <Link
                        to="/home"
                        className={
                            location.pathname!=="/home"?
                                (styles.disabledButton) : ''
                        }
                    >
                        Videos by creators you follow
                    </Link>
                    <Link
                        to="/home/videos" 
                        className={
                            location.pathname!=="/home/videos"?
                                styles.disabledButton:''
                        }
                    >
                        All
                    </Link>
                </header>

                <div className={styles.videosRouter}>
                    <Route path="/home" exact component={FollowedVideos}/>
                    <Route path="/home/videos" component={VideosList}/>
                </div>

            </div>

            <footer>
                <div/>

                <SearchBar/>
                <Link
                    to="/video/post" 
                    className={styles.createVideoButton}
                >
                    +
                </Link>
            </footer>

        </div>
    )
}