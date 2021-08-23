import {BrowserRouter, Route, Switch, Redirect} from 'react-router-dom'

//Services
import {isAuthenticated} from './Services/Authorization'

//Pages
import {ForgotPasswordPage} from './Pages/ForgotPasswordPage'
import {Register} from './Pages/Register'
import {Home} from './Pages/Home'
import {VideoPage} from './Pages/Video'
import {AccountInfos} from './Pages/AccountInfos'
import {SearchPage} from './Pages/SearchPage'
import {PostVideoPage} from './Pages/PostVideoPage'
import {AccountOptions} from './Pages/AccountOptions'


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
                <AuthenticatedRoute path="/home" Component={Home}/>
                <AuthenticatedRoute path="/videos" Component={VideoPage}/>
                <AuthenticatedRoute path="/user/:username" Component={AccountInfos}/>
                <AuthenticatedRoute path="/search" Component={SearchPage}/>
                <AuthenticatedRoute path="/video/post" Component={PostVideoPage}/>
                <AuthenticatedRoute path="/myaccount" Component={AccountOptions}/>
                <Route path="/forgot-password" component={ForgotPasswordPage}/>
                <UnauthenticatedRoute path="/" Component={Register} />
            </Switch>
        </BrowserRouter>
    )
}