import {BrowserRouter, Route, Switch} from 'react-router-dom'


//Pages
import {Account} from './Pages/Main'


export function Routes(){
    return (
        <BrowserRouter>
            <Switch>
                <Route path="/" component={Account} />
            </Switch>
        </BrowserRouter>
    )
}