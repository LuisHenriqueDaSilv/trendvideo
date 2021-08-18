import {Route, Link, useLocation} from 'react-router-dom'

import styles from './styles.module.scss'

//Components
import {VideosList} from './Components/VideosList'
import {AccountOptions} from './Components/AccountOptions'
import {FollowedAccounts} from './Components/FollowedAccounts'

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
                        Creators you follow
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
                    <Route path="/home" exact component={() => {return(<h1>Add here the followed videos</h1>)}}/>
                    <Route path="/home/videos" component={VideosList}/>
                </div>

            </div>

            <footer>
                <div/>
                <div className={styles.searchBarContainer}>
                    <input type="text"/>
                    <button>
                        <img alt="search icon" src="/icons/Search.png"/>
                    </button>
                </div>
                <button className={styles.searchButton}>
                    +
                </button>
            </footer>

        </div>
    )
}