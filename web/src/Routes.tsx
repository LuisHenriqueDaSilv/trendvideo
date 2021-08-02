import {BrowserRouter, Route, Switch, Redirect} from 'react-router-dom'

//Services
import {isAuthenticated} from './Services/authorization'

//Pages
import {Register} from './Pages/Register'


const AuthenticatedRoute = ({Component, ...rest}:any) => {

    return (
        <Route
            {...rest}
            render={props =>
                isAuthenticated()? (
                    <Component {...props} />
                ) : (
                    <Redirect to={{ pathname: "/", state: { from: props.location } }} />
                )
            }
        />  
    )
}

const UnauthenticatedRoute = ({ Component, ...rest }:any) => {

    return(
        <Route
            {...rest}
            render={props =>
                isAuthenticated() ? (
                    <Redirect to={{ pathname: "/home", state: { from: props.location } }} />
                ) : (
                    <Component {...props} />
                )
            }
        />
    )
}

export function Routes(){
    
    return (
        <BrowserRouter>
            <Switch>
                <AuthenticatedRoute path="/home" Component={() => <h1>Home</h1>}/>
                <UnauthenticatedRoute path="/" Component={Register} />
            </Switch>
        </BrowserRouter>
    )
}