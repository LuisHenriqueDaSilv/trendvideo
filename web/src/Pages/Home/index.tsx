import { useState, useEffect } from 'react'
import {Route, Link, useLocation} from 'react-router-dom'

import styles from './styles.module.scss'

//Components
import {VideosList} from './Components/VideosList'

export function Home(){

    const location = useLocation()

    return (
        <div className={styles.container}>

            <header className={styles.pageHeader}>

                <Link to="/" className={styles.LogoContainer}>
                    <img src="/Logo.png"/>
                    <h1>TrendVideo</h1>
                </Link>

                <section className={styles.accountContainer}>
                    <img src="http://127.0.0.1:5000//account/image/18bfe6bcef914719a9f9f9637bdd60cb-2021-08-03.png"/>
                    <h1>Luis Silva</h1>
                    <img className={styles.expandIcon} src="/Caret.svg"/>
                </section>

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
                    <button>Search Icon</button>
                </div>
                <button className={styles.searchButton}>
                    +
                </button>
            </footer>

        </div>
    )
}