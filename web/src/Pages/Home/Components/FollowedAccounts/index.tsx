import {useState, useContext, useEffect} from 'react'
import {Link, useHistory} from 'react-router-dom'
import {useCookies} from 'react-cookie'

import styles from './styles.module.scss'


//Services
import api from '../../../../Services/Api'
import {logout} from '../../../../Services/Authorization'

//Contexts
import AlertContext from '../../../../Contexts/AlertContext'

//Interfaces
interface accountInterface {
    username: string,
    image_url: string
}

export function FollowedAccounts(){

    const history = useHistory()

    const [cookies] = useCookies(['authorization'])
    const {showAlert} = useContext(AlertContext)

    const [accounts, setAccounts] = useState<accountInterface[]>([])

    useEffect(() => {
        getFollowedAccounts()
    }, [])

    const getFollowedAccounts = async () => {

        const token = cookies.token

        const headers = {
            authorization: `Bearer ${token}`
        }
        const response = await api.get(
            '/account/following',
            {headers}
        ).catch((error) => {

            if(error.response){

                const errorMessage =error.response.data.message
                if(errorMessage === 'Invalid authorization token'){
                    logout()
                    history.push('/')
                }else {
                    showAlert({
                        title: 'error',
                        message: errorMessage
                    })                    
                }
            }else {
                showAlert({
                    title: 'error',
                    message: 'Something went wrong in get followed accounts process'
                })
            }
            return
        })

        if(!response){
            return
        }

        setAccounts(response.data)

    }

    return (
        <div 
            className={styles.container}
            style={{
                display: accounts.length > 0? 'flex':'none'
            }}
        >
            <header>
                <h1>Accounts followeds</h1>
            </header>
            <div className={styles.accountsContainer}>
                {
                    accounts.map((account) => {
                        return(
                            <Link
                                className={styles.account}
                                to={`/user/${account.username}`}
                            >
                                <img
                                    src={account.image_url}
                                />
                                <h1>{account.username}</h1>
                            </Link>
                        )
                    })
                }

            </div>
        </div>
    )
}