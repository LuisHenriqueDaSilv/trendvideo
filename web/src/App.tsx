import React from 'react'
import {Routes} from './Routes'
import './Styles/global.scss'

//Contexts
import {AlertContextProvider} from './Contexts/AlertContext'

export default function App(){
    return(
        <AlertContextProvider>
            <Routes/>
        </AlertContextProvider>
    )
}