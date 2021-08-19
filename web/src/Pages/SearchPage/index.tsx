import {Link, useLocation, useHistory} from 'react-router-dom'
import { useCookies } from 'react-cookie'
import { useState } from 'react'

import styles from './styles.module.scss'

//Components
import {SearchBar} from '../../Components/SearchBar'
import { useContext, useEffect } from 'react'

//Contexts
import loadingContext from '../../Contexts/LoadingContext'
import alertContext from '../../Contexts/AlertContext'

//Services
import api from '../../Services/Api'
import {logout} from '../../Services/Authorization'

//Interfaces 
interface AccountInterface {
    username: string,
    followers: string,
    videos: string,
    image_url: string
}

export function SearchPage(){

    const location = useLocation() as any
    const queryParams = new URLSearchParams(location.search) as any
    const searchTerms = queryParams.get('q')

    const history = useHistory()

    const {disableLoading, enableLoading} = useContext(loadingContext)
    const {showAlert} = useContext(alertContext)
    const [cookies] = useCookies(['authorization'])

    const [accounts, setAccounts] = useState<AccountInterface[]>([])
    const [hasResults, setHasResults] = useState<boolean>(false)

    useEffect(() => {
        handleChangeSearchTerms()
        // eslint-disable-next-line
    }, [searchTerms])

    const handleChangeSearchTerms = async () => {
        enableLoading()

        const token = cookies.token

        const headers = {
            authorization: `Bearer ${token}` 
        }

        const response  = await api.get(
            `/accounts/search?q=${searchTerms}`,
            {headers}    
        ).catch((error) => {

            if(error.response){

                const errorMessage = error.response.data.message

                if(errorMessage === 'Invalid authorization token'){
                    logout()
                    history.push('/')
                }else if(errorMessage === 'Could not find any user with this terms'){
                    setAccounts([])
                    setHasResults(false)
                }else {
                    showAlert({
                        title: 'error',
                        message: errorMessage
                    })
                }

            }else {
                showAlert({
                    title: 'error',
                    message: 'Something went wrong in search process'
                })
            }

        })

        if(!response){
            disableLoading()
            return
        }

        disableLoading()
        setAccounts(response.data.results)
        setHasResults(true)

    }

    return (
        <div className={styles.container}>

            <header
                className={styles.pageHeader}
            >
                <Link to="/">
                    <img
                        src="/Logo.png"
                        alt="Home"
                    />
                    <h1>TrendVideo</h1>
                </Link>
                <SearchBar value={searchTerms}/>
            </header>

            <div className={styles.searchResultArea}>
                {   
                    hasResults? (
                        <>
                            <header>
                                <h1>Accounts</h1>
                            </header>
                            <div className={styles.resultsContainer}>
                                {
                                    accounts.map((account) => {
                                        return(
                                            <Link 
                                                className={styles.account}
                                                to={`/user/${account.username}`}
                                                key={account.username}
                                            >
                                                <img
                                                    src={account.image_url}
                                                    alt={account.username}
                                                />
                                                <h1>{account.username}</h1>
                                                <h2>{account.followers} followers</h2>
                                                <h2>{account.videos} videos</h2>
                                            </Link>
                                        )
                                    })
                                }                                                  
                            </div>
                        </>
                    ):(
                        <h1 className={styles.errorText}>We could not find any accounts with these search terms.</h1>
                    )
                }
            </div>
        </div>
    )
}