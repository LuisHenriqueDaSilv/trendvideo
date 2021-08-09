import {Route} from 'react-router-dom'

//Components
import {Index} from './Components/Index'
import {CreateAccount} from './Components/CreateAccount'
import {Login} from './Components/Login'



//Styles
import styles from './styles.module.scss'

export function Register(){
    return(
        <div className={styles.container} >
            <Route path="/" exact component={Index}/>
            <Route path="/create-account/" component={CreateAccount}/>
            <Route path="/login/" component={Login}/>
        </div>
    )
}