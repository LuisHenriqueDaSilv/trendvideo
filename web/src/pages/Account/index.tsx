import {Route} from 'react-router-dom'

//Components
import {Index} from './Components/Index'
import {CreateAccount} from './Components/CreateAccount'
import {Watermark} from '../../components/Watermark'

//Styles
import styles from './styles.module.scss'

export function Account(){
    return(
        <div className={styles.container} >
            <Watermark/>
            <Route path="/account/" exact component={Index}/>
            <Route path="/account/create/" component={CreateAccount}/>
            <Route path="/account/login/" component={() => {return(<h1>account-login</h1>)}}/>
        </div>
    )
}