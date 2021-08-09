import React from 'react'
import {CookiesProvider} from 'react-cookie'
import {Routes} from './Routes'
import './Styles/global.scss'

//Contexts
import {AlertContextProvider} from './Contexts/AlertContext'
import {LoadingContextProvider} from './Contexts/LoadingContext'

//Components
import {Watermark} from './Components/Watermark'

export default function App(){
    return(
        <>
        
            <Watermark/>

            <CookiesProvider>
                <LoadingContextProvider>
                    <AlertContextProvider>
                        <Routes/>
                    </AlertContextProvider>
                </LoadingContextProvider>
            </CookiesProvider>
        </>
    )
}