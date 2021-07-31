import {Route} from 'react-router-dom'

//Components
import {Index} from './Components/Index'
import {CreateAccount} from './Components/CreateAccount'
import {Login} from './Components/Login'


import {Watermark} from '../../Components/Watermark'

//Styles
import styles from './styles.module.scss'

export function Register(){
    return(
        <div className={styles.container} >
            <Watermark/>
            <Route path="/" exact component={Index}/>
            <Route path="/create-account/" component={CreateAccount}/>
            <Route path="/login/" component={Login}/>
        </div>
    )
}