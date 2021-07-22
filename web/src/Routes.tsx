import {BrowserRouter, Route, Switch} from 'react-router-dom'


//Pages
import {Account} from './pages/Account'


const Main = () => {
    return (
        <h1>main</h1>
    )
} 


export function Routes(){
    return (
        <BrowserRouter>
            <Switch>
                <Route exact path="/" component={Main} />
                <Route path="/account" component={Account} />
            </Switch>
        </BrowserRouter>
    )
}